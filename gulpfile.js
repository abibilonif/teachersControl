/**
 * Created by laia on 11/04/17.
 */
var gulp = require('gulp');
var replace=require('gulp-replace');
var concat = require('gulp-concat-css');
var sass = require('gulp-sass');
var pump = require('pump');
var minifyCss = require('gulp-clean-css');

var imgDir="../assets/images/";
gulp.task('sassCompiler', function () {
    return gulp.src('./assets/**/**/*.scss')
        .pipe(sass())
        .pipe(gulp.dest('./assets/css'))
});
gulp.task('packageCss', function () {
    return gulp.src('./assets/**/**/**/*.css')
        .pipe(concat('allCss.css'))
        .pipe(minifyCss())
        .pipe(gulp.dest('./assets/css/'))
});
gulp.task('doIt', ['sassCompiler','packageCss']);