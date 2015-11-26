var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');
var babel = require('gulp-babel');


var dirs = {
  src: {
    js: "src/js/**/*.js",
    scss: "src/scss/**/*.scss",
    html: "src/templates/**/*.html",
    lib: "src/lib/**/*"
  },
  out: {
    html: 'public/html',
    css: 'public/css',
    js: 'public/js',
    lib: 'public/lib'
  }
}
gulp.task('default', ['scripts', 'templates','sass','library']);

gulp.task('sass', function(done) {
  gulp.src('src/scss/style.scss')
    .pipe(sass())
    .on('error', sass.logError)
    .pipe(concat('style.css'))
    .pipe(gulp.dest(dirs.out.css))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest(dirs.out.css))
    .on('end', done);
});

gulp.task('library', function() {
  gulp.src(dirs.src.lib)
    .pipe(gulp.dest(dirs.out.lib))
});

gulp.task('scripts', function(){
  return gulp.src(dirs.src.js)
    .pipe(babel())
    .pipe(concat('all.js'))
    .pipe(gulp.dest(dirs.out.js))
    .pipe(rename('all.min.js'))
    .pipe(gulp.dest(dirs.out.js));
})

gulp.task('templates', function(){
  return gulp.src(dirs.src.html)
    .pipe(gulp.dest(dirs.out.html))
})

gulp.task('watch', function() {
  gulp.watch(dirs.src.html, ['templates']);
  gulp.watch(dirs.src.scss, ['sass']);
  gulp.watch(dirs.src.js, ['scripts']);
});


gulp.task('install', ['git-check'], function() {
  return bower.commands.install()
    .on('log', function(data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

gulp.task('git-check', function(done) {
  if (!sh.which('git')) {
    console.log(
      '  ' + gutil.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
    );
    process.exit(1);
  }
  done();
});
