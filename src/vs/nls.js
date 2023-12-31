/// <reference path="declares.ts" />
/// <reference path="loader.ts" />

'use strict';

var _nlsPluginGlobal = this;
var NLSLoaderPlugin;

(function (NLSLoaderPlugin) {
    var global = _nlsPluginGlobal;

    var Resources = global.Plugin
        && global.Plugin.Resources
        ? global.Plugin.Resources
        : undefined;

    var DEFAULT_TAG = 'i-default';
    var IS_PSEUDO = (global && global.document && global.document.URL.match(/[^\?]*\?[^\#]*pseudo=true/));

    var slice = Array.prototype.slice;

    function _format(message, args) {
        var result;

        if (args.length === 0) {
            result = message;
        } else {
            result = message.replace(/\{(\d+)\}/g, function (match, rest) {
                var index = rest[0];

                return typeof args[index] !== 'undefined' ? args[index] : match;
            });
        }

        if (IS_PSEUDO) {
            // ff3b e ff3d é a representação zenkaku de unicode para [ and ]
            result = '\uFF3B' + result.replace(/[aouei]/g, '$&$&') + '\uFF3D';
        }

        return result;
    }

    function findLanguageForModule(config, name) {
        var result = config[name];

        if (result)
            return result;

        result = config['*'];

        if (result)
            return result;

        return null;
    }

    function localize(data, message) {
        var args = [];

        for (var _i = 0; _i < (arguments.length - 2); _i++) {
            args[_i] = arguments[_i + 2];
        }

        return _format(message, args);
    }

    function createScopedLocalize(scope) {
        return function (idx, defaultValue) {
            var restArgs = slice.call(arguments, 2);

            return _format(scope[idx], restArgs);
        };
    }

    var NLSPlugin = (function () {
        function NLSPlugin() {
            this.localize = localize;
        }

        NLSPlugin.prototype.create = function (key, data) {
            return {
                localize: createScopedLocalize(data[key])
            };
        };

        NLSPlugin.prototype.load = function (name, req, load, config) {
            config = config || {};

            if (!name || name.length === 0) {
                load({
                    localize: localize
                });
            } else {
                var suffix;

                if (Resources) {
                    suffix = '.nls.keys';

                    req([name + suffix], function (keyMap) {
                        load({
                            localize: function (moduleKey, index) {
                                if (!keyMap[moduleKey])
                                    return 'erro nls: key desconhecida ' + moduleKey;

                                var mk = keyMap[moduleKey].keys;

                                if (index >= mk.length)
                                    return 'erro nls desconhecido cujo index ' + index;

                                var subKey = mk[index];
                                var args = [];

                                args[0] = moduleKey + '_' + subKey;

                                for (var _i = 0; _i < (arguments.length - 2); _i++) {
                                    args[_i + 1] = arguments[_i + 2];
                                }
                                
                                return Resources.getString.apply(Resources, args);
                            }
                        });
                    });
                } else {
                    if (config.isBuild) {
                        req([name + '.nls', name + '.nls.keys'], function (messages, keys) {
                            NLSPlugin.BUILD_MAP[name] = messages;
                            NLSPlugin.BUILD_MAP_KEYS[name] = keys;

                            load(messages);
                        });
                    } else {
                        var pluginConfig = config['vs/nls'] || {};
                        var language = pluginConfig.availableLanguages ? findLanguageForModule(pluginConfig.availableLanguages, name) : null;

                        suffix = '.nls';

                        if (language !== null && language !== DEFAULT_TAG) {
                            suffix = suffix + '.' + language;
                        }

                        req([name + suffix], function (messages) {
                            if (Array.isArray(messages)) {
                                messages.localize = createScopedLocalize(messages);
                            } else {
                                messages.localize = createScopedLocalize(messages[name]);
                            }

                            load(messages);
                        });
                    }
                }
            }
        };

        NLSPlugin.prototype._getEntryPointsMap = function () {
            global.nlsPluginEntryPoints = global.nlsPluginEntryPoints || {};

            return global.nlsPluginEntryPoints;
        };

        NLSPlugin.prototype.write = function (pluginName, moduleName, write) {
            // getEntryPoint é uma extensão monaco para o r.js
            var entryPoint = write.getEntryPoint();

            // r.js destrói o contexto desse plugin entre a chamada de 'write' e 'writeFile'
            var entryPointsMap = this._getEntryPointsMap();

            entryPointsMap[entryPoint] = entryPointsMap[entryPoint] || [];
            entryPointsMap[entryPoint].push(moduleName);

            if (moduleName !== entryPoint) {
                write.asModule(
                    pluginName + '!' + moduleName, 'define([\'vs/nls\', \'vs/nls!' + entryPoint + '\'], function(nls, data) { return nls.create("' + moduleName + '", data); });'
                );
            }
        };

        NLSPlugin.prototype.writeFile = function (
            pluginName,
            moduleName,
            
            req,
            write,
            config
        ) {
            var entryPointsMap = this._getEntryPointsMap();

            if (entryPointsMap.hasOwnProperty(moduleName)) {
                var fileName = req.toUrl(moduleName + '.nls.js');

                var contents = [
                    '/*---------------------------------------------------------',
                    ' * copyright (c) grivo. todos os direitos reservados.',
                    ' *--------------------------------------------------------*/'
                ], entries = entryPointsMap[moduleName];

                var data = {};

                for (var i = 0; i < entries.length; i++) {
                    data[entries[i]] = NLSPlugin.BUILD_MAP[entries[i]];
                }

                contents.push('define("' + moduleName + '.nls", ' + JSON.stringify(data, null, '\t') + ');');

                write(fileName, contents.join('\r\n'));
            }
        };

        NLSPlugin.prototype.finishBuild = function (write) {
            write('nls.metadata.json', JSON.stringify({
                keys: NLSPlugin.BUILD_MAP_KEYS,
                messages: NLSPlugin.BUILD_MAP,

                bundles: this._getEntryPointsMap()
            }, null, '\t'));
        };

        NLSPlugin.BUILD_MAP = {};
        NLSPlugin.BUILD_MAP_KEYS = {};

        return NLSPlugin;
    })();

    NLSLoaderPlugin.NLSPlugin = NLSPlugin;

    (function () {
        define('vs/nls', new NLSPlugin());
    })();
})(NLSLoaderPlugin || (NLSLoaderPlugin = {}));