var gulp = require("gulp");
var babel = require("gulp-babel");
    uglify = require('gulp-uglify'),  
gulp.task('ztt', function() {
    // 1. 找到文件
    gulp.src('js/es6/ztt.js')
    	.pipe(babel({ presets:['env'] }))
    	  // 2. 压缩文件
       // .pipe(uglify({ mangle: false }))
    // 3. 另存压缩后的文件
        .pipe(gulp.dest('js/'));
});
gulp.task('zttPC', function() {
    // 1. 找到文件
    gulp.src('js/es6/zttPC.js')
    	.pipe(babel({ presets:['env'] }))
    	  // 2. 压缩文件
       // .pipe(uglify({ mangle: false }))
    // 3. 另存压缩后的文件
        .pipe(gulp.dest('js/'));
});
gulp.task('home', function() {
    // 1. 找到文件
    gulp.src('js/es6/home.js')
    	.pipe(babel({ presets:['env'] }))
    	  // 2. 压缩文件
       // .pipe(uglify({ mangle: false }))
    // 3. 另存压缩后的文件
        .pipe(gulp.dest('js/'));
});
gulp.task('article', function() {
    // 1. 找到文件
    gulp.src('js/es6/article.js')
    	.pipe(babel({ presets:['env'] }))
    	  // 2. 压缩文件
        //.pipe(uglify({ mangle: false }))
    // 3. 另存压缩后的文件
        .pipe(gulp.dest('js/'));
});
 gulp.task('watch', function() {
    gulp.watch(['js/es6/home.js'],['home']);
    gulp.watch(['js/es6/ztt.js'], ['ztt']);   
        gulp.watch(['js/es6/zttPC.js'], ['zttPC']);   
    gulp.watch(['js/es6/article.js'], ['article']);    
});
/* 合并上述我的方法 监控并执行任务 */
gulp.task('default',['home','ztt','article','zttPC','watch']);