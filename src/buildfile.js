// exports de buildfiles
exports.base = require('./vs/base/buildfile').collectModules();
exports.editor = require('./vs/editor/buildfile').collectModules();
exports.languages = require('./vs/languages/buildfile').collectModules();
exports.vscode = require('./vs/workbench/buildfile').collectModules(['vs/workbench/workbench.main']);
exports.standaloneLanguages = require('./vs/editor/standalone-languages/buildfile').collectModules();

exports.entrypoint = function (name) {
    return [
        {
            name: name,
            include: [],
            
            exclude: [
                'vs/css',
                'vs/nls',
                'vs/text'
            ]
        }
    ];
};