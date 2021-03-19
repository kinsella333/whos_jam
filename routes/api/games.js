const express = require("express");
const path = require('path');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require('dotenv');
const SpotifyWebApi = require('spotify-web-api-node');
const stringSimilarity = require("string-similarity");

const keys = require("../../mongo_config/keys");
const Game = require("../../models/Game");
const router = express.Router();

dotenv.config({path: path.join(__dirname, '/.env')});

function build_game_obj(id, creater, buffer, bot_playlist, players){
  let temp_songs = [{"id":"1iQDltZqI7BXnHrFy4Qo1k","uri":"spotify:track:1iQDltZqI7BXnHrFy4Qo1k","artist":"SHAED","name":"Trampoline (with ZAYN)"},{"id":"4R2kfaDFhslZEMJqAFNpdd","uri":"spotify:track:4R2kfaDFhslZEMJqAFNpdd","artist":"Taylor Swift","name":"cardigan"},{"id":"3UIGE2FXaUUcYWA31Og0XO","uri":"spotify:track:3UIGE2FXaUUcYWA31Og0XO","artist":"Snakehips","name":"Summer Fade (feat. Anna of the North)"},{"id":"5WfACgyEk4rwdWU3rrzNt1","uri":"spotify:track:5WfACgyEk4rwdWU3rrzNt1","artist":"James Blake","name":"Godspeed"},{"id":"1NxHgM5nOnmqi3KUVLbaIw","uri":"spotify:track:1NxHgM5nOnmqi3KUVLbaIw","artist":"Lewis Capaldi","name":"Leaving My Love Behind"},{"id":"1tUdd0dSQ5ij2XiqlWhlHX","uri":"spotify:track:1tUdd0dSQ5ij2XiqlWhlHX","artist":"Griff","name":"Good Stuff"},{"id":"3Z8FwOEN59mRMxDCtb8N0A","uri":"spotify:track:3Z8FwOEN59mRMxDCtb8N0A","artist":"Marshmello","name":"Be Kind (with Halsey)"},{"id":"5mpCx2nbXtAbnzd342Mwrb","uri":"spotify:track:5mpCx2nbXtAbnzd342Mwrb","artist":"Aloe Blacc","name":"I Do"},{"id":"6Ldq5GpaIafEi67Cuh2h3X","uri":"spotify:track:6Ldq5GpaIafEi67Cuh2h3X","artist":"Maximillian","name":"Still Alive"},{"id":"364dI1bYnvamSnBJ8JcNzN","uri":"spotify:track:364dI1bYnvamSnBJ8JcNzN","artist":"Justin Bieber","name":"Intentions"},{"id":"0E4Y1XIbs8GrAT1YqVy6dq","uri":"spotify:track:0E4Y1XIbs8GrAT1YqVy6dq","artist":"Ed Sheeran","name":"Afterglow"},{"id":"4IaizE26moyyMYn70TeFiX","uri":"spotify:track:4IaizE26moyyMYn70TeFiX","artist":"Quinn XCII","name":"We Don’t Talk Enough (with Alexander 23)"},{"id":"3VcFoOwKYurSedLtz9nFJC","uri":"spotify:track:3VcFoOwKYurSedLtz9nFJC","artist":"Alexander 23","name":"Brainstorm"},{"id":"3YJJjQPAbDT7mGpX3WtQ9A","uri":"spotify:track:3YJJjQPAbDT7mGpX3WtQ9A","artist":"SZA","name":"Good Days"},{"id":"16R8t4bIoFrzxZm3ds4isv","uri":"spotify:track:16R8t4bIoFrzxZm3ds4isv","artist":"Jeremy Zucker","name":"julia"},{"id":"04NMWz4ctkuILV6mUR2iWp","uri":"spotify:track:04NMWz4ctkuILV6mUR2iWp","artist":"Sasha Sloan","name":"Lie"},{"id":"6qQ8a6M6o5mfj9wTdrbSgG","uri":"spotify:track:6qQ8a6M6o5mfj9wTdrbSgG","artist":"Shallou","name":"Older"},{"id":"00cBcYOlnHoXX9ver3cmdE","uri":"spotify:track:00cBcYOlnHoXX9ver3cmdE","artist":"JP Saxe","name":"A Little Bit Yours"}]

  let names = ['Hailey', 'Courtney', 'Grace', 'Lubo', 'Tim', 'Boris', 'Botten', 'Evan', 'Elle', 'Jack', 'Alex', 'Nirvan', 'Nicole K', 'Nicole T', 'Haley', 'Madi', 'Fred', 'George']
  let temp = []
  for(var i=0; i< names.length; i++){
    temp.push({
      name: names[i],
      song: temp_songs[i]
    })
  }
  const newGame = new Game({
    id: id,
    created_by: creater,
    buffer: buffer,
    bot_playlist: bot_playlist,
    state: 'L',
    players: temp
  });
  newGame.save()
}

function get_playlist_songs(game, playlists){
  return new Promise(function(resolve,reject){
    get_token().then((spotifyApi) => {
      var songs = []
      var p_songs = []
      var duplicate = false
      var count = 0

      for(var j=0; j<playlists.length; j++){
        p_songs = []

        spotifyApi.getPlaylistTracks(playlists[j]).then(function(data) {
          p_songs = data.body.items
          for(var i=0; i<p_songs.length;i++){

            try{
              for(var k=0; k<songs.length; k++){
                if(stringSimilarity.compareTwoStrings(songs[k].name, p_songs[i].track.name) > 0.6){
                  duplicate = true
                  break
                }
              }

              if(!duplicate){
                songs.push({
                  id: p_songs[i].track.id,
                  uri: p_songs[i].track.uri,
                  artist: p_songs[i].track.artists[0].name,
                  name: p_songs[i].track.name
                });
              }else{
                duplicate = false
              }

            }catch(err){
              console.log(err);
              continue
            }
          }

          count += 1
          if(count == playlists.length){
            resolve(songs)
          }
        })
      }
    })
  })
}


function create_game(res, creater, buffer, bot, player){
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let charactersLength = characters.length;
  let result = ''

  for(var i = 0; i < 4; i++) result += characters.charAt(Math.floor(Math.random() * charactersLength));

  return new Promise(function(resolve, reject){
    Game.findOne({ id: result }).then(game => {
      if(!game){
        if(buffer.playlists.length > 0){

          get_playlist_songs(game, buffer.playlists).then(function(songs){
            buffer = {
              min: buffer.min,
              max: buffer.max,
              playlist: {
                ids: buffer.playlists,
                songs: songs
              }
            }

            if(!player)
              player = []

            get_playlist_songs(game, bot.playlists).then(function(bot_songs){
              bot_playlist = {
                ids: bot.playlists,
                songs: bot_songs
              }

              build_game_obj(result, creater, buffer, bot_playlist, [player])
              resolve(result)
            })
          })
        }else{
          if(!player)
            player = []

          buffer = {
            min: 0,
            max: 0,
            playlist: {
              ids: [],
              songs:[]
            }
          }

          get_playlist_songs(game, bot.playlists).then(function(bot_songs){
            bot_playlist = {
              ids: bot.playlists,
              songs: bot_songs
            }

            build_game_obj(result, creater, buffer, bot_playlist, [player])
            resolve(result)
          })
        }
      }else{
        reject('Game not found')
      }
    });
  });
}

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

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  while (0 !== currentIndex) {

    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max) + 1;
  return Math.floor(Math.random() * (max - min) + min);
}

function getRandomRange(min, max) {
  return Math.random() * (max - min) + min;
}

function drop_similar_songs(players, buffer, bots){
  let p_songs = [], buf_songs = [], bot_songs = []
  let buf_drop = [], bot_drop = []

  for(var i=0; i<players.length; i++)
    p_songs.push(players[i].song.name)

  for(var i=0; i<buffer.length; i++)
    buf_songs.push(buffer[i].name)

  for(var i=0; i<bots.length; i++)
    bot_songs.push(bots[i].name)

  for(var i=0; i<p_songs.length; i++){
    for(var j=0; j<buf_songs.length; j++){
      if(stringSimilarity.compareTwoStrings(p_songs[i], buf_songs[j]) > 0.6){
        buf_drop.push(j)
      }
    }

    for(var j=0; j<bot_songs.length; j++){
      if(stringSimilarity.compareTwoStrings(p_songs[i], bot_songs[j]) > 0.6)
        bot_drop.push(j)
    }
  }

  buf_drop.sort(function(a, b) {
    return b-a;
  });
  for(var i=0; i<buf_drop.length; i++){
    buffer.splice(buf_drop[i], 1);
  }

  bot_drop.sort(function(a, b) {
    return b-a;
  });
  for(var i=0; i<bot_drop.length; i++){
    bots.splice(bot_drop[i], 1);
  }

  return [buffer, bots]
}


router.get('/create_game', function(req, res, next) {
  res.render('create_game.njk')
})

router.get("/create_game.js", function (req, res) {
    res.sendFile(path.resolve('client_scripts/create_game.js'));
});

router.get("/game/game.js", function (req, res) {
    res.sendFile(path.resolve('client_scripts/game.js'));
});

router.post("/game/:game_id/device_id", function (req, res) {
  var expire = new Date()
  expire.setMinutes(expire.getMinutes() + 60*24);

  res.cookie('device_id',req.body.device_id,{
      signed:true,
      expires:expire
  });
  res.status(200).send('Logged')
});

router.post("/game/:game_id/change_song", function (req, res) {
  let forward = req.body.forward == "true" ? true : false

  if(req.signedCookies['admin']){
    Game.findOne({ id: req.signedCookies['game']}).then(game => {
      if(game){
        let index = game.current_song

        if(forward == true) index +=1
        else index -= 1

        if(index < 0) res.status(200).send({error: 'Can Not Go Back Any More.'})
        else if(index > game.final_playlist.length) res.status(200).send({error: 'Final Song Reached'})
        else{
          let next_song = game.final_playlist[index]

          game.current_song = index
          game.save()

          res.status(200).send({entry: next_song})
        }
      }
      else{
        res.status(200).send({error: 'Cant Find Game'})
      }
    })
  }
});

router.post('/launch_game', function(req, res, next) {
  let creater = req.signedCookies['admin']
  let buffer = null
  let player = null
  let bot = null

  if(req.body.buffer)
    buffer = JSON.parse(req.body.buffer)
  else {
    buffer = {
      min: 0,
      max: 0,
      playlists: []
    }
  }

  if(req.body.bot)
    bot = JSON.parse(req.body.bot)

  if(req.body.player){
    player = JSON.parse(req.body.player)
    player.song = JSON.parse(player.song)
  }

  create_game(res, creater, buffer, bot, player).then((game_id) => {
    var game = {
      url: 'http://'+req.headers.host+'/api/games/game',
      game_id: game_id
    }
    var expire = new Date()
    expire.setMinutes(expire.getMinutes() + 24*60*30);

    if(player){
      res.cookie('game_name',player.name,{
          signed:true,
          expires:expire
      });
    }
    res.cookie('game', game_id,{
        signed:true,
        expires:expire
    });
    res.send(game)
  }).catch(error => {
    console.log(error);
    create_game(res, creater, buffer, player).then((game_id) => {
      var game = {
        url: 'http://'+req.headers.host+'/api/games/game',
        game_id: game_id
      }
      res.send(game)
    }).catch(error => {
      res.status(500).send()
    });
  });
})

router.get('/game/:game_id', function(req, res, next) {
  res.render('game.njk')
})

router.get('/game/:game_id/lobby', function(req, res, next) {
  let game_id = req.signedCookies['game'];
  res.render('lobby.njk', {id: game_id})
})

router.get('/game/:game_id/lobby.js', function(req, res, next) {
  res.sendFile(path.resolve('client_scripts/lobby.js'))
})

router.get('/game/:game_id/get_players', function(req, res, next) {
  Game.findOne({ id: req.signedCookies['game']}).then(game => {
    if(game){
      if(game.players[0].name)
        res.status(200).send(game.players)
      else
        res.status(200).send([])
    }else{
      console.log('Error Pulling Players.');
    }
  });
})

router.post('/add_player', function(req, res, next) {
  let player = JSON.parse(req.body.player)
  player.song = JSON.parse(player.song)
  let game_id = req.signedCookies['game']

  Game.findOne({id: game_id}).then(game => {
    if(game){
      let players = game.players
      let player_exists = false
      let song_exists = false

      for(var i=0; i<players.length; i++){
        if (players[i].name == player.name){
          player_exists = true
          break
        }
        if(players[i].song.id == player.song.id){
          song_exists = true
          break
        }
      }

      if(player_exists){
        res.status(404).send('Player With that name already in Game')
      }else if(song_exists){
        res.status(404).send('Player With that song already in Game')
      }else{
        if(!game.players[0].name)
          game.players = [player]
        else
          game.players.push(player)

        game.save()
        res.status(200).send({url: 'http://'+req.headers.host+'/api/games/game/' + game_id + '/lobby'})
      }
    }else
      res.status(404).send('Game Not found')
  });
})

router.post('/join_game', function(req, res, next) {
  let game_id = req.body.game_id
  Game.findOne({id: game_id}).then(game => {
    if(game){
      var expire = new Date()
      expire.setMinutes(expire.getMinutes() + 24*60*30);

      res.cookie('game',game_id,{
          signed:true,
          expires:expire
      });
      res.status(200).send({url: 'http://'+req.headers.host+'/api/games/game/' + game_id + '/create_entry'})
    }else
      res.status(404).send('Game Not found')
  });
})

router.get('/game/:game_id/create_entry', function(req, res, next) {
  res.render('create_entry.njk')
})

router.get('/game/:game_id/create_entry.js', function(req, res, next) {
  res.sendFile(path.resolve('client_scripts/create_entry.js'))
})

router.post('/game/:game_id/game_state', function(req, res, next) {
  let game_id = req.signedCookies['game']
  let current_state = req.body.state

  if(current_state != 'L' && current_state != 'G' && current_state != 'E')
    res.status(400).send('Bad State')

  Game.findOne({id: game_id}).then(game => {
    if(game){
      let current_song = undefined
      if(game.current_song > -1 && game.current_song < game.final_playlist.length)
        current_song = game.final_playlist[game.current_song]

      if(game.state == current_state){
        res.send({current_song: current_song, paused: game.paused, score: game.song_score, resolve: game.resolve})
      }else{
        if(game.state == 'G'){
          res.send({url: 'http://'+req.headers.host+'/api/games/game/' + game_id, current_song: current_song})
        }else if(game.state == 'L'){
          res.send({url: 'http://'+req.headers.host+'/api/games/game/' + game_id + '/lobby'})
        }else{
          if (game_id) res.clearCookie('game')
          res.send({url: 'http://'+req.headers.host+'/api/games/game/' + game_id + '/game_over'})
        }
      }
    }else{
      res.send({url: 'http://'+req.headers.host+'/api/games/game/game_not_found'})
    }
  });
})

router.get('/game/:game_id/create_playlist', function(req, res, next) {
  let game_id = req.signedCookies['game']

  if(req.signedCookies['admin']){
    Game.findOne({id: game_id}).then(game => {
      if(game){
        var players = shuffle(game.players)
        var bots = shuffle(game.bot_playlist.songs)
        var buffer = shuffle(game.buffer.playlist.songs)
        var num_bots = Math.ceil(players.length/2)
        var p_cnt = 0, buf_cnt = 0, bot_cnt = 0, buff_num = 0, roll = 0

        if(num_bots > 5)
          num_bots = 5

        if(game.buffer.playlist.ids.length == 0)
          buffer = []

        game.final_playlist = []
        [buffer, bots] = drop_similar_songs(players, buffer, bots)

        for(var i=0; i<num_bots + players.length; i++){
          roll = getRandomRange(0,1)
          if(p_cnt < players.length){
            if((i == 0 || roll > 0.2)){
              game.final_playlist.push({
                name: players[p_cnt].name,
                song: players[p_cnt].song
              })
              p_cnt += 1
            }else{
              game.final_playlist.push({
                name: 'Bot',
                song: bots[bot_cnt]
              })
              bot_cnt += 1
            }
          }else if(roll <= 0.2){
            game.final_playlist.push({
              name: 'Bot',
              song: bots[bot_cnt]
            })
            bot_cnt += 1
            break
          }else{
            break
          }

          buff_num = getRandomInt(game.buffer.min, game.buffer.max)
          for(var j=0; j<buff_num; j++){
            game.final_playlist.push({
              name: 'Buffer',
              song: buffer[buf_cnt]
            })
            buf_cnt += 1
          }
        }

        game.final_playlist = game.final_playlist.slice(2, game.final_playlist.length + 1);
        game.save()
        res.status(200).send('Created Playlist')
      }else{
        res.status(400).send('Game Not Found.')
      }
    })
  }else{
    res.status(400).send('Not Admin.')
  }
})

router.get('/game/:game_id/game_over', function(req, res, next) {
  let game_id = req.signedCookies['game']
  res.render('game_over.njk', {game_id: game_id})
})

router.get('/game/game_not_found', function(req, res, next) {
  res.render('game_not_found.njk')
})

router.post('/game/:game_id/set_game_state', function(req, res, next) {
  let game_id = req.signedCookies['game'];
  let admin_id = req.signedCookies['admin'];
  let state = req.body.state

  if(state != 'L' && state != 'G' && state != 'E')
    res.status(400).send('Bad State')

  if(admin_id){
    Game.findOne({id: game_id}).then(game => {
      if(game){
        game.state = state
        game.save()
        res.send('Cleared')
      }else {
        res.status(404).send()
      }
    })
  }else{
    res.status(400).send('Not Admin')
  }
})

router.get('/game_clear', function(req, res, next) {
  let game_token = req.signedCookies['game'];
  if (game_token) res.clearCookie('game')
  res.send('Cleared')
})

router.post('/game/:game_id/queue_song', function(req, res, next) {
  let game_id = req.signedCookies['game'];
  let req_song = JSON.parse(req.body.song)

  Game.findOne({id: game_id}).then(game => {
    if(game){
      let index = game.current_song +1
      let playlist = game.final_playlist
      let replace_song = -1
      let duplicate = false

      for(var i=0; i<playlist.length; i++){
        if(stringSimilarity.compareTwoStrings(playlist[i].song.name, req_song.name) > 0.8)
          duplicate = true
      }

      if(duplicate){
        res.status(200).send('Song Already in Queue.')
      }else{
        for(var i=index; i<playlist.length; i++){
          if(i>index && playlist[i].name == 'Buffer'){
            replace_song = i
            break
          }
        }

        if(replace_song != -1){
          game.final_playlist[replace_song].song = req_song
          game.final_playlist[replace_song].name = 'Queue'
          game.save()
          res.status(200).send('Your Song Will be on in ' + (replace_song - game.current_song) + ' songs.')
        }else{
          res.status(200).send('Not enough Songs Left to Queue')
        }
      }
    }
  });
})

router.post('/game/:game_id/pause_toggle', function(req, res, next) {
  let game_id = req.signedCookies['game'];

  Game.findOne({id: game_id}).then(game => {
    if(game){
      console.log(req.body.paused);
      game.paused = req.body.paused
      game.save()
    }
  })
  res.status(200).send()
})

router.post('/game/:game_id/song_score', function(req, res, next) {
  let game_id = req.signedCookies['game'];

  Game.findOne({id: game_id}).then(game => {
    if(game){
      game.song_score = req.body.score
      game.save()
    }
  })
  res.status(200).send()
})

router.post('/game/:game_id/resolve', function(req, res, next) {
  let game_id = req.signedCookies['game'];

  Game.findOne({id: game_id}).then(game => {
    if(game){
      game.resolve = req.body.resolve
      game.save()
    }
  })
  res.status(200).send()
})

module.exports = router;
