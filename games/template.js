const GameName = {
    setup: function(KS){
        return {

        }
    },
    update: function(state, inputs, dt, KS){
        var s = Object.assign({}, state);

        return s;
    },
    render: function(draw, state, resources, player){
        draw.clear();
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
    resources: {},
    watch: {},
    util: {}
};

module.exports = GameName;