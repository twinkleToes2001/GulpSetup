// VARIABLES & PATHS

	// Preprocessor (sass, scss, less, styl)
let preprocessor = 'sass',
	// List of files extensions for watching & hard reload (comma separated)
    fileswatch   = 'html,htm,txt,json,md,woff2',
	// List of images extensions for watching & compression (comma separated)
    imageswatch  = 'jpg,jpeg,png,webp,svg',
	// Base directory path without «/» at the end
    baseDir      = 'app',
	// If «false» - Browsersync will work offline without internet connection
    online       = true;

let paths = {

	scripts: {
		src: [
			// 'node_modules/jquery/dist/jquery.min.js',
			// 'node_modules/font-awesome/font-awesome.js',
			// npm vendor example (npm i --save-dev jquery)
			baseDir + '/js/app.js' // app.js. Always at the end
		],
		dest: baseDir + '/js',
	},

	styles: {
		src:  baseDir + '/' + preprocessor + '/main.*',
		dest: baseDir + '/css',
	},

	images: {
		src:  baseDir + '/images/src/**/*',
		dest: baseDir + '/images/dest',
	},

	deploy: {
		// Deploy hostname
		hostname:    'username@yousite.com',
		// Deploy destination
		destination: 'yousite/public_html/',
		// Included files to deploy
		include:     [/* '*.htaccess' */],
		// Excluded files from deploy
		exclude:     [ '**/Thumbs.db', '**/*.DS_Store' ],
	},

	cssOutputName: 'app.min.css',
	jsOutputName:  'app.min.js',

}

const { src, dest, parallel, series, watch } = require('gulp');
const sass         = require('gulp-sass');
const cleancss     = require('gulp-clean-css');
const concat       = require('gulp-concat');
const browserSync  = require('browser-sync').create();
const uglify       = require('gulp-uglify-es').default;
const autoprefixer = require('gulp-autoprefixer');
const imagemin     = require('gulp-imagemin');
const newer        = require('gulp-newer');
const del          = require('del');

function browsersync() {
	browserSync.init({
		server: { baseDir: baseDir + '/' },
		notify: false,
		online: online
	})
}

function scripts() {
	return src(paths.scripts.src)
	.pipe(concat(paths.jsOutputName))
	.pipe(uglify())
	.pipe(dest(paths.scripts.dest))
	.pipe(browserSync.stream())
}

function styles() {
	return src(paths.styles.src)
	.pipe(eval(preprocessor)())
	.pipe(concat(paths.cssOutputName))
	.pipe(autoprefixer({
		overrideBrowserslist: ['last 10 versions'],
		grid: true
	}))
	.pipe(cleancss({
		level: { 1: { specialComments: 0 } },
		/* format: 'beautify' */
	}))
	.pipe(dest(paths.styles.dest))
	.pipe(browserSync.stream())
}

function images() {
	return src(paths.images.src)
	.pipe(newer(paths.images.dest))
	.pipe(imagemin())
	.pipe(dest(paths.images.dest))
}

function cleanimg() {
	return del('' + paths.images.dest + '/**/*',
		{ force: true })
}

function startwatch() {
	watch(baseDir  + '/' + preprocessor + '/**/*',
		{usePolling: true}, styles);
	watch(baseDir  + '/images/src/**/*.{' + imageswatch + '}',
		{usePolling: true}, images);
	watch(baseDir  + '/**/*.{' + fileswatch + '}',
		{usePolling: true}).on('change', browserSync.reload);
	watch([baseDir + '/js/**/*.js', '!' + paths.scripts.dest + '/*.min.js'],
		{usePolling: true}, scripts);
}

exports.browsersync = browsersync;
exports.assets      = series(
	cleanimg, styles, scripts, images);
exports.styles      = styles;
exports.scripts     = scripts;
exports.images      = images;
exports.cleanimg    = cleanimg;
exports.default     = parallel(
	images, styles, scripts, browsersync, startwatch);
