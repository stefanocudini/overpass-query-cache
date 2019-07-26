

import _ from 'lodash';
import 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.js';
import 'leaflet-draw/dist/leaflet.draw.css';
import './main.css';

const L = window.L;

window.util = {
	deg2rad: function(deg) {
		return deg * (Math.PI/180);
	},
	meters2rad: function(m) {
		return (m/1000)/111.12;
	},
	textToColor: function(str) {
		//https://stackoverflow.com/questions/17845584/converting-a-random-string-into-a-hex-colour
		this.color_codes = {};
	    return (str in this.color_codes) ? this.color_codes[str] : (this.color_codes[str] = '#'+ ('000000' + (Math.random()*0xFFFFFF<<0).toString(16)).slice(-6));
	}
};
//L.Icon.Default.imagePath = '.';
// OR
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

window.map = L.map('map', {
	layers: L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'),
	center: [46.0740,11.1476],
	zoom: 12
});

var rr = L.featureGroup().addTo(map)
var pp = L.featureGroup().addTo(map)


let mbb = map.getBounds();

map.on('click', function(e) {
	//console.log(e.latlng)
})
/*.on('mousemove', _.debounce(function(e) {
	//L.marker(e.latlng).addTo(map);
},100))*/

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

	let W = bb.getWest(),
		E = bb.getEast(),
		S = bb.getSouth(),
		N = bb.getNorth();
	
	let prec = 2,
		interval = 1/(Math.pow(10,prec));
	
	W -= Math.max((E-W)/2, interval);
	S -= Math.max((N-S)/2, interval);
	//E += interval;
	//N += interval;
	//expand bounding box of 1 interval size

	W = parseFloat(W.toFixed(prec));
	E = parseFloat(E.toFixed(prec));
	S = parseFloat(S.toFixed(prec));
	N = parseFloat(N.toFixed(prec));

	let color = util.textToColor([W,E,S,N].join());

	let y = S;
	
	let rects = [];

	for(let x = W; x<=E; x+=interval) {
		
		for(let y = S; y<=N; y+=interval) {

			let loc = [y,x],
				loc2 = [y+interval, x+interval];

			rects.push([loc, loc2]);
		}
	}

	console.log(rects)
	
	for(let r in rects) {
		
		let rect = L.rectangle(rects[r], {
			color: color
		}).addTo(pp);

		let cen = rect.getCenter();

		L.marker(cen, {
			icon: L.divIcon({
				html: '<br><small>'+cen.lat.toFixed(4)+' '+cen.lng.toFixed(4)+'</small>'
			})
		})
		.addTo(pp);
	}
});
