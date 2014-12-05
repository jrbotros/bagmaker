var gulp = require('gulp'),
    sass = require('gulp-ruby-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    jade = require('gulp-jade'),
    imagemin = require('gulp-imagemin'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    cache = require('gulp-cache'),
    livereload = require('gulp-livereload'),
    del = require('del');

// styles
gulp.task('styles', function() {
  return gulp.src('public/stylesheets/scss/style.scss')
    .pipe(sass({ style: 'expanded' })).on('error', errorHandler)
    .on('error', function (err) { console.log(err.message); })
    .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
    .pipe(gulp.dest('public/stylesheets/'))
    .pipe(rename({suffix: '.min'}))
    .pipe(minifycss())
    .pipe(gulp.dest('public/stylesheets/min/'))
    .pipe(notify({ message: 'Styles task complete' }));
});

// scripts
gulp.task('scripts', function() {
  return gulp.src('public/javascripts/*.js')
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('default'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify()).on('error', errorHandler)
    .pipe(gulp.dest('public/javascripts/min'))
    .pipe(notify({ message: 'Scripts task complete' }));
});

// image compression
gulp.task('images', function() {
  return gulp.src('public/images/*')
    .pipe(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true }))
    .pipe(gulp.dest('public/images/compressed/'))
    .pipe(notify({ message: 'Images task complete' }));
});

// //templates
// gulp.task('jade', function(){
//   return gulp.src('views/*.jade')
//     .pipe(jade({
//         pretty : true
//     }))
//     .pipe(gulp.dest('public/pages/'))
// });

// Clean
gulp.task('clean', function(cb) {
    del(['public/stylesheets', 'public/javascripts', 'public/images'], cb)
});
 
// Default task
gulp.task('default', ['clean'], function() {
    //gulp.start('styles', 'scripts', 'images');
    gulp.start('styles', 'scripts');
});
 
// Watch
gulp.task('watch', function() {
 
  // Watch .scss files
  gulp.watch('public/stylesheets/**/*.scss', ['styles']);
 
  // Watch .js files
  gulp.watch('public/javascripts/**/*.js', ['scripts']);
 
  // Watch image files
  //gulp.watch('public/images/**/*', ['images']);

  // // Watch jade files
  // gulp.watch('views/*.jade', ['jade']);
 
  // Create LiveReload server
  livereload.listen();
 
  // Watch any files in dist/, reload on change
  gulp.watch(['public/**/*']).on('change', livereload.changed);
 
});

// Handle the error
function errorHandler (error) {
  console.log(error.toString());
  this.emit('end');
}