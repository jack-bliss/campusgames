const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();
const http = require('http').Server(app);

const ScoreAPI = require('./score-api.js');

const io = require('socket.io')(http);

const database = __dirname + '/database/';

const KineScript = require('./games/KineScript.js');

const LegalGames = ["snake", "tictactoe", "zoomerang"];

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, './dist')));

const port = process.env.PORT || 3001;

let games = [];
let nextid = 0;

io.on('connection', function(socket){
    let GameFuncs;

    console.log('connected');

    socket.on('find_game', function(info){
        for(var i = 0; i < games.length; i++){
            var game = games[i];
            if(game && game.name === info.gameName && game.running && game.multiplayer.accept(game.state, game.players.length)){
                game.players.push(socket.id);
                game.inputs.push(info.input);
                console.log(game.inputs);
                io.sockets.connected[socket.id].emit('ready', {
                    id: game.id,
                    render: game.render,
                    resources: game.resources,
                    state: game.state,
                    socket: socket.id
                });
                game.state = game.multiplayer.join(game.state, game.players.length);
                return true;
            }
        }
        io.sockets.connected[socket.id].emit('cant_find');
    });

    socket.on('new_game', function(info){
        if(LegalGames.indexOf(info.game) === -1){
            return false;
        }
        GameFuncs = require('./games/'+info.game+'/'+info.game+'.js');
        var myid = nextid;
        nextid++;
        games[myid] = {
            update: GameFuncs.update,
            watch: GameFuncs.watch,
            state: GameFuncs.setup(KineScript),
            render: GameFuncs.render.toString(),
            multiplayer: GameFuncs.multiplayer,
            inputInterval: setInterval(function(){
                var game = games[myid];
                if(game && game.running){

                    const dt = Date.now() - game.prevTime;
                    var prev_state = game.state;
                    if(game.inputs.length === game.players.length && game.players.length !== 0){
                        game.state = game.update(game.state, game.inputs, dt, KineScript);
                    } else {
                        game.prevTime = Date.now();
                        return false;
                    }

                    game.prevTime = Date.now();

                    for(var i = 0; i < game.players.length; i++){
                        io.sockets.connected[game.players[i]].emit('state', {
                            state: game.state,
                            player: i
                        });
                    }

                    for(var watch in game.watch){
                        if(game.watch.hasOwnProperty(watch)){
                            var watcher = game.watch[watch];
                            if(watcher.hasOwnProperty('transition')){
                                var prev_val = watcher.transition[0];
                                var next_val = watcher.transition[1];
                                if(prev_state[watch] === prev_val && game.state[watch] === next_val){
                                    let then = watcher.then(game.state);
                                    for(let method in then){
                                        ScoreAPI[method](...then[method]);
                                    }
                                }
                            }
                        }
                    }
                }
            }, 1000/60),
            running: false,
            prevTime: Date.now(),
            name: info.game,
            channel: info.channel,
            players: [socket.id],
            resources: {},
            inputs: [],
            id: myid
        };
        var resos = {};
        if(GameFuncs.resources.hasOwnProperty('static')){
            resos.static = GameFuncs.resources.static;
        }
        var prom;
        if(GameFuncs.resources.hasOwnProperty('images')){
            var ps = [];
            resos.images = {};
            for(var img in GameFuncs.resources.images){
                (function(name){
                    ps.push(new Promise(function(resolve, reject){
                         fs.readFile('./games/'+info.game+'/images/'+GameFuncs.resources.images[name], function(err, data){
                             resos.images[name] = 'data:image/png;base64,' + (new Buffer(data).toString('base64'));
                             resolve(true);
                         });
                    }));
                })(img);
            }
            prom = Promise.all(ps);
        } else {
            prom = Promise.resolve(true);
        }
        prom.then(function(){
            var game = games[myid];
            game.resources = resos;
            io.sockets.connected[socket.id].emit('ready', {
                id: myid,
                render: game.render,
                resources: game.resources,
                state: game.state,
                socket: socket.id
            });
        });
    });
    socket.on('loaded', function(info){
        var game = games[info.id];
        game.inputs[game.players.indexOf(info.socket)] = info.input;
        game.running = true;

    });
    socket.on('input', function(data){
        let game = games[data.id];
        if(!game){
            return false;
        }
        game.inputs[game.players.indexOf(data.socket)] = data.input;
    });
    socket.on('disconnect', function(){
        console.log('disconnected');
        games = games.filter(function(game){
            if(game.players.indexOf(socket.id) > -1 && game.players.length === 1){
                clearInterval(game.inputInterval);
                return false;
            } else {
                var i = game.players.indexOf(socket.id);
                game.players.splice(i, 1);
                game.inputs.splice(i, 1);
                game.state = game.multiplayer.leave(game.state, game.players.length);
                return true;
            }
        });
    });
});



app.get('*', (req, res) => {
    res.sendFile(__dirname + '/dist/index.html');
});

http.listen(port, () => console.log('Listening on port', port));
