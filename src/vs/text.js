/// <reference path="declares.ts" />
/// <reference path="loader.ts" />

var TextLoaderPlugin;

(function (TextLoaderPlugin) {
    var BrowserTextLoader = (function () {
        function BrowserTextLoader() {
        }

        BrowserTextLoader.prototype.load = function (
            name,
            fileUrl,

            externalCallback,
            externalErrorback
        ) {
            var req = new XMLHttpRequest();

            req.onreadystatechange = function () {
                if (req.readyState === 4) {
                    if ((req.status >= 200 && req.status < 300) || req.status === 1223 || (req.status === 0 && req.responseText && req.responseText.length > 0)) {
                        externalCallback(req.responseText);
                    } else {
                        externalErrorback(req);
                    }

                    req.onreadystatechange = null;
                }
            };

            req.open('GET', fileUrl, true);
            req.responseType = '';
            req.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            req.send(null);
        };

        return BrowserTextLoader;
    })();

    function readFileAndRemoveBOM(fs, path) {
        var BOM_CHAR_CODE = 65279;

        var contents = fs.readFileSync(path, 'utf8');

        // remover bom
        if (contents.charCodeAt(0) === BOM_CHAR_CODE) {
            contents = contents.substring(1);
        }

        return contents;
    }

    var NodeTextLoader = (function () {
        function NodeTextLoader() {
            this.fs = require.nodeRequire('fs');
        }

        NodeTextLoader.prototype.load = function (
            name,
            fileUrl,


            callback,
            errorback
        ) {
            callback(readFileAndRemoveBOM(this.fs, fileUrl));
        };

        return NodeTextLoader;
    })();

    // plugin
    var TextPlugin = (function () {
        function TextPlugin(textLoader) {
            this.textLoader = textLoader;
        }

        TextPlugin.prototype.load = function (
            name,
            req,
            load,
            config
        ) {
            config = config || {};

            var myConfig = config['vs/text'] || {};
            var myPaths = myConfig.paths || {};

            var redirectedName = name;

            for (var path in myPaths) {
                if (myPaths.hasOwnProperty(path)) {
                    if (name.indexOf(path) === 0) {
                        redirectedName = myPaths[path] + name.substr(path.length);
                    }
                }
            }

            var fileUrl = req.toUrl(redirectedName);

            this.textLoader.load(name, fileUrl, function (contents) {
                if (config.isBuild) {
                    TextPlugin.BUILD_MAP[name] = contents;
                }

                load(contents);
            }, function (err) {
                if (typeof load.error === 'function') {
                    load.error('não foi possível encontrar ' + fileUrl);
                }
            });
        };

        TextPlugin.prototype.write = function (
            pluginName,
            moduleName,

            write
        ) {
            if (TextPlugin.BUILD_MAP.hasOwnProperty(moduleName)) {
                var escapedText = Utilities.escapeText(TextPlugin.BUILD_MAP[moduleName]);

                write('define("' + pluginName + '!' + moduleName + '", function () { return "' + escapedText + '"; });');
            }
        };

        TextPlugin.BUILD_MAP = {};

        return TextPlugin;
    })();

    TextLoaderPlugin.TextPlugin = TextPlugin;

    var Utilities = (function () {
        function Utilities() {
        }

        /**
         * escapar texto de forma que possa ser usado em uma string javascript entre aspas duplas ("")
         */
        Utilities.escapeText = function (text) {
            // http://www.javascriptkit.com/jsref/escapesequence.shtml
            //
            // \b       backspace
            // \f       feed de formulário
            // \n       nova linha
            // \O       caractere nulo
            // \r       retorno de carriage
            //
            // \t       tab horizontal
            // \v       tab vertical
            //
            // \'       aspas simples
            // \"       aspas duplas
            // \\       barra invertida
            //
            // \ddd     caractere latin-1 especificado por três dígitos octal entre 0 e 377
            // \xdd     caractere latin-1 especificado por dois dígitos hexadecimais dd entre 00 e ff
            // \udddd   caractere unicode especificado por quatro dígitos hexadecimais dddd
            var _backspace = '\b'.charCodeAt(0);
            var _formFeed = '\f'.charCodeAt(0);
            var _newLine = '\n'.charCodeAt(0);
            var _nullChar = 0;
            var _carriageReturn = '\r'.charCodeAt(0);
            var _tab = '\t'.charCodeAt(0);
            var _verticalTab = '\v'.charCodeAt(0);
            var _backslash = '\\'.charCodeAt(0);
            var _doubleQuote = '"'.charCodeAt(0);

            var startPos = 0, chrCode, replaceWith = null, resultPieces = [];

            for (var i = 0, len = text.length; i < len; i++) {
                chrCode = text.charCodeAt(i);

                switch (chrCode) {
                    case _backspace:
                        replaceWith = '\\b';

                        break;

                    case _formFeed:
                        replaceWith = '\\f';

                        break;

                    case _newLine:
                        replaceWith = '\\n';

                        break;

                    case _nullChar:
                        replaceWith = '\\0';

                        break;

                    case _carriageReturn:
                        replaceWith = '\\r';

                        break;

                    case _tab:
                        replaceWith = '\\t';

                        break;

                    case _verticalTab:
                        replaceWith = '\\v';

                        break;

                    case _backslash:
                        replaceWith = '\\\\';

                        break;

                    case _doubleQuote:
                        replaceWith = '\\"';

                        break;
                }

                if (replaceWith !== null) {
                    resultPieces.push(text.substring(startPos, i));
                    resultPieces.push(replaceWith);

                    startPos = i + 1;

                    replaceWith = null;
                }
            }

            resultPieces.push(text.substring(startPos, len));

            return resultPieces.join('');
        };

        return Utilities;
    })();

    TextLoaderPlugin.Utilities = Utilities;

    (function () {
        var textLoader = null;
        var isAtomShell = (typeof process !== 'undefined' && typeof process.versions !== 'undefined' && typeof process.versions['electron'] !== 'undefined');

        if (typeof process !== 'undefined' && process.versions && !!process.versions.node && !isAtomShell) {
            textLoader = new NodeTextLoader();
        } else {
            textLoader = new BrowserTextLoader();
        }

        define('vs/text', new TextPlugin(textLoader));
    })();
})(TextLoaderPlugin || (TextLoaderPlugin = {}));