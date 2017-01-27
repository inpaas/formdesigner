var gulp            = require('gulp')
,   path            = require('path')
,   sass            = require('gulp-sass')
,   postcss         = require('gulp-postcss');


gulp.task('default', ['style', 'watch']);


gulp.task('style', function() {
  var processors = [];

  return gulp.src(['./lib/scss/app.scss'])
    .pipe(postcss(processors))
    .pipe(sass.sync({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(gulp.dest('./assets/css'));
});

gulp.task('watch', function() {
  var root = path.join(__dirname);
  gulp.watch(root + "/lib/scss/**/**/**/**/*.scss"    , ["style"] );
});