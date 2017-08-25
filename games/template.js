const GameName = {
    setup: function(KS){
        return {

        }
    },
    update: function(state, input, dt, KS){
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

module.exports = GameName;