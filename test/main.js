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

var rr = L.featureGroup().addTo(map);
var ss = L.featureGroup().addTo(map);
var pp = L.featureGroup().addTo(map);

function drawRectangles(bb) {

	let rects = overpassCache(bb);

	let color = textToColor(bb.toBBoxString());

	for(let i in rects) {
		
		let rect = L.rectangle(rects[i], {
			color: color
		}).addTo(pp);

		let cen = rect.getCenter();

		L.marker(cen, {
			icon: L.divIcon({
				html: i
			})
		})
		.addTo(pp);
	}
}

let mbb = map.getBounds();

map.on('click', function(e) {
	//console.log(e.latlng)
})
.on('mousemove', function(e) {
	let l = e.latlng.lat.toFixed(4)+' '+e.latlng.lng.toFixed(4)
	$('.leaflet-control-attribution').text(l)
});

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
		featureGroup: rr
	}
})
.addTo(map);

map
.on('draw:drawstart', function(e) {
	rr.clearLayers();
}).on('draw:created', function (e) {
	
	var type = e.layerType,
		rect = e.layer;
	
	rect.addTo(rr);

	let bb = rect.getBounds();

	drawRectangles(bb);
})
.on('move zoom', function(e) {

	let bb = map.getBounds().pad(-0.6);

	ss.clearLayers();

	L.rectangle(bb, {
		color: 'red'
	}).addTo(ss);

})
.on('moveend zoomend', function(e) {

	let bb = map.getBounds().pad(-0.6);

	drawRectangles(bb);

});
