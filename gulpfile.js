var gulp = require('gulp'),
    sass = require('gulp-sass'),
    postcss = require('gulp-postcss'),
    minify = require('gulp-minify'),
    concat = require('gulp-concat');

gulp.task('default', ['style', 'watch']);

gulp.task('style', function() {
  var processors = [];

  return gulp.src(['./lib/scss/app.scss'])
    .pipe(postcss(processors))
    .pipe(sass.sync({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(gulp.dest('./assets/css'));
});

gulp.task('concatJs', function(){
  return gulp.src(['./assets/js/helpers.js', './app/**/*.js'])
    .pipe(concat('app.js'))
    .pipe(minify())
    .pipe(gulp.dest('./dist'))
});

gulp.watch('./lib/scss/**/*.scss', ['style']);
gulp.watch('./app/**/*.js', ['style']);
