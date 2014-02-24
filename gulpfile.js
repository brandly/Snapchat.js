var
gulp = require('gulp'),
gutil = require('gulp-util'),
path = require('path'),
express = require('express'),
uglify = require('gulp-uglify'),
concat = require('gulp-concat');

gulp.task('gh', function () {
    var dest = 'gh-pages/';
    gulp.src('src/*')
        .pipe(gulp.dest(dest));

    gulp.src('src/snapchat.js')
        .pipe(uglify())
        .pipe(concat('snapchat.min.js'))
        .pipe(gulp.dest(dest));
});

gulp.task('default', function () {
    var app = express(),
        port = 8888;
    app.use(express.static(path.resolve('src/')));
    app.listen(port, function() {
        gutil.log('Listening on', port);
    });
});
