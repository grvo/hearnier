'use strict';

function createModuleDescription(name, exclude) {
    var result = {};

    result.name = name;

    var excludes = [
        'vs/css',
        'vs/nls',
        'vs/text'
    ];

    if (Array.isArray(exclude) && exclude.length > 0) {
        excludes = excludes.concat(exclude);
    }

    result.exclude = excludes;

    return result;
}

function addInclude(config, include) {
    if (!config.include) {
        config.include = [];
    }

    config.include.push(include);

    return config;
}

exports.collectModules = function() {
    return [
        // inclui o módulo severo na base worker do código desde que seja utilizazdo por várias linguagens
        // isso pode causar carregamento chuvoso caso uma linguagem exclua outra

        addInclude(
            createModuleDescription('vs/editor/common/worker/editorWorkerServer', [
                'vs/base/common/worker/workerServer'
            ]),

            'vs/base/common/severity'
        )
    ];
};
