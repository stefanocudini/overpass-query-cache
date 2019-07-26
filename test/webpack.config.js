const path = require('path');

module.exports = {
	entry: './main.js',
	output: {
		filename: './bundle.js',
		//path: path.resolve(__dirname, 'dist')
	},
	mode: 'development',
	watch: true,
	module: {
		rules: [
			{
				test: /\.css$/,
				use: [
					{ loader: "style-loader" },
					{ loader: "css-loader" }
				]
			},
			{
				test: /\.js$/,
				exclude: /(node_modules)/,
				use: { 
					loader: 'babel-loader',
					options: {
						presets: ['env']
					}
				} 
			},
			{
		      test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/,
		      use: {
		      	loader: 'file-loader',
		      	options: {
		      		//https://github.com/webpack-contrib/file-loader#publicpath
		      		publicPath: 'dist/images/',
		      		outputPath: 'images'
		      	}
		      }
		    }
		]
	}
};