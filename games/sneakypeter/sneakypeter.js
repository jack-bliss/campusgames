const SneakyPeter = {
    setup: function(){
        return {
            at: 'running',
            score: 0,
            current_score: 0,
            time: 0,
            player: {
                x: 300,
                y: 300,
                dx: 0,
                ddx: 0,
                state: 'stand',
                frames: 0,
                dstate: false,
                dxmax: 3,
                dxmaxdef: 3,
                w: 20,
                h: 20,
                colour: 'black'
            },
            bounds: {
                left: 20,
                right: 580
            },
            enemy: {
                type: 'slugger'
            },
            target: {
                type: 'coin',
                x: 500,
                y: 300,
                w: 10,
                h: 10,
                colour: 'orange'
            },
            enemy_types: ['slugger', 'swooper', 'faker'],
            target_types: ['coin', 'amulet', 'crown']
        }
    },
    update: function(state, i, dt){
        var s = Object.assign({}, state);
        if(s.at === 'stop'){
            return s;
        }

        var dState = SneakyPeter.util.setState;
        var rnd = SneakyPeter.util.roundToN;

        var p = s.player;
        var pu = Math.abs(p.dx);
        p.dstate = false;
        p.frames++;

        var dashaccel = 1.5;
        var ddxmax = 0.5;
        var stand_friction = 0.3;
        var stand_thresh = 0.01;
        var dashframes = 15;
        var break_friction = 0.05;

        s.time += dt;

        // state management

        if(p.state === 'stand' && !p.dstate){
            p.colour = 'black';
            if(i.left){
                dState(p, 'dashL');
            } else if(i.right){
                dState(p, 'dashR');
            }
            p.ddx = -1 * stand_friction * p.dx;
            if(pu < stand_thresh){
                p.dx = 0;
                p.ddx = 0;
            }
        }
        if(p.state === 'dashL' && !p.dstate){
            p.colour = 'green';
            if(i.right){
                p.dx = 0;
                dState(p, 'dashR');
            } else {
                if(p.frames < dashframes){

                    if(i.left){
                        p.dxmax += ddxmax;
                    }
                    if(p.dx > -1*p.dxmax){
                        p.ddx = -1*dashaccel;
                    } else {
                        p.dx = -1*p.dxmax;
                        p.ddx = 0;
                    }

                } else {

                    if(i.left){
                        dState(p, 'runL');
                    } else {
                        dState(p, 'stand');
                    }

                }
            }
        }
        if(p.state === 'dashR' && !p.dstate){
            p.colour = 'green';
            if(i.left){
                p.dx = 0;
                dState(p, 'dashL');
            } else {

                if(p.frames < dashframes){

                    if(i.right){
                        p.dxmax += ddxmax;
                    }
                    if(p.dx < p.dxmax){
                        p.ddx = dashaccel;
                    } else {
                        p.dx = p.dxmax;
                        p.ddx = 0;
                    }

                } else {

                    if(i.right){
                        dState(p, 'runR');
                    } else {
                        dState(p, 'stand');
                    }

                }
            }
        }
        if(p.state === 'runL' && !p.dstate){
            p.colour = 'blue';
            if(i.left){
                if(pu < p.dxmax){
                    p.ddx = -1*dashaccel;
                } else {
                    p.dx = -1*p.dxmax;
                    p.ddx = 0;
                }
            } else if(i.right){
                dState(p, 'breakL');
            } else {
                p.ddx = -1 * stand_friction * p.dx;
            }
            if(p.dx > -1 * stand_thresh){
                dState(p, 'stand');
            }
        }
        if(p.state === 'runR' && !p.dstate){
            p.colour = 'blue';
            if(i.right){
                if(pu < p.dxmax){
                    p.ddx = dashaccel;
                } else {
                    p.dx = p.dxmax;
                    p.ddx = 0;
                }
            } else if(i.left){
                dState(p, 'breakR');
            } else {
                p.ddx = -1 * stand_friction * p.dx;
            }
            if(p.dx < stand_thresh){
                dState(p, 'stand');
            }
        }
        if(p.state === 'breakL' && !p.dstate){
            p.colour = 'red';
            p.ddx = -1 * break_friction * p.dx;
            if(pu < stand_thresh){
                dState(p, 'dashR');
            }
        }
        if(p.state === 'breakR' && !p.dstate){
            p.colour = 'red';
            p.ddx = -1 * break_friction * p.dx;
            if(pu < stand_thresh){
                dState(p, 'dashL');
            }
        }

        // update player

        p.ddx = rnd(p.ddx, 5);
        p.dx = rnd(p.dx, 5);

        p.dx += p.ddx;
        p.x += p.dx;

        p.x = rnd(p.x, 5);

        // collisions

        s.current_score = SneakyPeter.util.getScoreFromTime(s.time);

        if(SneakyPeter.util.boxCollide(p, s.target)){
            s.score += s.current_score;
            s.target.x = -50;
        }

        if(p.x < s.bounds.left){
            p.x = s.bounds.left;
            p.dx = 0;
            if(s.target.x = -50){
                s.time = 0;
                s.target.x = 500;
            }
        } else if(p.x > s.bounds.right){
            p.x = s.bounds.right;
        }

        return s;
    },

    render: function(c, s, r){
        c.clear();

        c.box({x: 300, y: 300, w: 598, h: 598});

        c.write(20, 40, s.score);
        c.write(20, 80, s.current_score);
        c.write(20, 120, s.time);

        c.rect(s.player);
        c.rect(s.target);
    },

    resources: {

    },
    watch: {

    },
    util: {
        setState: function(player, state){
            if(!player.dstate){
                player.state = state;
                player.dstate = true;
                player.frames = 0;
                if(state === 'dashL' || state === 'dashR'){
                    player.dxmax = player.dxmaxdef;
                }
            }
        },
        roundToN: function(x, n){
            var o = x * Math.pow(10, n);
            return Math.round(o) / Math.pow(10, n);
        },
        Vector2: function(x, y){
            this.x = x;
            this.y = y;
            this.cross = function(vector){
                return (this.x * vector.y) - (vector.x * this.y);
            };
            this.dot = function(vector){
                return (this.x * vector.x) + (this.y * vector.y);
            };
            this.length = function(){
                return Math.sqrt((this.x*this.x) + (this.y*this.y));
            };
            return this;
        },
        boxToPointList: function(box){
            var V2 = SneakyPeter.util.Vector2;
            return [
                new V2(box.x - (box.w / 2), box.y - (box.h / 2)),
                new V2(box.x + (box.w / 2), box.y - (box.h / 2)),
                new V2(box.x + (box.w / 2), box.y + (box.h / 2)),
                new V2(box.x - (box.w / 2), box.y + (box.h / 2))
            ];
        },
        lineIntersect: function(l1, l2){
            // p1 and p2 are either end of line 1
            // p3 and p4 are either end of line 2
            // if p12 x p13 and p12 x p14 have opposite parity, and
            // if p34 x p31 and p34 x p32 have opposite parity
            // then the line segments overlap

            var p1 = l1[0];
            var p2 = l1[1];
            var p3 = l2[0];
            var p4 = l2[1];

            var V2 = SneakyPeter.util.Vector2;

            var p12 = new V2(p2.x - p1.x, p2.y - p1.y);
            var p13 = new V2(p3.x - p1.x, p3.y - p1.y);
            var p14 = new V2(p4.x - p1.x, p4.y - p1.y);

            var p34 = new V2(p4.x - p3.x, p4.y - p3.y);
            var p31 = new V2(p1.x - p3.x, p1.y - p3.y);
            var p32 = new V2(p2.x - p3.x, p2.y - p3.y);

            var p12x13 = p12.cross(p13);
            var p12x14 = p12.cross(p14);

            var p34x31 = p34.cross(p31);
            var p34x32 = p34.cross(p32);

            return (((p12x13 > 0 && p12x14 < 0) || (p12x13 < 0 && p12x14 > 0)) && ((p34x31 > 0 && p34x32 < 0) || (p34x31 < 0 && p34x32 > 0)));

        },
        pointInShape: function(point, shape){
            // check if the point defined by p is wholly contained within the shape
            // this is done by summing the angle the point sees between each point in the shape.
            // If they sum to exactly 2PI, the point is inside the polygon
            var V2 = SneakyPeter.util.Vector2;
            var theta = 0;
            var points;
            if(Array.isArray(shape)){
                points = shape;
            } else if(typeof shape === 'object' && shape.hasOwnProperty('w') && shape.hasOwnProperty('h')) {
                points = SneakyPeter.util.boxToPointList(shape);
            }
            var next, v1, v2;
            for(var i = 0; i < points.length; i++){
                next = (i === points.length - 1) ? 0 : i+1;
                v1 = new V2(points[i].x - point.x, points[i].y - point.y);
                v2 = new V2(points[next].x - point.x, points[next].y - point.y);
                theta += Math.acos(v1.dot(v2) / (v1.length() * v2.length()));
            }
            return SneakyPeter.util.roundToN(theta/(2 * Math.PI), 5) === 1;
        },
        boxCollide: function(ba, bb){
            // convert boxes to point lists
            var sa = SneakyPeter.util.boxToPointList(ba);
            var sb = SneakyPeter.util.boxToPointList(bb);
            // shape collide
            return SneakyPeter.util.shapeCollide(sa, sb);
        },
        shapeCollide: function(sa, sb){
            var u = SneakyPeter.util;
            // first check if any points of sa lie inside short
            var i, j;
            for(i = 0; i < sa.length; i++){
                if(u.pointInShape(sa[i], sb)){
                    return true;
                }
            }
            // now check if any points of B lie inside A
            for(i = 0; i < sb.length; i++){
                if(u.pointInShape(sb[i], sa)){
                    return true;
                }
            }
            // check if any lines intersect
            var l1, l2, nexta, nextb;
            for(i = 0; i < sa.length; i++){
                nexta = (i === sa.length-1) ? 0 : i+1;
                l1 = [sa[i], sa[nexta]];
                for(j = 0; j < sb.length; j++){
                    nextb = (j === sb.length-1) ? 0 : j+1;
                    l2 = [sb[j], sb[nextb]];
                    if(u.lineIntersect(l1, l2)){
                        return true;
                    }
                }
            }
            // if we're still here, they must not intersect in any way
            return false;
        },
        getScoreFromTime(time){
            return Math.max(0, 500 - Math.floor(time / 20));
        }
    }
};

module.exports = SneakyPeter;