const { src, dest, series, parallel }   = require('gulp');
const imagemin                = require('gulp-imagemin');
const imageminJpegRecompress  = require('imagemin-jpeg-recompress');
const pngquant                = require('imagemin-pngquant');
const cheerio                 = require('gulp-cheerio');
let flatten                 = require('gulp-flatten');
let es                      = require('event-stream');


const imageMin = () => {
    return src('src/img/*')
        .pipe(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imageminJpegRecompress({
                loops: 5,
                min: 65,
                max: 70,
                quality: 'medium'
            }),
            imagemin.optipng({optimizationLevel: 5}),
            pngquant({ quality: [0.3, 0.5], speed: 5 }),
            imagemin.svgo({
                plugins: [
                    {removeViewBox: true},
                    {cleanupIDs: false}
                ]
            })
        ], {
            verbose: true
        }))
        .pipe(dest('dist/img'))
}

const cleanHrefs = () => {
    return src(['dist/index.html'])
        .pipe(
            cheerio(function($, file) {
                $('a').each(function() {
                    let a = $(this);
                    if(a['0'].attribs.href && !a['0'].attribs.href.match(/#/)) {
                       a['0'].attribs.href = " ";
                    }
                    
                })
        }))
        .pipe(dest('dist'));
};

const formTheProjectStructure = (cb) => {
        const types = {
            img: ['jpg', 'jpeg', 'png', 'gif', 'svg', 'ico'],
            js: ['js'],
            css: ['css'],
            fonts: ['otf', 'ttf', 'html'],
        }

        for(type in types) {
            types[type].forEach(el => {
                src(`src/**/*.${el}`)
                    .pipe(flatten())
                    .pipe(dest(`dist/${type}`));
                })
            }
        return cb()
}

exports.default = series(formTheProjectStructure);

/*
1. there are two methods of composing tasks: series and parallel. The metods can be nested into each other. 
2. parallel composing may not stop task execution if an error occurs inside of one of its tasks.
3. 
*/