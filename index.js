const SpotifyWebApi = require('spotify-web-api-node');
const app = require('./config');
const path = require('path');
const dotenv = require('dotenv');
const nunjucks = require('nunjucks');
const crypto = require('crypto');

const admins = require("./routes/api/admins");
const games = require("./routes/api/games");
const spotify = require("./routes/api/spotify");

dotenv.config({path: path.join(__dirname, '/.env')});
nunjucks.configure('views', {
  autoescape: true,
  express: app
})

app.use("/api/admins", admins);
app.use("/api/games", games);
app.use("/api/spotify", spotify);

app.get('/', function(req, res, next) {
  res.render('index.njk')
})

app.get('/home.js', function(req, res, next) {
  res.sendFile(path.resolve('client_scripts/home.js'))
})

app.get('/admin', function(req, res, next) {
  let admin_token = req.signedCookies['admin'];

  if (admin_token) res.render('admin.njk')
  else res.redirect('/api/admins/admin_login')
});

app.get('/admin.js', function(req, res, next) {
  res.sendFile(path.resolve('client_scripts/admin.js'))
});

app.get('/callback', function (req, res) {
  let admin_token = req.signedCookies['admin'];

  if (admin_token) res.render('callback.njk')
  else res.redirect('/api/admins/admin_login')
});

app.post('/callback', function (req, res) {
  let hash = req.body.spotify_hash.split('=')[1];
  hash = hash.substring(0, hash.length-11)
  let admin_token = req.signedCookies['admin'];
  let game_token = req.signedCookies['game'];

  if(admin_token && hash) {
    var expire = new Date()
    expire.setMinutes(expire.getMinutes() + 60);

    res.cookie('spotify',hash,{
        signed:true,
        expires:expire
    });
    if(game_token)
      res.status(200).send('http://'+req.headers.host+'/api/games/game/'+game_token)
    else
      res.status(200).send('http://'+req.headers.host+'/admin')
  }else{
    res.status(200).send('http://'+req.headers.host+'/api/admins/admin_login')
  }
});


app.listen(process.env.PORT, process.env.HOST,() => {
  console.log(`Example app listening at http://localhost:${process.env.PORT}`)
})
