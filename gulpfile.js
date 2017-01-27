var gulp            = require('gulp')
,   path            = require('path')
,   sass            = require('gulp-sass')
,   postcss         = require('gulp-postcss')
,   minify          = require('gulp-minify')
,   concat          = require('gulp-concat')


gulp.task('default', ['style', 'watch']);


gulp.task('style', function() {
  var processors = [];

  return gulp.src(['./lib/scss/app.scss'])
    .pipe(postcss(processors))
    .pipe(sass.sync({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(gulp.dest('./assets/css'));
});

gulp.task('concatJs', function(){
  return gulp.src('./app/sources/**/*.js')
    .pipe(concat('app.js'))
    .pipe(minify())
    .pipe(gulp.dest('./app/sources/'))
});

gulp.task('watch', function() {
  var root = path.join(__dirname);
  gulp.watch(root + "/lib/scss/**/**/**/**/*.scss", ["style"] );
});