const SpotifyWebApi = require('spotify-web-api-node');
const app = require('./config');
const port = app.get('port');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({path: path.join(__dirname, '/.env')});

app.get('/', function (req, res) {
  var scopes = ['user-read-private', 'user-read-email'],
    clientId = process.env.CLIENT_ID,
    redirectUri = process.env.REDIRECT_URI,
    state = 'auth_test',
    showDialog = true,
    responseType = 'token';

  // Setting credentials can be done in the wrapper's constructor, or using the API object's setters.
  var spotifyApi = new SpotifyWebApi({
    redirectUri: redirectUri,
    clientId: clientId
  });

  var authorizeURL = spotifyApi.createAuthorizeURL(scopes, state, showDialog, responseType);
  res.render('index',{spotify_auth_link:authorizeURL});
});

app.all('/callback', function (req, res) {
  res.render('callback');
});

app.post('/callback_handle', function (req, res) {
  var token = req.body.token.split('=')[1]
  token = token.substring(0, token.length-11)

  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ 'url': 'http://'+req.get('host')+'/user'}, null, 3));
});

app.all('/user', function (req, res) {
  res.render('user');
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
