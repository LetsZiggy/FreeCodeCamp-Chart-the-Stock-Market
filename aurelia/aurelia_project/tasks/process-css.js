import gulp from 'gulp';
import sourcemaps from 'gulp-sourcemaps';
import sass from 'gulp-sass';
import project from '../aurelia.json';
import {build} from 'aurelia-cli';
import postcss from 'gulp-postcss'; // Added
import autoprefixer from 'autoprefixer'; // Added

export default function processCSS() {
  let processors = [
    autoprefixer({ browsers: ['last 1 version'] })
  ]; // Added

  return gulp.src(project.cssProcessor.source)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss(processors)) // Added
    // .pipe(build.bundle()) // Default replaced
    .pipe(gulp.dest(project.platform.output)); // Added
}
