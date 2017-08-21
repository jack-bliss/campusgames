var XHR = {
    get: function(url){
        return new Promise(function(resolve, reject){
            const req = new XMLHttpRequest();
            req.addEventListener('load', function(response){
                resolve(JSON.parse(response));
            });
            req.open('GET', url);
            req.send();
        });
    },
    post: function(url, data){
        return new Promise(function(resolve, reject){
            const req = new XMLHttpRequest();
            req.addEventListener('load', function(response){
                resolve(JSON.parse(response));
            });
            req.open('POST', url);
            req.setRequestHeader('Content-Type', 'application/json');
            req.send();
        });
    }
}