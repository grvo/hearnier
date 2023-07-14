// aumentar ouvintes máximos para emissores de eventos
require('events').EventEmitter.defaultMaxListeners = 100;

// variáveis de dependências
var gulp = require('gulp');
var tsb = require('gulp-tsb');
var filter = require('gulp-filter');
var mocha = require('gulp-mocha');
var remote = require('gulp-remote-src');
var rename = require('gulp-rename');
var zip = require('gulp-vinyl-zip');
var bom = require('gulp-bom');
var sourcemaps = require('gulp-sourcemaps');

var es = require('event-stream');
var path = require('path');
var _ = require('underscore');

// variáveis locais
var watch = require('./build/lib/watch');
var nls = require('./build/lib/nls');
var style = require('./build/lib/style');
var copyrights = require('./build/lib/copyrights');
var util = require('./build/lib/util');
var reporter = require('./build/lib/reporter')();

var rootDir = path.join(__dirname, 'src');

var tsOptions = {
    target: 'ES5',
    module: 'amd',
    verbose: true,
    preserveConstEnums: true,
	experimentalDecorators: true,
	sourceMap: true,
	rootDir: rootDir,
	sourceRoot: util.toFileUri(rootDir)
};

function createCompile(build) {
    var ts = tsb.create(
        opts,
        null,
        null,

        function (err) {
            reporter(err.toString());
        }
    );

    return function (token) {
        var utf8Filter = filter('**/test/**/*utf8*', { restore: true });

        var tsFilter = filter([
            '**/*.ts',
            '!vs/languages/typescript/common/lib/lib.**.ts'
        ], { restore: true });

        var input = es.through();

        var output = input
            .pipe(utf8Filter)
            .pipe(bom())
            .pipe(utf8Filter.restore)
            .pipe(tsFilter)
			.pipe(util.loadSourcemaps())
			.pipe(ts(token))
			.pipe(build ? nls() : es.through())
			.pipe(sourcemaps.write('.', {
				addComment: false,
				includeContent: !!build,
				sourceRoot: tsOptions.sourceRoot
			}))
			.pipe(tsFilter.restore)
			.pipe(reporter());

        return es.duplex(input, output);
    };
}

var LINE_FEED_FILES = [
    'build/**/*',
    'extensions/**/*',
    'scripts/**/*',
    'src/**/*',
    'test/**/*',

    '!extensions/csharp-o/bin/**',
    '!extensions/**/out/**',

    '!**/node_modules/**',
    '!**/fixtures/**',
    '!**/*.{svg,exe,png,scpt,bat,cur,ttf,woff,eot}'
];

gulp.task('eol-style', function() {
    return gulp.src(LINE_FEED_FILES).pipe(style({ complain: true }));
});

gulp.task('fix-eol-style', function() {
	return gulp.src(LINE_FEED_FILES, { base: '.' }).pipe(style({})).pipe(gulp.dest('.'));
});