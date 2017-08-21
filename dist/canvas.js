(function(root) {
    var previous = root.Game;
    var cv = document.getElementById('game-canvas');
    var ctx = cv.getContext('2d');
    Canvas = {
        elm: cv,
        ctx: ctx,
        noConflict: function(name){
            root.Canvas = previous;
            root[name] = Canvas;
        },
        clear: function(){
            ctx.clearRect(0, 0, Canvas.elm.width, Canvas.elm.height);
        },
        box: function(box, colour){
            var prevStyle = ctx.strokeStyle;
            if(!colour){
                colour = 'black';
            }
            ctx.strokeStyle = colour;

            ctx.strokeRect(box.x - (box.w/2), box.y - (box.h/2), box.w, box.h);

            ctx.strokeStyle = prevStyle;
        },
        rect: function(rect, colour){
            var prevStyle = ctx.fillStyle;
            if(!colour){
                if(rect.colour){
                    colour = rect.colour;
                } else {
                    colour = 'black';
                }
            }
            ctx.fillStyle = colour;

            ctx.fillRect(rect.x - (rect.w/2), rect.y - (rect.h/2), rect.w, rect.h);

            ctx.fillStyle = prevStyle;
        },
        write: function(x, y, string, font){
            var prevStyle = ctx.fillStyle;
            var prevFont = ctx.font;

            ctx.fillStyle = 'black';
            ctx.font = font ? font : '20px sans-serif';

            ctx.fillText(string, x, y);

            ctx.fillStyle = prevStyle;
            ctx.font = prevFont;
        }
    };
    root['Canvas'] = Canvas;
})(window);