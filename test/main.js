

import _ from 'lodash';
import $ from 'jquery';
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
	zoom: 14
});

var rr = L.featureGroup().addTo(map)
var pp = L.featureGroup().addTo(map)


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
.on('draw:drawstart', function(ev) {
	rr.clearLayers();
}).on('draw:created', function (ev) {
	
	var type = ev.layerType,
		rect = ev.layer;
	
	rect.addTo(rr);

	let bb = rect.getBounds();

	let w = bb.getWest(),
		e = bb.getEast(),
		s = bb.getSouth(),
		n = bb.getNorth();

	let prec = 2,
		int = 1/(Math.pow(10,prec));

	let W = parseFloat(w.toFixed(prec));
	let E = parseFloat(e.toFixed(prec));
	let S = parseFloat(s.toFixed(prec));
	let N = parseFloat(n.toFixed(prec));

	let bbr = L.latLngBounds(L.latLng(N,W),L.latLng(S,E));

	W = w<W ? W-int : w;
	E = e>E ? E+int : e;
	S = s<S ? S-int : s;
	N = n<N ? N : n;

	let color = util.textToColor([W,E,S,N].join());

	let y = S;

	var rects = {};
	for(let x = W; x<E; x+=int) {

		x = parseFloat(x.toFixed(prec))
		
		for(let y = S; y<N; y+=int) {

			y = parseFloat(y.toFixed(prec))

			let loc = [y,x],
				loc2 = [y+int, x+int];

			rects[y+' '+x] = [loc, loc2];
		}
	}
	
	for(let i in rects) {
		
		let rect = L.rectangle(rects[i], {
			color: color
		}).addTo(pp);

		let cen = rect.getCenter();

		L.marker(cen, {
			icon: L.divIcon({
				html: '<br>'+i
			})
		})
		.addTo(pp);
	}
});
