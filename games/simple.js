const Simple = {
    setup: function(KS){
        return {
            time: 0,
            space: false
        }
    },
    update: function(state, input, dt){
        var s = Object.assign({}, state);
        s.time += dt;
        s.space = input.space;
        return s;
    },
    render: function(draw, state, resources){
        draw.clear();
        draw.write(100, 100, state.time);
        draw.write(100, 200, state.space+"");
    },
    resources: {},
    watch: {},
    util: {}
};

module.exports = Simple;