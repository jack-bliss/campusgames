/*                       *\
    CLASSES
\*                       */

class Vector2{
    constructor(x, y){
        this.x = x || 0;
        this.y = y || 0;
    }

    set(x, y){
        this.x = x || 0;
        this.y = y || 0;
    }

    dot(vector){
        return (this.x * vector.x) + (this.y * vector.y);
    }

    cross(vector){
        return (this.x * vector.y) - (this.y * vector.x);
    }

    length(){
        return Math.sqrt((this.x * this.x) + (this.y * this.y));
    }
}


/*                       *\
    SHAPE FUNCTIONS
\*                       */

function boxToPointList(box){
    // accepts an object that defines x, y, w, h, and returns an array of points representing the corners
    var V2 = Vector2;
    return [
        new V2(box.x - (box.w / 2), box.y - (box.h / 2)),
        new V2(box.x + (box.w / 2), box.y - (box.h / 2)),
        new V2(box.x + (box.w / 2), box.y + (box.h / 2)),
        new V2(box.x - (box.w / 2), box.y + (box.h / 2))
    ];
}

function lineIntersect(l1, l2){
    // p1 and p2 are either end of line 1
    // p3 and p4 are either end of line 2
    // if p12 x p13 and p12 x p14 have opposite parity, and
    // if p34 x p31 and p34 x p32 have opposite parity
    // then the line segments overlap

    var p1 = l1[0];
    var p2 = l1[1];
    var p3 = l2[0];
    var p4 = l2[1];

    var V2 = Vector2;

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

}

function pointInShape(point, shape){
    // check if the point defined by p is wholly contained within the shape
    // this is done by summing the angle the point sees between each point in the shape.
    // If they sum to exactly 2PI, the point is inside the polygon
    var V2 = Vector2;
    var theta = 0;
    var points;
    if(Array.isArray(shape)){
        points = shape;
    } else if(typeof shape === 'object' && shape.hasOwnProperty('w') && shape.hasOwnProperty('h')) {
        points = boxToPointList(shape);
    }
    var next, v1, v2;
    for(var i = 0; i < points.length; i++){
        next = (i === points.length - 1) ? 0 : i+1;
        v1 = new V2(points[i].x - point.x, points[i].y - point.y);
        v2 = new V2(points[next].x - point.x, points[next].y - point.y);
        theta += Math.acos(v1.dot(v2) / (v1.length() * v2.length()));
    }
    return roundToN(theta/(2 * Math.PI), 5) === 1;
}

function boxCollide(ba, bb){
    // convert boxes to point lists
    var sa = boxToPointList(ba);
    var sb = boxToPointList(bb);
    // shape collide
    return shapeCollide(sa, sb);
}

function shapeCollide(sa, sb){
    // first check if any points of sa lie inside short
    var i, j;
    for(i = 0; i < sa.length; i++){
        if(pointInShape(sa[i], sb)){
            return true;
        }
    }
    // now check if any points of B lie inside A
    for(i = 0; i < sb.length; i++){
        if(pointInShape(sb[i], sa)){
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
            if(lineIntersect(l1, l2)){
                return true;
            }
        }
    }
    // if we're still here, they must not intersect in any way
    return false;
}

/*                       *\
    HELPER FUNCTIONS
\*                       */

function roundToN(x, n){
    // accepts a number and a number of DP to round to
    var o = x * Math.pow(10, n);
    return Math.round(o) / Math.pow(10, n);
}

function randomInRange(a, b){
    if(Array.isArray(a)){
        return Math.floor(Math.random() * (a[1]-a[0])) + a[0];
    } else {
        return Math.floor(Math.random() * (b-a)) + a;
    }
}

module.exports = {
    // CLASSES
    Vector2: Vector2,

    // SHAPE FUNCTIONS
    boxToPointList: boxToPointList,
    lineIntersect: lineIntersect,
    pointInShape: pointInShape,
    boxCollide: boxCollide,
    shapeCollide: shapeCollide,

    // HELPER FUNCTIONS
    roundToN: roundToN,
    randomInRange: randomInRange
};
