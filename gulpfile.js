var
gulp = require('gulp'),
gutil = require('gulp-util'),
path = require('path'),
express = require('express');

gulp.task('gh', function () {
    gulp.src('src/*')
        .pipe(gulp.dest('gh-pages/'));
});

gulp.task('default', function () {
    var app = express(),
        port = 8888;
    app.use(express.static(path.resolve('src/')));
    app.listen(port, function() {
        gutil.log('Listening on', port);
    });
});
