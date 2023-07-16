// variáveis de dependências
var express = require('express');
var glob = require('glob');
var path = require('path');
var fs = require('fs');

// variáveis de porto
var port = 8887;
var root = path.dirname(__dirname);

function template(str, env) {
    return str.replace(/{{\s*([\w_\-]+)\s*}}/g, function (all, part) {
        return env[part];
    });
}

var app = express();

app.use('/out', express.static(path.join(root, 'out')));
app.use('/test', express.static(path.join(root, 'test')));

app.get('/', function (req, res) {
    glob('**/test/**/*.js', {
        cwd: path.join(root, 'out'),

        ignore: [
            '**/test/{node,electron*}/**/*.js'
        ]
    }, function (err, files) {
        if (err) {
            return res.sendStatus(500);
        }

        var modules = files
            .map(function (file) {
                return file.replace(/\.js$/, '');
            });

        fs.readFile(path.join(__dirname, 'index.html'), 'utf8', function (err, templateString) {
            if (err) {
                return res.sendStatus(500);
            }

            res.send(template(templateString, {
                modules: JSON.stringify(modules)
            }));
        });
    });
});

// url do servidor que rodará a aplicação
var server = app.listen(port, function () {
    console.log('http://localhost:8887/');
});