/* global process,__dirname,define,run,suite,test */

// variáveis de dependências
var assert = require('assert');
var path = require('path');
var glob = require('glob');
var istanbul = require('istanbul');
var jsdom = require('jsdom-no-contextify');
var minimatch = require('minimatch');
var async = require('async');

var optimist = require('optimist')
    .usage('rodar testes de hear. todas as opções do mocha aplicadas.')

    .describe('build', 'roda por meio de out-build').boolean('build')
    .describe('run', 'roda um arquivo unicamente').string('run')
    .describe('coverage', 'gera um report de cobertura').boolean('coverage')
    .describe('browser', 'roda os testes no navegador').boolean('browser')

    .alias('h', 'help').boolean('h')
    .describe('h', 'mostra a ajuda');

// variável local
var TEST_GLOB = '**/test/**/*.test.js';

var argv = optimist.argv;

if (argv.help) {
    optimist.showHelp();

    process.exit(1);
}

var out = argv.build ? 'out-build' : 'out';
var loader = require('../' + out + '/vs/loader');
var src = path.join(path.dirname(__dirname), out);

function loadSingleTest(test) {
    var moduleId = path.relative(src, path.resolve(test)).replace(/\.js$/, '');

    return function (cb) {
        define([moduleId], function () {
            cb(null);
        });
    };
}

function loadClientTests(cb) {
	glob(TEST_GLOB, { cwd: src }, function (err, files) {
		var modules = files.map(function (file) {
			return file.replace(/\.js$/, '');
		});

		// carrega todos os módulos
		define(modules, function () {
			cb(null);
		});
	});
}

function loadPluginTests(cb) {
	var root = path.join(path.dirname(__dirname), 'extensions');

	glob(TEST_GLOB, { cwd: root }, function (err, files) {

		var modules = files.map(function (file) {
			return 'extensions/' + file.replace(/\.js$/, '');
		});

		define(modules, function() {
			cb();
		});
	});
}

function main() {
	process.on('uncaughtException', function (e) {
		console.error(e.stack || e);
	});

	var loaderConfig = {
	    nodeRequire: require,
	    nodeMain: __filename,

		baseUrl: path.join(path.dirname(__dirname)),

		paths: {
			'vs': out + '/vs',
			'lib': out + '/lib',
			'bootstrap': out + '/bootstrap'
		},

		catchError: true
	};

	if (argv.coverage) {
		var instrumenter = new istanbul.Instrumenter();

		loaderConfig.nodeInstrumenter = function (contents, source) {
			if (minimatch(source, TEST_GLOB)) {
				return contents;
			}

			return instrumenter.instrumentSync(contents, source);
		};

		process.on('exit', function (code) {
			if (code !== 0) {
				return;
			}

			var collector = new istanbul.Collector();
			collector.add(global.__coverage__);

			var reporter = new istanbul.Reporter(null, path.join(path.dirname(path.dirname(__dirname)), 'Code-Coverage'));
			reporter.add('html');
			reporter.write(collector, true, function () {});
		});
	}

	loader.config(loaderConfig);

	global.define = loader;
	global.document = jsdom.jsdom('<!doctype html><html><body></body></html>');
	global.self = global.window = global.document.parentWindow;

	global.Element = global.window.Element;
	global.HTMLElement = global.window.HTMLElement;
	global.Node = global.window.Node;
	global.navigator = global.window.navigator;
	global.XMLHttpRequest = global.window.XMLHttpRequest;

	var didErr = false;
	var write = process.stderr.write;

	process.stderr.write = function (data) {
		didErr = didErr || !!data;

		write.apply(process.stderr, arguments);
	};

	var loadTasks = [];

	if (argv.run) {
		var tests = (typeof argv.run === 'string') ? [argv.run] : argv.run;

		loadTasks = loadTasks.concat(tests.map(function (test) {
			return loadSingleTest(test);
		}));
	} else {
		loadTasks.push(loadClientTests);
		loadTasks.push(loadPluginTests);
	}

	async.parallel(loadTasks, function () {
		process.stderr.write = write;

		if (!argv.run) {
			// configura o último teste
			suite('loader', function () {
				test('não deve explodir durante o carregamento', function () {
					assert.ok(!didErr, 'não deve explodir durante o carregamento');
				});
			});
		}

		// roda o mocha
		run();
	});
}

if (process.argv.some(function (a) { return /^--browser/.test(a); })) {
	require('./browser');
} else {
	main();
}