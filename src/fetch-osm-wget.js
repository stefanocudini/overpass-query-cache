/*
    parallel downloader of openstreetmap data
    from a list of bounding boxes 
 */
const fs = require('fs');
const queue = require('queue');
const wget = require('wget-improved');  //https://github.com/bearjaws/node-wget

const outdir = './osm';

if(!fs.existsSync(outdir))
    fs.mkdirSync(outdir);

function humanBytes(bytes) {
    if (bytes === 0) return bytes;      
    var sizes = ['Bytes','KB','MB','GB','TB'],
        i = +(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 1) + ' ' + sizes[i];
}

function bbox2url(bbox) {

    //list https://wiki.openstreetmap.org/wiki/Overpass_API
    var ss = [
    /* uncomment to use more data sources */
            'https://overpass-api.de',
            'https://z.overpass-api.de',
            'https://lz4.overpass-api.de',
            //'https://overpass.kumi.systems',
            //'https://overpass.nchc.org.tw',
            //'http://overpass.openstreetmap.fr',
            //'http://overpass.osm.ch'
        ],
        randHost = ss[Math.floor(Math.random()*ss.length)];

    return randHost+'/api/map?bbox='+bbox.toString();
    //return 'http://localhost/test.txt?bbox='+bbox.toString();
}

function bbox2file(bbox) {
    return outdir+'/'+(bbox.toString().replace(/,/g,'_'))+'.osm';
}


function downloadBbox(bbox) {
    return function(cb) {
        try
        {
            var url = bbox2url(bbox),
                file = bbox2file(bbox);

            if(fs.existsSync(file)) {
                console.log('just done', file);
                cb();
                return;//fs.unlinkSync(file);
            }

            var download = wget.download(url, file);

            download.on('end', function(output) {
                console.log('done', file);
                cb();
            });
            download.on('start', function(fileSize) {
                console.log('start...', url)
            });
          /*  download.on('progress', function(progress) {
                console.log('progress...',progress)
            });*/
            download.on('error', function(err) {
                console.log('error',err,url);
            });

        } catch(err) {
            console.log('ERROR', err)
        }
    };
};

//read json stdin from pipe
var chunks = [];
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function (chunk) {
    chunks.push(chunk);
});

process.stdin.on('end', function () {
    var inputJSON = chunks.join(),
        json = JSON.parse(inputJSON),
        bb = json.bboxes;

    const bboxes = json.bboxes;//[bb[0],bb[1],bb[3]];
    
    var q = queue();

    q.concurrency = 2;

    bboxes.forEach(b => {
        q.push( downloadBbox(b) );
    });

    q.start();

});
