var HTMLWebpackPlugin = require('html-webpack-plugin');
var HTMLWebpackPluginConfig = new HTMLWebpackPlugin({
  template: __dirname + '/public/index.html', // Input HTML file
  filename: 'index.html', // Output HTML file name
  inject: 'body' // Inject the output HTML file to body
});

module.exports = {
  // Entry point or files input
  entry: [
    './public/js/components.js'
  ],
  // Babel loader to convert JSX to JS. .babelrc is used to set the presets
  module: {
    loaders: [{
      test: /\.js$/, // All files end with .js
      include: __dirname + '/public',
      loader: "babel-loader"
    }]
  },
  // Output destination
  output: {
    filename: 'bundle.js',
    path: __dirname + '/dist'
  },
  // Loader HTML plugin
  plugins: [HTMLWebpackPluginConfig]
};
