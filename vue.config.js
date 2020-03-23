const path = require('path');
const MonacoEditorPlugin = require('monaco-editor-webpack-plugin');

function resolveSrc(_path) {
	return path.join(__dirname, _path);
}
// vue.config.js
module.exports = {
	lintOnSave: true,
	configureWebpack: {
		// Set up all the aliases we use in our app.
		resolve: {
			alias: {
				assets: resolveSrc('src/assets'),
				'@': resolveSrc('src'),
			}
		},
		plugins: [
			new MonacoEditorPlugin({
				// https://github.com/Microsoft/monaco-editor-webpack-plugin#options
				// Include a subset of languages support
				// Some language extensions like typescript are so huge that may impact build performance
				// e.g. Build full languages support with webpack 4.0 takes over 80 seconds
				// Languages are loaded on demand at runtime
				languages: ['javascript', 'css', 'html', 'typescript'],
				features: ['!gotoSymbol'],
			}),
		],
	},
	css: {
		// Enable CSS source maps.
		sourceMap: process.env.NODE_ENV !== 'production'
	}
};
