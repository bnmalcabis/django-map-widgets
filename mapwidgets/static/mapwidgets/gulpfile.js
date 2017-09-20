var gulp = require('gulp');
var concat = require('gulp-concat');
var minify = require('gulp-minify');

gulp.task('point-field-js', function () {
  return gulp.src(['js/jquery_class.js', 'js/django_mw_base.js', 'js/mw_google_point_field.js'])
    .pipe(concat('mw_google_point_field.js'))
    .pipe(minify({
        ext:{
            src:'-debug.js',
            min:'.min.js'
        }
    }))
    .pipe(gulp.dest('js/'));
});

gulp.task('point-field-inline-js', function () {
  return gulp.src(['js/jquery_class.js', 'js/django_mw_base.js', 'js/mw_google_point_field.js', 'js/mw_google_point_field_generater.js'])
    .pipe(concat('mw_google_point_inline_field.js'))
    .pipe(minify({
        ext:{
            src:'-debug.js',
            min:'.min.js'
        }
    }))
    .pipe(gulp.dest('js/'));
});

gulp.task('custom-magnific-popup', function () {
  return gulp.src(['js/jquery.custom.magnific-popup.js'])
    .pipe(minify({
        ext:{
            min:'.min.js'
        }
    }))
    .pipe(gulp.dest('js/'));
});

gulp.task('default', ['point-field-js', 'point-field-inline-js', 'custom-magnific-popup']);
