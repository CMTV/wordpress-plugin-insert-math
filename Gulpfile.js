const gulp =            require('gulp');
const run_seq =         require('run-sequence');
const plumber =         require('gulp-plumber');
const concat =          require('gulp-concat');
const uglify_js =       require('gulp-uglify');
const babel =           require('gulp-babel');
const scss_css =        require('gulp-sass');
const autoprefixer =    require('gulp-autoprefixer');
const clean_css =       require('gulp-clean-css');
const clean =           require('gulp-clean');
const replace =         require('gulp-replace');

/* ------------------------------------------------------------------------------------------------------------------ */
/* Handling scripts */
/* ------------------------------------------------------------------------------------------------------------------ */
gulp.task('scripts', () => {
    return gulp.src('src/**/*.js')
        .pipe(plumber(function (error) { console.log(error); this.emit('end'); }))
        .pipe(babel({ presets: ['es2015'] }))
        .pipe(replace('$(', 'jQuery('))
        .pipe(replace('$.', 'jQuery.'))
        .pipe(uglify_js())
        .pipe(gulp.dest('dist'));
});

/* ------------------------------------------------------------------------------------------------------------------ */
/* Handling styles */
/* ------------------------------------------------------------------------------------------------------------------ */
gulp.task('styles', () => {
    return gulp.src('src/**/*.scss')
        .pipe(plumber(function (error) { console.log(error); this.emit('end'); }))
        .pipe(scss_css())
        .pipe(clean_css())
        .pipe(autoprefixer())
        .pipe(gulp.dest('dist'));
});

/* ------------------------------------------------------------------------------------------------------------------ */
/* Moving files */
/* ------------------------------------------------------------------------------------------------------------------ */
gulp.task('move-files', () => {
    return gulp.src(['src/**/**', '!src/**/*.js', '!src/**/*.scss'])
        .pipe(gulp.dest('dist'));
});

gulp.task('move-to-wordpress', () => {
    return gulp.src('dist/**/*')
        .pipe(gulp.dest(
            'C:\\OpenServer\\domains\\wordpress.dev\\wp-content\\plugins\\insert-math'
        ));
});

/* ------------------------------------------------------------------------------------------------------------------ */
/* Cleaning dist */
/* ------------------------------------------------------------------------------------------------------------------ */
gulp.task('clean', () => {
    return gulp.src('dist', {read: false})
        .pipe(clean({force: true}));
});

gulp.task('clean-wordpress', () => {
    return gulp.src('C:\\OpenServer\\domains\\wordpress.dev\\wp-content\\plugins\\insert-math', {read: false})
        .pipe(clean({force: true}));
});

/* ------------------------------------------------------------------------------------------------------------------ */
/* Build & Watch */
/* ------------------------------------------------------------------------------------------------------------------ */
gulp.task('build-plugin', (callback) => {
    run_seq(
        'clean', 'clean-wordpress',
        ['scripts', 'styles', 'move-files'],
        'move-to-wordpress',
        callback
    );
});

gulp.task('watch', () => {
    gulp.watch('src/**/*', ['build-plugin']);
});