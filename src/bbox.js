
const fs = require('fs');

const turf = require('@turf/turf');	//https://github.com/turfjs

const { Gtfs } = require('@transit/gtfs');	//https://github.com/TransitApp/gtfsNodeLib

const gtfs = new Gtfs(process.argv[2]);	//pass gtfs unzip directory

var points = [];
var pp = [];

const prec = 6;
const bufferInKm = +(process.argv[3]) || 10;	//TODO as external param

function bboxFlip(bb) {
	return [bb[1],bb[0], bb[3],bb[2]];
}

function writeGeo(file, j) {
	return fs.writeFile(file, JSON.stringify(j), ()=>{});
}

gtfs.forEachStop((stop) => {
  points.push([turf.round(stop.stop_lon,prec), turf.round(stop.stop_lat,prec)]);
});

var multiPoint = turf.multiPoint(points);

/* SIMPLE ONE BBOX */
var bboxPoints = turf.bbox(multiPoint);

var bboxPolygon = turf.bboxPolygon(bboxPoints);

var bboxBuff = turf.buffer(bboxPolygon, bufferInKm, {units: 'kilometers'})

var bbox = turf.bbox(bboxBuff);

var bboxFlip = bboxFlip(bbox);

var bboxoverpass = bbox;
//curl 'https://overpass-api.de/api/map?bbox=10.4233,45.6601,11.9778,46.4908' -o $DIR/trento.osm


var out = {
	stops: points.length,
	buffer: bufferInKm,
	bboxes: [bbox],
	overpass: 'https://overpass-api.de/api/map?bbox='+bboxoverpass.toString(),
	bboxfinder: 'http://bboxfinder.com/#'+bboxFlip.toString()
}

if(process.argv.indexOf('--overpass')>-1) {
	process.stdout.write(out.overpass);
}
else if (process.argv.indexOf('--stops')>-1) {
	process.stdout.write(JSON.stringify(multiPoint));
}
else
	console.log(JSON.stringify(out,null,4));
