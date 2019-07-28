import _ from 'lodash';
import $ from 'jquery';
import 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.js';
import 'leaflet-draw/dist/leaflet.draw.css';
import './main.css';
import overpassCache from './overpassCache.js';

const L = window.L;

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

var	color_codes = {};
function textToColor(str) {
	//https://stackoverflow.com/questions/17845584/converting-a-random-string-into-a-hex-colour
    return (str in color_codes) ? color_codes[str] : (color_codes[str] = '#'+ ('000000' + (Math.random()*0xFFFFFF<<0).toString(16)).slice(-6));
}

window.map = L.map('map', {
	layers: L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'),
	center: [46.0740,11.1476],
	zoom: 15
});

$('.leaflet-control-attribution').empty();

var styleRect = {
	color: 'red',
	fill: false,
	opacity:1,
	weight: 3,
	fillOpacity:0
};

var styleCache = {
	color:'#fff',
	opacity:1,
	/*fillColor: RANDOM,*/
	weight: 1,
	fillOpacity:0.7
}

var layerDraw = L.featureGroup().addTo(map);

var layerCache = L.featureGroup().addTo(map);


var rectsCache = {};

let mbb = map.getBounds();

map.on('click', function(e) {
	//console.log(e.latlng)
})
/*.on('mousemove', function(e) {
	let l = e.latlng.lat.toFixed(4)+' '+e.latlng.lng.toFixed(4)
	$('.leaflet-control-attribution').text(l);
});*/

var drawControl = new L.Control.Draw({
	position:'topright',
	draw: {
		marker: false,
		circle: false,	
		rectangle: true,
		circlemarker: false,
		polyline: false,					    
		polygon: false
	},
	edit: {
		edit: false,
		featureGroup: layerDraw
	}
})
.addTo(map);


function drawCache(bb) {

	let rects = overpassCache(bb);

	let color = textToColor(bb.toBBoxString());

	let countbb = 0;
	for(let rIndex in rects) {

		if(rectsCache[rIndex])
			continue;
		else
			rectsCache[rIndex] = rects[rIndex];

		styleCache.fillColor = color;
		let rect = L.rectangle(rects[rIndex], styleCache)
		.addTo(layerCache);

		//label
		L.marker(rect.getCenter(), {
			icon: L.divIcon({
				html: rIndex
			})
		})
		.addTo(layerCache);

		++countbb;
	}

	if(countbb>0) {
		$('.leaflet-control-attribution')
		.css({background: color})
		.text(countbb+' new bboxes')
	}

	layerDraw.bringToFront();
	layerCache.bringToBack();
}

map
.on('draw:deletestop', function(e) {
	layerDraw.clearLayers();
	layerCache.clearLayers();
})
.on('draw:drawstart', function(e) {
	layerDraw.clearLayers();
})
.on('draw:created', function (e) {
	
	var type = e.layerType,
		rect = e.layer;
	
	rect.setStyle(styleRect).addTo(layerDraw);

	let bb = rect.getBounds();

	drawCache(bb);
})
.on('move zoom', function(e) {

	let bb = map.getBounds().pad(-0.7);

	layerDraw.clearLayers();

	L.rectangle(bb, styleRect).addTo(layerDraw);

})
.on('moveend zoomend', function(e) {

	let bb = map.getBounds().pad(-0.7);

	drawCache(bb);

});
