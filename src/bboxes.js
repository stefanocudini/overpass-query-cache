
const fs = require('fs');

const turf = require('@turf/turf');

const { Gtfs } = require('@transit/gtfs');

const gtfspath = process.argv[2];

const gtfs = new Gtfs(gtfspath);

var points = [];
var pp = [];

const prec = 6;
const bufferInKm = +(process.argv[3]) || 30;	//TODO as external param
const gridSize = +(process.argv[4]) || 40;

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

/* SIMPLE ONE BBOX
var bboxPoints = turf.bbox(multiPoint);

var bboxPolygon = turf.bboxPolygon(bboxPoints);

var bboxBuff = turf.buffer(bboxPolygon, bufferInKm, {units: 'kilometers'})

var bbox = turf.bbox(bboxBuff);

var bboxFlip = bboxFlip(bbox);
*/
 
/* MULTIPLE SUB BBOXES */
var convex = turf.convex(multiPoint, {maxEdge:1, units:'kilometers'});
//TODO var convexSimply = turf.simplify(convexBuff, {tolerance: 0.01, highQuality: false});
//USE IN CASE OF LITTLE gridSize var convexBuff = turf.buffer(convex, bufferInKm, {units:'kilometers'})

var convexBbox = turf.bbox(convex);

var convexBboxBuff = turf.buffer(turf.bboxPolygon(convexBbox), bufferInKm, {units:'kilometers'})

//var convexBboxPoly = turf.bboxPolygon(convexBboxBuff);

//15km of tasselation bboxes
var squareGrid = turf.squareGrid(turf.bbox(convexBboxBuff), gridSize, {mask: convex, units: 'kilometers'});


var outCollection = turf.featureCollection([
  multiPoint,
  convex,
  convexBboxBuff
]);


var bboxes = squareGrid.features.map((f)=> {

	outCollection.features.push(f)

	return turf.bbox(f);
	//return bboxFlip(turf.bbox(f));
});

var out = {
	stops: points.length,
	buffer: bufferInKm,
	bboxes: bboxes,
	overpass: bboxes.map((b)=> {
		return 'https://overpass-api.de/api/map?bbox='+(b).toString();
	})
}


if(process.argv.indexOf('--overpass')>-1) {
	console.log(out.overpass.join("\n"));
}
else if (process.argv.indexOf('--stops')>-1) {
	process.stdout.write(JSON.stringify(multiPoint));
}
else if (process.argv.indexOf('--geojson')>-1) {
	process.stdout.write(JSON.stringify(outCollection));
}
else
	console.log(JSON.stringify(out,null,4));
