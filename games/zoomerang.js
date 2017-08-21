var Zoomerang = {
    setup: function(KS){

        return {
            prevAt: 'start',
            at: 'start',
            targets: [
                Zoomerang.util.pickTargetSpot(KS),
                Zoomerang.util.pickTargetSpot(KS)
            ],
            aim: {
                power: 20,
                angle: 0,
                curve: 0,
                return: 0
            },
            boomerang: {
                x: Zoomerang.resources.static.boom_start.x,
                y: Zoomerang.resources.static.boom_start.y,
                dx: 0,
                dy: 0,
                ddx: 0,
                ddy: 0,
                w: 10,
                h: 10
            },
            score: 0,
            path: [],
            buttonHover: '',
            prevMouse: false,
            click_counter: 0
        }
    },
    update: function(state, input, dt, KS){
        var s = Object.assign({}, state);

        // state progression
        if(s.at === 'start' && input.space){
            s.at = 'aiming';
        } else if(s.at === 'aiming'){
            s.buttonHover = '';
            for(var btype in Zoomerang.resources.static.buttons){
                var bclass = Zoomerang.resources.static.buttons[btype];
                for(var bname in bclass.sub){
                    var button = bclass.sub[bname];
                    var PIS = KS.pointInShape(input.mouse, {
                        x: button.x + bclass.x,
                        y: button.y + bclass.y,
                        w: button.w,
                        h: button.h
                    });
                    if(PIS){
                        s.buttonHover = btype+"_"+bname;
                        if(input.mouse.click && s.prevMouse){
                            s.click_counter++;
                        }
                        if(input.mouse.click && !s.prevMouse || input.mouse.click && s.click_counter === 8){
                            var parts = button.click.split("|");
                            if(parts[1] === 'up'){
                                s.aim[parts[0]]++;
                            } else if(parts[1] === 'down'){
                                s.aim[parts[0]]--;
                            } else if(parts[1] === 'jumpup'){
                                s.aim[parts[0]]+=5;
                            } else if(parts[1] === 'jumpdown'){
                                s.aim[parts[0]]-=5;
                            } else if(parts[0] === 'state'){
                                s.at = parts[1];
                            }
                            s.path = Zoomerang.util.tracePath(s.aim);
                            s.click_counter = 0;
                        }
                    }
                }
            }
            if(s.aim.power < 0) {
                s.aim.power = 0;
            } else if(s.aim.power > 100){
                s.aim.power = 100;
            }
        } else if(s.at === 'throwing'){

            // update position

            s.boomerang.dx += s.boomerang.ddx * (dt/1000);
            s.boomerang.dy += s.boomerang.ddy * (dt/1000);
            s.boomerang.x += s.boomerang.dx * (dt/1000);
            s.boomerang.y += s.boomerang.dy * (dt/1000);

            // round values

            for(var x in s.boomerang){
                s.boomerang[x] = KS.roundToN(s.boomerang[x], 1);
            }

            // collect targets

            var l = s.targets.length;
            s.targets = s.targets.filter(function(tg){
                var tgbox = {
                    x: tg.x,
                    y: tg.y,
                    w: Zoomerang.resources.static.target.w,
                    h: Zoomerang.resources.static.target.h
                };
                return !KS.boxCollide(s.boomerang, tgbox);
            });
            if(s.targets.length < l){
                s.score++;
            }

            // clear if out of bounds

            if(s.boomerang.x < Zoomerang.resources.static.play_field.x[0]){
                s.at = 'aiming';
            }
            if(s.boomerang.x > Zoomerang.resources.static.play_field.x[1]){
                s.at = 'aiming';
            }
            if(s.boomerang.y < Zoomerang.resources.static.play_field.y[0]){
                s.at = 'aiming';
            }
            if(s.boomerang.y > Zoomerang.resources.static.play_field.y[1]){
                s.at = 'aiming';
            }

        }

        // state transitions
        if(s.prevAt === 'aiming' && s.at === 'throwing'){

            // DO THROW

            s.boomerang = Object.assign(s.boomerang, Zoomerang.util.calcLaunch(s.aim));

        } else if(s.prevAt === 'throwing' && s.at === 'aiming'){

            // RESET

            s.boomerang = {
                w: 10,
                h: 10,
                x: Zoomerang.resources.static.boom_start.x,
                y: Zoomerang.resources.static.boom_start.y,
                dx: 0,
                dy: 0,
                ddx: 0,
                ddy: 0
            };
            s.score -= s.targets.length === 0 ? 0 : 1;
            while(s.targets.length < 2){
                s.targets.push(Zoomerang.util.pickTargetSpot(KS));
            }

        } else if(s.prevAt === 'start' && s.at === 'aiming'){

            // initial

            s.path = Zoomerang.util.tracePath(s.aim);

        }

        s.prevAt = s.at;
        s.prevMouse = input.mouse.click;

        return s;
    },
    render: function(draw, state, resources){
        draw.ctx.textAlign = 'center';
        draw.clear();
        // bounding box
        draw.box({
            x: 300,
            y: 300,
            w: 598,
            h: 598
        });
        if(state.at === 'start'){
            draw.write(300, 200, "Press the space bar to begin!");
        } else if(state.at === 'aiming' || state.at === 'throwing'){

            draw.write(580, 20, state.score);

            if(state.at === 'aiming'){
                draw.ctx.beginPath();
                for(var i = 0; i < state.path.length-1; i++){
                    draw.ctx.moveTo(state.path[i].x, state.path[i].y);
                    draw.ctx.lineTo(state.path[i+1].x, state.path[i+1].y);
                }
                draw.ctx.stroke();
                draw.ctx.closePath();
            }

            // playing field
            var fieldw = (resources.static.play_field.x[1] - resources.static.play_field.x[0]);
            var fieldh = (resources.static.play_field.y[1] - resources.static.play_field.y[0]);
            draw.box({
                x: resources.static.play_field.x[0] + (fieldw/2),
                y: resources.static.play_field.y[0] + (fieldh/2),
                w: fieldw,
                h: fieldh
            });

            // draw target

            for(var i = 0; i < state.targets.length; i++) {
                draw.rect({
                    x: state.targets[i].x,
                    y: state.targets[i].y,
                    w: resources.static.target.w,
                    h: resources.static.target.h
                }, 'orange');
            }

            // draw boomerang

            draw.rect(state.boomerang);

            // draw buttons
            for(var btype in resources.static.buttons){
                var bclass = resources.static.buttons[btype];
                if(btype !== 'throw'){
                    draw.write(bclass.x, bclass.y, btype);
                    draw.write(bclass.x, bclass.y-30, state.aim[btype]);
                }
                for(var btn in bclass.sub){
                    var button = bclass.sub[btn];
                    var colour = 'white';
                    if(state.buttonHover === btype+"_"+btn && state.at === 'aiming'){
                        colour = 'green';
                    }
                    draw.rect({
                        x: bclass.x + button.x,
                        y: bclass.y + button.y,
                        w: button.w,
                        h: button.h
                    }, colour);
                    draw.box({
                        x: bclass.x + button.x,
                        y: bclass.y + button.y,
                        w: button.w,
                        h: button.h
                    });
                    draw.write(
                        bclass.x + button.x,
                        bclass.y + button.y + (button.h/3),
                        button.text
                    );
                }
            }
        }
    },
    resources: {
        static: {
            play_field: {
                x: [80, 580],
                y: [50, 450]
            },
            boom_start: {
                x: 330,
                y: 450
            },
            target: {
                w: 20,
                h: 20
            },
            buttons: {
                throw: {
                    x: 330,
                    y: 480,
                    sub: {
                        throw: {
                            x: 0,
                            y: 30,
                            w: 100,
                            h: 25,
                            text: 'THROW',
                            click: 'state|throwing'
                        }
                    }
                },
                power: {
                    x: 40,
                    y: 60,
                    sub: {
                        up: {
                            x: -15,
                            y: 30,
                            w: 16,
                            h: 25,
                            text: '↑',
                            click: 'power|up'
                        },
                        down: {
                            x: -15,
                            y: 60,
                            w: 16,
                            h: 25,
                            text: '↓',
                            click: 'power|down'
                        },
                        jumpup: {
                            x: 15,
                            y: 30,
                            w: 24,
                            h: 25,
                            text: '↑↑',
                            click: 'power|jumpup'
                        },
                        jumpdown: {
                            x: 15,
                            y: 60,
                            w: 24,
                            h: 25,
                            text: '↓↓',
                            click: 'power|jumpdown'
                        }
                    }
                },
                angle: {
                    x: 40,
                    y: 200,
                    sub: {
                        up: {
                            x: -15,
                            y: 30,
                            w: 16,
                            h: 25,
                            text: '↑',
                            click: 'angle|up'
                        },
                        down: {
                            x: -15,
                            y: 60,
                            w: 16,
                            h: 25,
                            text: '↓',
                            click: 'angle|down'
                        },
                        jumpup: {
                            x: 15,
                            y: 30,
                            w: 24,
                            h: 25,
                            text: '↑↑',
                            click: 'angle|jumpup'
                        },
                        jumpdown: {
                            x: 15,
                            y: 60,
                            w: 24,
                            h: 25,
                            text: '↓↓',
                            click: 'angle|jumpdown'
                        }
                    }
                },
                curve: {
                    x: 40,
                    y: 340,
                    sub: {
                        up: {
                            x: -15,
                            y: 30,
                            w: 16,
                            h: 25,
                            text: '↑',
                            click: 'curve|up'
                        },
                        down: {
                            x: -15,
                            y: 60,
                            w: 16,
                            h: 25,
                            text: '↓',
                            click: 'curve|down'
                        },
                        jumpup: {
                            x: 15,
                            y: 30,
                            w: 24,
                            h: 25,
                            text: '↑↑',
                            click: 'curve|jumpup'
                        },
                        jumpdown: {
                            x: 15,
                            y: 60,
                            w: 24,
                            h: 25,
                            text: '↓↓',
                            click: 'curve|jumpdown'
                        }
                    }
                },
                return: {
                    x: 40,
                    y: 480,
                    sub: {
                        up: {
                            x: -15,
                            y: 30,
                            w: 16,
                            h: 25,
                            text: '↑',
                            click: 'return|up'
                        },
                        down: {
                            x: -15,
                            y: 60,
                            w: 16,
                            h: 25,
                            text: '↓',
                            click: 'return|down'
                        },
                        jumpup: {
                            x: 15,
                            y: 30,
                            w: 24,
                            h: 25,
                            text: '↑↑',
                            click: 'return|jumpup'
                        },
                        jumpdown: {
                            x: 15,
                            y: 60,
                            w: 24,
                            h: 25,
                            text: '↓↓',
                            click: 'return|jumpdown'
                        }
                    }
                }
            }
        }
    },
    watch: {},
    util: {
        pickTargetSpot: function(KS){
            var x_range = [Zoomerang.resources.static.play_field.x[0]+10, Zoomerang.resources.static.play_field.x[1]-10]
            var y_range = [Zoomerang.resources.static.play_field.y[0]+10, Zoomerang.resources.static.play_field.y[1]-10]
            return new KS.Vector2(KS.randomInRange(x_range), KS.randomInRange(y_range));
        },
        calcLaunch: function(aim){
            var powerScale = 10;
            return {
                dx: aim.power * powerScale * Math.sin(aim.angle/30),
                dy: aim.power * -1 * powerScale * Math.cos(aim.angle/30),
                ddx: aim.power * -1 * aim.curve * 0.5 * Math.sign(aim.angle),
                ddy: (powerScale * aim.return)
            }
        },
        tracePath: function(aim){
            var np = {
                x: Zoomerang.resources.static.boom_start.x,
                y: Zoomerang.resources.static.boom_start.y
            };
            var r = [];
            var dtE = 1000/60;
            var oob = false;

            var launch = Zoomerang.util.calcLaunch(aim);
            var iter = 0;


            while(!oob && iter < 250){
                iter++;
                r.push(np);

                launch.dx += launch.ddx * (dtE/1000);
                launch.dy += launch.ddy * (dtE/1000);
                np = {
                    x: np.x + launch.dx * (dtE/1000),
                    y: np.y + launch.dy * (dtE/1000)
                };

                if(np.x < Zoomerang.resources.static.play_field.x[0] || np.x > Zoomerang.resources.static.play_field.x[1]){
                    oob = true;
                }
                if(np.y < Zoomerang.resources.static.play_field.y[0] || np.y > Zoomerang.resources.static.play_field.y[1]){
                    oob = true;
                }
            }

            return r;
        }
    }

};

module.exports = Zoomerang;