
export default function(bb) {

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

	W = w<W ? W-int : w;
	E = e>E ? E+int : e;
	S = s<S ? S-int : s;
	N = n<N ? N : n;

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
	
	return rects;
}