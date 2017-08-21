const GameName = {
    setup: function(){
        return {

        }
    },
    update: function(state, input, dt){
        var s = Object.assign({}, state);

        return s;
    },
    render: function(draw, state, resources){
        draw.clear();
    },
    resources: {},
    watch: {},
    util: {}
};

module.expors = GameName;