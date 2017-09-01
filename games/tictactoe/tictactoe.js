const TicTacToe = {
    setup: function(KS){
        var w = 600;
        var h = 600;
        return {
            at: 'waiting',
            turn: Math.round(Math.random()),
            winner: -1,
            ready: {
                0: false,
                1: false
            },
            grid: [
                [-1, -1, -1],
                [-1, -1, -1],
                [-1, -1, -1]
            ],
            areas: {
                extent: {
                    w: w,
                    h: h
                },
                rows: [[0, 200], [201, 400], [401, 600]],
                cols: [[0, 200], [201, 400], [401, 600]]
            }
        }
    },
    update: function(state, inputs, dt, KS, player){
        var s = Object.assign({}, state);
        if(s.at === "playing"){
            var ap = s.turn%2;
            var inp = inputs[ap];
            if(typeof inp === 'undefined'){
                s.turn--;
                var ap = s.turn%2;
                var inp = inputs[ap];
            }
            if(inp.mouse.click){
                var row = -1;
                var col = -1;
                for(var i = 0; i < state.areas.rows.length; i++){
                    if(inp.mouse.y >= state.areas.rows[i][0] && inp.mouse.y <= state.areas.rows[i][1]){
                        row = i;
                    }
                }
                for(var i = 0; i < state.areas.cols.length; i++){
                    if(inp.mouse.x >= state.areas.cols[i][0] && inp.mouse.x <= state.areas.cols[i][1]){
                        col = i;
                    }
                }

                if(s.grid[row][col] === -1){
                    s.grid[row][col] = ap;
                    var won = false;
                    for(var i = 0; i < s.grid.length; i++){
                        if(s.grid[i][col] !== ap){
                            break;
                        }
                        if(i === s.grid.length-1){
                            won = true;
                        }
                    }
                    for(var i = 0; i < s.grid[0].length; i++){
                        if(s.grid[row][i] !== ap){
                            break;
                        }
                        if(i === s.grid[0].length-1){
                            won = true;
                        }
                    }
                    if(row === col){
                        for(var i = 0; i < s.grid.length; i++){
                            if(s.grid[i][i] !== ap){
                                break;
                            }
                            if(i === s.grid.length-1){
                                won = true;
                            }
                        }
                    }
                    if(row + col === s.grid.length-1){
                        for(var i = 0; i < s.grid.length; i++){
                            if(s.grid[i][(s.grid.length-1)-i] !== ap){
                                break;
                            }
                            if(i === s.grid.length-1){
                                won = true;
                            }
                        }
                    }
                    if(won){
                        s.winner = ap;
                        s.at = "over";
                    } else {
                        var draw = true;
                        for(var i = 0; i < s.grid.length; i++){
                            draw = draw && s.grid[i].indexOf(-1) === -1;
                        }
                        if(draw){
                            s.at = "over";
                        } else {
                            s.turn++;
                        }
                    }
                }

            }
        } else if(s.at === "over"){
            for(var i = 0; i < inputs.length; i++){
                if(inputs[i].space){
                    s.ready[i] = true;
                }
            }
            var everyone = true;
            for(var x in s.ready){
                if(s.ready[x] !== true){
                    everyone = false;
                }
            }
            if(everyone){
                s.ready = {};
                s = TicTacToe.setup();
                s.at = "playing";
            }
        }
        return s;
    },
    render: function(draw, state, resources, player){
        draw.clear();
        draw.ctx.textAlign = 'center';
        if(state.at === 'playing'){
            if(state.turn%2 === player){
                draw.write(300, 20, "It's your turn!");
            }
            var i = 0, j = 0;
            for(i = 0; i < state.areas.rows.length -1; i++){
                draw.ctx.beginPath();
                draw.ctx.moveTo(0, state.areas.rows[i][1]);
                draw.ctx.lineTo(state.areas.extent.w, state.areas.rows[i][1]);
                draw.ctx.closePath();
                draw.ctx.stroke();
            }
            for(i = 0; i < state.areas.cols.length - 1; i++){
                draw.ctx.beginPath();
                draw.ctx.moveTo(state.areas.cols[i][1], 0);
                draw.ctx.lineTo(state.areas.cols[i][1], state.areas.extent.h);
                draw.ctx.closePath();
                draw.ctx.stroke();
            }

            for(i = 0; i < state.grid.length; i++){
                for(j = 0; j < state.grid[i].length; j++){
                    if(state.grid[i][j] !== -1){
                        draw.write(100 + (j*200), 100 + (i*200), resources.static.symbols[state.grid[i][j]]);
                    }
                }
            }

        } else if(state.at === 'waiting'){
            draw.write(100, 100, 'Waiting for players. . . ');
        } else if(state.at === 'over'){
            if(state.winner === player){
                draw.write(300, 200, "You won!");
            } else if(state.winner === -1){
                draw.write(300, 200, "It's a draw!");
            } else {
                draw.write(300, 200, "You lost!");
            }
            if(state.ready[player] !== true){
                draw.write(300, 300, "Press space to play again.");
            } else {
                draw.write(300, 300, "Waiting for other player. . . ");
            }
        }
    },
    multiplayer: {
        accept: function(state, players){
            return state.at === 'waiting';
        },
        join: function(state, players){
            var s = Object.assign({}, state);
            s.at = 'playing';
            return s;
        },
        leave: function(state, players){
            // function that changes the state when a player leaves
            var s = Object.assign({}, state);
            s.clicks = [];
            s.at = 'waiting';
            return s;
        }
    },
    resources: {
        static: {
            symbols: ["X", "O"]
        }
    },
    watch: {},
    util: {}
};

module.exports = TicTacToe;