let gulp = require('gulp');
let babel = require('gulp-babel');
let uglify = require('gulp-uglify');
let pump = require('pump');

let src = './src/*.js';
let dist = './dist/';

gulp.task('babel', () => {
	return gulp.src(src)
		.pipe(babel({
			presets: ['es2015']
		}))
		.pipe(gulp.dest(dist));
})

gulp.task('compress', () => {
	pump([
		gulp.src(src),
		babel({
			presets: ['es2015']
		}),
		uglify(),
		gulp.dest(dist)
	])
})

gulp.watch('./src/*.js', ['compress']);