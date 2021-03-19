const express = require("express");
const path = require('path');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const SpotifyWebApi = require('spotify-web-api-node');
const dotenv = require('dotenv');

const keys = require("../../mongo_config/keys");
const router = express.Router();

dotenv.config({path: path.join(__dirname, '/.env')});

function get_token(){
  return new Promise((resolve, reject) => {
    var spotifyApi = new SpotifyWebApi({
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET
    });

    spotifyApi.clientCredentialsGrant().then(
      function(data) {
        spotifyApi.setAccessToken(data.body['access_token']);
        resolve(spotifyApi)
      },
      function(err) {
        console.log('Something went wrong when retrieving an access token', err);
        reject(null)
      }
    );
  });
}

router.get('/spotify_signin', function (req, res) {
  var scopes = ['user-read-private',
                'user-modify-playback-state',
                'user-read-playback-state',
                'user-read-currently-playing',
                "streaming",
                "user-read-email"
              ],
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
  res.send(authorizeURL);
});

router.post('/search_playlist', function (req, res) {
  let playlist = req.body.playlist

  get_token().then((spotifyApi) => {
      if (playlist && playlist.trim().length > 0){
        spotifyApi.searchPlaylists(playlist.trim(), {limit: 10})
        .then(function(data) {
          var out = []
          for(var i=0; i<data.body.playlists.items.length; i++)
            out.push({
              name: data.body.playlists.items[i].name,
              owner: data.body.playlists.items[i].owner.display_name,
              id: data.body.playlists.items[i].id
            })

          res.json({results: out})
        }, function(err) {
          console.log('Something went wrong!', err);
          res.json({results: []})
        });
      }else{
        res.json({results: []})
      }
    });
});

router.post('/search_song', function (req, res) {
  let track = req.body.song

  get_token().then((spotifyApi) => {
    if (track && track.trim().length > 0){
      spotifyApi.searchTracks(track.trim(), {limit: 10})
      .then(function(data) {
        var out = []
        for(var i=0; i<data.body.tracks.items.length; i++)
          // console.log(data.body.tracks.items[i].artists);
          out.push({
            name: data.body.tracks.items[i].name,
            artist: data.body.tracks.items[i].artists[0].name,
            uri: data.body.tracks.items[i].uri,
            id: data.body.tracks.items[i].id
          })

        res.json({results: out})
      }, function(err) {
        console.log('Something went wrong!', err);
        res.json({results: []})
      });
    }else{
      res.json({results: []})
    }
  });
});

module.exports = router;
