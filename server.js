var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var webpack = require('webpack');
var webpackMiddleware = require('webpack-dev-middleware');
var webpackHotMiddleware = require('webpack-hot-middleware');
var config = require('./webpack.config');

var COMMENT_FILE = path.join(__dirname, 'comments.json');

// https://github.com/christianalfoni/webpack-express-boilerplate/blob/master/server.js
const isDeveloping = process.env.NODE_ENV !== 'production';
const port = isDeveloping ? 3000 : process.env.PORT;
if (isDeveloping) {
  const compiler = webpack(config);
  const middleware = webpackMiddleware(compiler, {
    publicPath: config.output.publicPath,
    contentBase: 'src',
    stats: {
      colors: true,
      hash: false,
      timings: true,
      chunks: false,
      chunkModules: false,
      modules: false
    }
  });

  app.use(middleware);
  app.use(webpackHotMiddleware(compiler));
  app.get('*', function response(req, res) {
    res.write(middleware.fileSystem.readFileSync(path.join(__dirname, 'dist/index.html')));
    res.end();
  });
} else {
  app.use(express.static(__dirname + '/dist'));
  app.get('*', function response(req, res) {
    res.sendFile(path.join(__dirname, 'dist/index.html'));
  });
}

// app.use('/', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

// Additional middleware which will set headers that we need on each request
app.use(function(req, res, next) {
  // Set permissive CORS header - this allows this server to be used only as
  // an API server in conjunction with something like webpack-dev-server
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Disable caching so we will always get the latest comments.
  res.setHeader('Cache-Control', 'no-cache');
  next();
});

// API for comments: GET
app.get('/api/comments', function(req, res) {
  fs.readFile(COMMENT_FILE, function(err, data) {
    if (err) {
      console.log(err);
      process.exit(1);
    }
    res.json(JSON.parse(data));
  });
});

// API for comments: POST
app.post('/api/comments', function(req, res) {
  fs.readFile(COMMENT_FILE, function(err, data) {
    if (err) {
      console.log(err);
      process.exit(1);
    }
    var comments = JSON.parse(data);
    // NOTE: In a real implementation, we would likely rely on a database or
    // some other approach (e.g UUIDS) to ensure a globally unique id. We'll
    // treat Date.now() as unique-enough for our purposes
    var newComment = {
      id: Date.now(),
      author: req.body.author,
      text: req.body.text,
    };
    comments.push(newComment);
    fs.writeFile(COMMENT_FILE, JSON.stringify(comments, null, 4), function(err) {
      if (err) {
        console.log(err);
        process.exit(1);
      };
      res.json(comments);
    });
  });
});

app.listen(port, function() {
  console.log('Server started: http://localhost:' + port + '/');
});
