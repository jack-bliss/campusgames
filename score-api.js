const fs = require('fs');
const path = require('path');
const scoreFile = path.join(__dirname, 'scores.txt');

const ScoreAPI = {
    submit: (name, game, score) => {
        return new Promise((mainResolve, reject) => {
            new Promise((resolve, reject) => {
                fs.readFile(scoreFile, 'utf8', (err, data) => {
                    resolve(JSON.parse(data));
                });
            }).then(scores => {
                let existing = scores.filter(score => score.name === name && score.game === game);
                if(existing.length){
                    existing[0].score = Math.max(existing[0].score, score);
                } else {
                    scores.push({
                        name: name,
                        game: game,
                        score: score
                    });
                }
                fs.writeFile(scoreFile, JSON.stringify(scores), (err) => {
                    mainResolve(true);
                });
            })
        });
    }
};

module.exports = ScoreAPI;
