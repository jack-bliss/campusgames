var canvas = document.getElementById('game-canvas');

document.body.addEventListener('keydown', function(e){
    var code = e.code.replace('Arrow', '').toLowerCase();
    if(Input.hasOwnProperty(code)){
        Input[code] = true;
    }
});

document.body.addEventListener('keyup', function(e){
    var code = e.code.replace('Arrow', '').toLowerCase();
    if(Input.hasOwnProperty(code)){
        Input[code] = false;
    }
});

canvas.addEventListener('mousemove', function(e){
    Input.mouse.x = e.layerX;
    Input.mouse.y = e.layerY;
});

canvas.addEventListener('mousedown', function(e){
    Input.mouse.click = true;
});

canvas.addEventListener('mouseup', function(e){
    Input.mouse.click = false;
});


var Input = {
    up: false,
    right: false,
    down: false,
    left: false,
    space: false,
    mouse: {
        x: 0,
        y: 0,
        click: false
    }
};