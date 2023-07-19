// será definido caso seja forkado de outro processo node

if (!!process.send && process.env.PIPE_LOGGING === 'true') {
    var MAX_LENGTH = 100000;

    // previnir stringify circular
    function safeStringify(obj) {
        var seen = [];
        var res;

        try {
            res = JSON.stringify(obj, function (key, value) {
                // objetos recebem tratamento especial para previnir círculos
                if (value && Object.prototype.toString.call(value) === '[object Object]') {
                    if (seen.indexOf(value) !== -1) {
                        return Object.create(null); // previnir referências circulares
                    }

                    seen.push(value);
                }

                return value;
            });
        } catch (error) {
            return 'output emitido para um objeto que não pode ser inspecionado (' + error.toString() + ')';
        }

        if (res && res.length > MAX_LENGTH) {
            return 'output emitido para um objeto largo que excede os limites';
        }

        return res;
    }

    // passar controle de logging para fora
    if (process.env.VERBOSE_LOGGING === 'true') {
		console.log = function () {
            process.send({
                type: '__$console',
                severity: 'log',

                arguments: safeStringify(arguments)
            });
        };
        
		console.warn = function () {
            process.send({
                type: '__$console',
                severity: 'warn',
                
                arguments: safeStringify(arguments)
            });
        };
	} else {
		console.log = function () { /* ignorar */ };
		console.warn = function () { /* ignorar */ };
	}

    console.error = function () { process.send({ type: '__$console', severity: 'error', arguments: safeStringify(arguments) }); };

    // fazer com que stdout, stderr e stdin sejam streams no-op
    // isso previne que um erro onde quer que esteja, obtenha um erro ebadf
    var stream = require('stream');
    
	var writable = new stream.Writable({
		write: function (chunk, encoding, next) { /* no op */ }
	});

	process.__defineGetter__('stdout', function() { return writable; });
	process.__defineGetter__('stderr', function() { return writable; });
	process.__defineGetter__('stdin', function() { return writable; });
}

// auxilia excessões não-capturáveis
process.on('uncaughtException', function (err) {
    console.error('excessão não-capturada: ', err.toString());

    if (err.stack) {
        console.error(err.stack);
    }
});

var path = require('path');
var loader = require('./vs/loader');

// todo: duplicado em
//
// * src\bootstrap.js
// * src\vs\workbench\electron-main\bootstrap.js
// * src\vs\platform\plugins\common\nativePluginService.ts
function uriFromPath(_path) {
    var pathName = path.resolve(_path).replace(/\\/g, '/');

    if (pathName.length > 0 && pathName.charAt(0) !== '/') {
        pathName = '/' + pathName;
    }

    return encodeURI('file://' + pathName);
}

loader.config({
    baseUrl: uriFromPath(path.join(__dirname, '..')),

    paths: {
        'vs': path.basename(__dirname) + '/vs'
    },

    catchError: true,

    nodeRequire: require,
    nodeMain: __filename
});

var entrypoint = process.env.AMD_ENTRYPOINT;

if (entrypoint) {
    loader(
        [
            entrypoint
        ], function () { },

        function (err) {
            console.error(err);
        }
    );
}