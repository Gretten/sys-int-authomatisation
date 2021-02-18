/*
todo:
1. get the path handler outta this file
2. add form action attr cleaner
3. compose functions
*/


const { src, dest, series, parallel }   = require('gulp');
const imagemin                          = require('gulp-imagemin');
const imageminJpegRecompress            = require('imagemin-jpeg-recompress');
const pngquant                          = require('imagemin-pngquant');
const cheerio                           = require('gulp-cheerio');
const flatten                           = require('gulp-flatten');
const entities                          = require('gulp-html-entities');


function pathHandler() {
    let attrs = this.attribs;
    let check = /\.(jpg|png|jpeg|gif|svg)/gi;
    let reg = /[^\/]*(\.jpg|\.jpeg|\.png|\.gif|\.svg|\.css|\.js)/gi;
    if (attrs.src) {

        if (~attrs.src.indexOf('.js')) {
            let clean = attrs.src.match(reg)[0];
            this.attribs.src = 'js/' + clean;
        } else if (~attrs.src.search(check)) {
            let clean = attrs.src.match(reg)[0];
            this.attribs.src = 'img/' + clean;
        } else {
            console.log('Ошибка в ' + attrs.src)
        }

    } else if (attrs.href) {
        if (~attrs.href.indexOf('.css')) {
            let clean = attrs.href.match(reg)[0];
            this.attribs.href = 'css/' + clean;
        } else {
            console.log('Ошибка в ' + attrs.href)
        }
    }
}


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
            fonts: ['otf', 'ttf'],
            html: ['html'],
            video: ['mp4'],
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

const links = () => {
    return src(['src/index.html'])
        .pipe(cheerio(function($) {
            $('img').each(function() {
                pathHandler.call(this);
            });
            $('script').each(function() {
                pathHandler.call(this);
            });
            $('link').each(function() {
                pathHandler.call(this);
            });
            $('a').each(function() {
                this.attribs.href = "";
            });
            $('form').each(function() {
                this.attribs.action = "";
            });
        }))
        .pipe(entities('decode'))
        .pipe(dest('dist/'));
}


exports.default = series(links);

/*
1. there are two methods of composing tasks: series and parallel. The metods can be nested into each other. 
2. parallel composing may not stop task execution if an error occurs inside of one of its tasks.
3. 
*/