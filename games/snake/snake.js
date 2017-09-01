const Snake = {
    // setup is a function that returns the initial state of the game
    resources: {
        images: {
            death: 'death.png'
        }
    },
    render: function(c, s, r) {
        c.clear();
        var tail = s.snake.tail;
        var xsize = Math.floor(c.elm.width / s.grid.width);
        var ysize = Math.floor(c.elm.height / s.grid.height);
        var spacing = Math.ceil(xsize * 0.1);
        var box_spacing = 1;
        var text_spacing = 40;
        c.ctx.fillStyle = 'black';

        var offset = {
            x: Math.floor((c.elm.width - (xsize * s.grid.width)) / 2),
            y: Math.floor((c.elm.height - (ysize * s.grid.height)) / 2)
        };

        function drawRectWithOffset(colour, x, y, w, h) {
            c.ctx.fillStyle = colour;
            c.ctx.fillRect(x + offset.x, y + offset.y, w, h);
        }


        for (var i = 0; i < tail.length; i++) {

            if (i === 0) {
                if (s.snake.dir === 1) {
                    // head up
                    drawRectWithOffset('blue', (xsize * tail[i].x) + spacing, (ysize * tail[i].y) + spacing, xsize - (spacing * 2), ysize - spacing);
                } else if (s.snake.dir === 3) {
                    // head down
                    drawRectWithOffset('blue', (xsize * tail[i].x) + spacing, (ysize * tail[i].y), xsize - (spacing * 2), ysize - (spacing * 2));
                } else if (s.snake.dir === 2) {
                    // head right
                    drawRectWithOffset('blue', (xsize * tail[i].x), (ysize * tail[i].y) + spacing, xsize - spacing, ysize - (spacing * 2));
                } else if (s.snake.dir === 4) {
                    // head left
                    drawRectWithOffset('blue', (xsize * tail[i].x) + spacing, (ysize * tail[i].y) + spacing, xsize - spacing, ysize - (spacing * 2));
                }
            } else if (i === tail.length - 1) {
                if (tail[i - 1].x === tail[i].x && tail[i - 1].y === tail[i].y + 1) {
                    // tail up
                    drawRectWithOffset('black', (xsize * tail[i].x) + spacing, (ysize * tail[i].y) + spacing, xsize - (spacing * 2), ysize - spacing);
                } else if (tail[i - 1].x === tail[i].x && tail[i - 1].y === tail[i].y - 1) {
                    // tail down
                    drawRectWithOffset('black', (xsize * tail[i].x) + spacing, (ysize * tail[i].y), xsize - (spacing * 2), ysize - (spacing * 2));
                } else if (tail[i - 1].y === tail[i].y && tail[i - 1].x === tail[i].x - 1) {
                    // tail right
                    drawRectWithOffset('black', (xsize * tail[i].x), (ysize * tail[i].y) + spacing, xsize - spacing, ysize - (spacing * 2));
                } else if (tail[i - 1].y === tail[i].y && tail[i - 1].x === tail[i].x + 1) {
                    // tail left
                    drawRectWithOffset('black', (xsize * tail[i].x) + spacing, (ysize * tail[i].y) + spacing, xsize - spacing, ysize - (spacing * 2));
                }
            } else {
                if (tail[i - 1].x === tail[i].x && tail[i].x === tail[i + 1].x) {
                    // body vertical
                    drawRectWithOffset('black', (xsize * tail[i].x) + spacing, (ysize * tail[i].y), xsize - (spacing * 2), ysize);
                } else if (tail[i - 1].y === tail[i].y && tail[i].y === tail[i + 1].y) {
                    // body horizontal
                    drawRectWithOffset('black', (xsize * tail[i].x), (ysize * tail[i].y) + spacing, xsize, ysize - (spacing * 2));
                } else if ((tail[i - 1].y === tail[i].y - 1 && tail[i + 1].x === tail[i].x + 1) || (tail[i - 1].x === tail[i].x + 1 && tail[i + 1].y === tail[i].y - 1)) {
                    // body 'L' shape
                    // h
                    drawRectWithOffset('black', (xsize * tail[i].x) + spacing, (ysize * tail[i].y) + spacing, xsize - spacing, ysize - (spacing * 2));
                    // v
                    drawRectWithOffset('black', (xsize * tail[i].x) + spacing, (ysize * tail[i].y), xsize - (spacing * 2), ysize - (spacing * 2));
                } else if ((tail[i - 1].y === tail[i].y + 1 && tail[i + 1].x === tail[i].x + 1) || (tail[i - 1].x === tail[i].x + 1 && tail[i + 1].y === tail[i].y + 1)) {
                    // body 'r' shape
                    // h
                    drawRectWithOffset('black', (xsize * tail[i].x) + spacing, (ysize * tail[i].y) + spacing, xsize - spacing, ysize - (spacing * 2));
                    // v
                    drawRectWithOffset('black', (xsize * tail[i].x) + spacing, (ysize * tail[i].y) + spacing, xsize - (spacing * 2), ysize - spacing);
                } else if ((tail[i - 1].y === tail[i].y + 1 && tail[i + 1].x === tail[i].x - 1) || (tail[i - 1].x === tail[i].x - 1 && tail[i + 1].y === tail[i].y + 1)) {
                    // body '7' shape
                    // h
                    drawRectWithOffset('black', (xsize * tail[i].x), (ysize * tail[i].y) + spacing, xsize - spacing, ysize - (spacing * 2));
                    // v
                    drawRectWithOffset('black', (xsize * tail[i].x) + spacing, (ysize * tail[i].y) + spacing, xsize - (spacing * 2), ysize - spacing);
                } else if ((tail[i - 1].y === tail[i].y - 1 && tail[i + 1].x === tail[i].x - 1) || (tail[i - 1].x === tail[i].x - 1 && tail[i + 1].y === tail[i].y - 1)) {
                    // body 'J' shape
                    // h
                    drawRectWithOffset('black', (xsize * tail[i].x), (ysize * tail[i].y) + spacing, xsize - spacing, ysize - (spacing * 2));
                    // v
                    drawRectWithOffset('black', (xsize * tail[i].x) + spacing, (ysize * tail[i].y), xsize - (spacing * 2), ysize - (spacing * 2));
                } else {
                    // unknown shape
                    drawRectWithOffset('black', (xsize * tail[i].x) + spacing, (ysize * tail[i].y) + spacing, xsize - (spacing * 2), ysize - (spacing * 2));
                }
            }

        }

        drawRectWithOffset('green', xsize * s.fruit.x, ysize * s.fruit.y, xsize, ysize);

        for (var i = 0; i < s.walls.length; i++) {
            c.image(r.images.death, (xsize * s.walls[i].x) + (xsize/2) + offset.x, (ysize * s.walls[i].y) + (ysize/2) + offset.y, xsize, ysize, 0);
        }

        c.ctx.strokeStyle = 'black';
        var border_dimen = {
            w: c.elm.width - (offset.x * 2),
            h: c.elm.height - (offset.y * 2)
        };
        c.ctx.strokeRect(offset.x, offset.y, border_dimen.w, border_dimen.h);

        if (s.at === 'ready' || s.at === 'dead') {
            c.ctx.fillStyle = 'white';
            c.ctx.fillRect(box_spacing, box_spacing, c.elm.width - (box_spacing * 2), c.elm.height - (box_spacing * 2));
            c.ctx.strokeStyle = 'black';
            c.ctx.strokeRect(box_spacing, box_spacing, c.elm.width - (box_spacing * 2), c.elm.height - (box_spacing * 2));
            c.ctx.fillStyle = 'black';
            c.ctx.font = '36px sans-serif';
            if (s.at === 'ready') {
                c.ctx.fillText('Press space to start!', (text_spacing * 2), (text_spacing * 3));
            } else if (s.at === 'dead') {
                c.ctx.fillText('You died! Score: ' + tail.length, (text_spacing * 2), (text_spacing * 3));
                c.ctx.fillText('Press space to restart', (text_spacing * 2), (text_spacing * 5));
            }
        }
    },
    watch: {
        at: {
            transition: ['play', 'dead'],
            then: function(state){
                return {
                    submit: ['jack', 'snake', state.snake.length]
                }
            }
        }
    },
    setup: function(){
        const grid = {
            width: 7,
            height: 7,
        };
        const start_tail = [
            {x: 2, y: 2},
            {x: 1, y: 2},
            {x: 0, y: 2}
        ];
        return {
            at: 'ready',
            snake: {
                dir: 2,
                nextDir: 2,
                length: 3,
                tail: [
                    {x: 2, y: 2},
                    {x: 1, y: 2},
                    {x: 0, y: 2}
                ]
            },
            hazards: {
                shrink: 6,
                wall: 4
            },
            walls: [],
            fruit: Snake.util.freeSpot({
                snake: {
                    tail: start_tail
                },
                walls: []
            }, {x: -1, y: -1}, grid),
            grid: grid,
            frameCounter: [0, 12, 12],
            allowedDirs: [1, 2, 3, 4]
        }
    },
    // update is a function that takes the previous state of the game, input form the user, and the time step
    update: function(s, inputs, dt){
        let state = Object.assign({}, s);
        const dirs = {
            up: 1,
            right: 2,
            down: 3,
            left: 4
        };
        if(state.at === 'play'){
            state.frameCounter[0]++;

            for(let d in dirs){
                if(inputs[0][d] && state.snake.dir !== Snake.util.rotateFour(dirs[d])){
                    state.snake.nextDir = dirs[d];
                }
            }

            if(state.frameCounter[0] >= state.frameCounter[1]){
                state.frameCounter[0] = 0;

                state.snake.dir = state.snake.nextDir;

                if(state.allowedDirs.indexOf(state.snake.dir) === -1){
                    state.snake.dir = 1;
                }

                let next = Object.assign({}, state.snake.tail[0]);
                let dead = false;
                switch(state.snake.dir){
                    case 1:
                        if(next.y === 0){
                            dead = true;
                        } else {
                            next.y--;
                        }
                        break;
                    case 2:
                        if(next.x === state.grid.width-1){
                            dead = true
                        } else {
                            next.x++;
                        }
                        break;
                    case 3:
                        if(next.y === state.grid.height-1){
                            dead = true;
                        } else {
                            next.y++;
                        }
                        break;
                    case 4:
                        if(next.x === 0){
                            dead = true;
                        } else {
                            next.x--;
                        }
                        break;
                    default:
                        dead = true;
                }

                if(Snake.util.collide(next, state.fruit)){
                    state.snake.length++;


                    if(state.snake.length === 15){
                        state.hazards.wall--;
                    }

                    if(state.snake.length === 30){
                        state.hazards.wall--;
                        state.hazards.shrink++;
                    }

                    if(state.snake.length === 45){
                        state.hazards.wall--;
                        state.hazards.shrink++;
                    }

                    if(state.snake.length%state.hazards.wall === 0){
                        let wall_spot = Snake.util.freeSpotAway(state, next, state.grid, 5);
                        if(wall_spot !== null){
                            state.walls.push(wall_spot);
                        }
                    }

                    if(state.snake.length%state.hazards.shrink === 0){
                        state.snake.tail = state.snake.tail.map(piece => ({x: piece.x+1, y: piece.y+1}));
                        state.walls = state.walls.map(wall => ({x: wall.x+1, y: wall.y+1}));
                        next.x++;
                        next.y++;
                        state.grid.width += 2;
                        state.grid.height += 2;

                        if((state.grid.width+1)%4 === 0){
                            if(state.frameCounter[1] > 4){
                                state.frameCounter[1]--;
                            }
                        }
                    }
                    let fruit_spot = Snake.util.freeSpot(state, next, state.grid);
                    if(fruit_spot !== null){
                        state.fruit = fruit_spot;
                    } else {
                        state.at = 'dead';
                    }
                } else {
                    for(let i = 0; i < state.walls.length; i++){
                        if(Snake.util.collide(state.walls[i], next)){
                            dead = true;
                        }
                    }
                    for(let i = 0; i < state.snake.tail.length; i++){
                        if(Snake.util.collide(state.snake.tail[i], next)){
                            dead = true;
                        }
                    }
                }

                if(dead){

                    state.at = 'dead';

                } else {

                    state.snake.tail.unshift(next);
                    while(state.snake.tail.length > state.snake.length){
                        state.snake.tail.pop();
                    }

                }

            }
        } else if(state.at === 'ready'){
            if(inputs[0].space){
                state.at = 'play';
            }
        } else if(state.at === 'dead'){
            if(inputs[0].space){
                state = Snake.setup();
                state.at = 'play';
            }
        }
        return state;
    },
    // utility functions used throughout the game
    util: {
        randomSpot: function(grid){
            return {
                x: Math.floor(Math.random() * grid.width),
                y: Math.floor(Math.random() * grid.height)
            }
        },
        collide: function(a, b){
            return (a.x === b.x && a.y === b.y);
        },
        freeSpot: function(state, head, grid){
            let spot = {x:0, y:0};
            let unavail = true;
            let tail = state.snake.tail;
            let iter = 0;
            while(unavail){
                iter++;
                unavail = false;
                if(iter < 50) {
                    spot = Snake.util.randomSpot(grid);
                    if(spot === null){
                        return false;
                    }
                    if (Snake.util.collide(spot, head)) {
                        unavail = true;
                    } else {
                        for (let i = 0; i < state.walls.length; i++){
                            if(Snake.util.collide(spot, state.walls[i])){
                                unavail = true;
                            }
                        }
                        for (let i = 0; i < tail.length; i++) {
                            if (Snake.util.collide(spot, tail[i])) {
                                unavail = true;
                            }
                        }
                    }
                } else {
                    return null;
                }
            }
            return spot;

        },
        distance: function(a, b){
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            return Math.sqrt((dx * dx) + (dy * dy));
        },
        freeSpotAway(state, head, grid, x){
            let spot = {x: 0, y: 0};
            let distant = true;
            let iter = 0;
            while(distant){
                iter++;
                distant = false;
                if(iter < 50){
                    spot = Snake.util.freeSpot(state, head, grid);
                    if(spot === null){
                        return null;
                    }
                    if(Snake.util.distance(spot, head) <= x || spot.x === 0 || spot.y === 0 || spot.x === grid.width-1 || spot.y === grid.height-1){
                        distant = true;
                    }
                } else {
                    return null;
                }
            }
            return spot;
        },
        rotateFour(n){
            let o = (n+2)%4;
            return o === 0 ? 4 : o;
        }
    },
    multiplayer: {
        accept: function(state, players){
            // function that returns whether or not the game is accepting new players
            return false;
        },
        join: function(state, players){
            // function that changes the state when a new player joins
            var s = Object.assign({}, state);

            return s;
        },
        leave: function(state, players){
            // function that changes the state when a player leaves
            var s = Object.assign({}, state);

            return s;
        }
    },
};

module.exports = Snake;