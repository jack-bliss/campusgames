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

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, './dist')));

const port = process.env.PORT || 3001;

let players = {};

var c = 0;

io.on('connection', function(socket){
    let GameFuncs;

    console.log('connected');

    socket.on('start', function(info){
        GameFuncs = require('./games/'+info.game+'/'+info.game+'.js');
        players[socket.id] = {
            update: GameFuncs.update,
            watch: GameFuncs.watch,
            state: GameFuncs.setup(KineScript),
            inputInterval: setInterval(function(){
                if(players[socket.id].running){
                    io.sockets.connected[socket.id].emit('state', players[socket.id].state);
                }
            }, 1000/60),
            running: false,
            prevTime: Date.now(),
            game: info.game,
            channel: info.channel
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
            io.sockets.connected[socket.id].emit('ready', {
                id: socket.id,
                render: GameFuncs.render.toString(),
                resources: resos,
                state: players[socket.id].state
            });
        });
    });
    socket.on('loaded', function(socketID){
        console.log('loaded');
        players[socketID].running = true;
    });
    socket.on('input', function(data){
        let player = players[data.id];
        if(!player){
            return false;
        }
        const dt = Date.now() - player.prevTime;
        let prev_state = player.state;

        player.state = player.update(player.state, data.input, dt, KineScript);
        player.prevTime = Date.now();

        for(let watch in player.watch){
            if(player.watch.hasOwnProperty(watch)){
                let watcher = player.watch[watch];
                if(watcher.hasOwnProperty('transition')){
                    let prev_val = watcher.transition[0];
                    let next_val = watcher.transition[1];
                    if(prev_state[watch] === prev_val && player.state[watch] === next_val){
                        let then = watcher.then(player.state);
                        for(let method in then){
                            ScoreAPI[method](...then[method]);
                        }
                    }
                }
            }
        }
    });
    socket.on('disconnect', function(){
        console.log('disconnected');
        if(players.hasOwnProperty(socket.id)){
            let player = players[socket.id];
            clearInterval(player.inputInterval);
            delete players[socket.id];
        }
    });
});



app.get('*', (req, res) => {
    res.sendFile(__dirname + '/dist/index.html');
});

http.listen(port, () => console.log('Listening on port', port));
