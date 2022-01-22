const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const consolidate = require('gulp-consolidate');
const browserSync = require('browser-sync').create();
const autoprefixer = require('gulp-autoprefixer');
const iconfont = require('gulp-iconfont');
const runTimestamp = Math.round(Date.now() / 1000);
const gulpStylelint = require('gulp-stylelint');
const { series, parallel } = require('gulp');
const image = require('gulp-image');

gulp.task('scss', () => {
  return gulp
    .src('./src/scss/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(
      autoprefixer({
        browsers: ['last 2 versions'],
        cascade: false,
      })
    )
    .pipe(gulp.dest('./dist/css'))
    .pipe(browserSync.stream());
});

gulp.task('scss-lint', () =>
  gulp
    .src('./src/scss/**/*.scss')
    .pipe(
      gulpStylelint({
        fix: true,
        reporters: [{ formatter: 'string', console: true }],
      })
    )
    .pipe(browserSync.stream())
);

gulp.task('iconfont', () => {
  return gulp
    .src('./src/svg/*.svg')
    .pipe(
      iconfont({
        fontName: 'myfont',
        formats: ['ttf', 'eot', 'woff', 'woff2'],
        appendCodepoints: true,
        appendUnicode: false,
        normalize: true,
        fontHeight: 1000,
        centerHorizontally: true,
      })
    )
    .on('glyphs', function (glyphs, options) {
      gulp
        .src('src/iconfont-template/iconfont.scss')
        .pipe(
          consolidate('underscore', {
            glyphs: glyphs,
            fontName: options.fontName,
            fontDate: new Date().getTime(),
          })
        )
        .pipe(gulp.dest('src/scss/icon-font'));
    })
    .pipe(gulp.dest('./dist/fonts'));
});

gulp.task('js', () => {
  return gulp
    .src('./src/js/**/*.js')
    .pipe(gulp.dest('./dist/js'))
    .pipe(browserSync.stream({ stream: true }));
});

gulp.task('html', () => {
  return gulp
    .src('./src/*.html')
    .pipe(gulp.dest('./dist/'))
    .pipe(browserSync.stream({ stream: true }));
});

gulp.task('image', function () {
  gulp.src('./src/img/*').pipe(image()).pipe(gulp.dest('./dist/img'));
});

// gulp.task('default', ['image'])

gulp.task('watch', () => {
  browserSync.init({
    server: {
      baseDir: './dist',
      index: 'index.html',
    },
  });
  gulp
    .watch('./src/*.html')
    .on('change', gulp.series('html', browserSync.reload));
  gulp.watch('./src/scss/**/*.scss', gulp.series('scss', 'scss-lint'));
  gulp
    .watch('./src/js/**/*.js')
    .on('change', gulp.series('js', browserSync.reload));
});

gulp.task('default', gulp.task('watch'));
gulp.task('build', series(['html', 'js', 'scss', 'iconfont', 'image']));
