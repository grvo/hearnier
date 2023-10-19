// variáveis de dependências
var gulp = require('gulp');
var tsb = require('gulp-tsb');
var assign = require('object-assign');

// variáveis locais
var util = require('./lib/util');
var watcher = require('./lib/watch');

var compilation = tsb.create(assign({
	verbose: true
}, require('./tsconfig.json').compilerOptions));

gulp.task('compile', function() {
	return gulp.src('**/*.ts', {
		base: '.'
	})
		.pipe(compilation())
		.pipe(gulp.dest(''));
});

gulp.task('watch', function() {
	var src = gulp.src('**/*.ts', {
		base: '.'
	});
	
	return watcher('**/*.ts', {
		base: '.'
	})
		.pipe(util.incremental(compilation, src))
		.pipe(gulp.dest(''));
});

gulp.task('default', [
	'compile'
]);
