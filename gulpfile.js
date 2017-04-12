/**
 * Created by laia on 11/04/17.
 */
var gulp = require('gulp');
var concat = require('gulp-concat');
var sass= require('gulp-sass');
var pump = require('pump');
var minifyCss=require('gulp-clean-css');

gulp.task('sassCompiler',function () {
    gulp.src('./assets/**/**/*.scss')
        .pipe(sass())
        .pipe(gulp.dest('prueba/css'))
})
gulp.task('packageCss',['sassCompiler'],function () {
    gulp.src(['./assets/**/**/*.css','prueba/**/**/*.css'])
        .pipe(concat('allCss.css'))
        .pipe(minifyCss())
        .pipe(gulp.dest('prueba'))
});