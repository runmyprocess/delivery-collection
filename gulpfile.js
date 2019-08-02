/**
 * Gulp configuration file
 * For convenience all the Gulp tasks are aliased in Npm
 * Tasks : bundle, minify, lint, test, doc
 */

// Main
const gulp = require('gulp')

// Optimization
const babel = require('gulp-babel')
const uglify = require('gulp-uglify')

// Test
const eslint = require('gulp-eslint')

// Documentation
const documentation = require('gulp-documentation')
const template = require('gulp-template')
const fs = require('fs')

// Utilities
const rename = require('gulp-rename')
const del = require('del')

// Data
const packageJSON = require('./package.json')
const prefix = 'runmyprocess-delivery-collection-backoffice'
const source = './src/js/main.js'

// LINT - ESLINT
gulp.task('lint', () =>
  gulp.src('src/js/main.js')
    //.pipe(eslint())
    .pipe(eslint({fix: true}))
    .pipe(gulp.dest('./src/js'))
    .pipe(eslint.format('stylish'))
    //.pipe(eslint.failAfterError())
)

// BUILD
gulp.task('build', (done) => {
  'use strict'
  del(['dist/js/*.js', '!dist/js/archive/*.js'])
  return gulp.src(source)
    .pipe(rename(prefix + '-' + packageJSON.version + '.js'))
    .pipe(gulp.dest('./dist/js'))
    .pipe(babel())
    .pipe(uglify())
    .pipe(rename((path) => path.basename += '.min'))
    .pipe(gulp.dest('./dist/js'))
    .on('end', done)
})

// BACKUP
gulp.task('backup', () =>
  gulp.src('dist/js/*.js')
    .pipe(gulp.dest('./dist/js/archive'))
    .pipe(gulp.dest('./backup'))
)

// DOCUMENTATION
gulp.task('doc', () =>
  gulp.src(source)
    .pipe(documentation('html', {'config': 'documentation.yml'}))
    .pipe(gulp.dest('./doc'))
)

// DOWNLOAD PAGE
gulp.task('publish', () =>
  gulp.src('src/doc.html')
    .pipe(template({
      description: packageJSON.description,
      version: packageJSON.version,
      contributors: packageJSON.contributors,
      homepage: packageJSON.homepage,
      bugs: packageJSON.bugs,
      archives: fs.readdirSync('dist/js/archive/'),
      prefix: prefix
    }))
    .pipe(rename('index.html'))
    .pipe(gulp.dest('./'))
)

// DEFAULT
gulp.task('default', gulp.series('lint', 'build', 'publish'))

// TRAVIS CI
gulp.task('travis', gulp.series('build', 'backup', 'publish'))
