function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    let t = parts.pop().split(';').shift();
    return t.substring(4, t.length).split('.')[0]
  }
}

if (getCookie('game_name')){
 $("div.player_block").css('visibility', 'visible');
}

setInterval(get_state, 5000)
window.sessionStorage.setItem("user_pause", 'no')
window.sessionStorage.setItem('autoplayed','no')

if(!window.sessionStorage.getItem("play_state")){
  window.sessionStorage.setItem("play_state", 'null')
}

if(!window.sessionStorage.getItem("point_total")){
  window.sessionStorage.setItem("point_total", '1000')
}

if(!window.sessionStorage.getItem("song_position")){
  window.sessionStorage.setItem("song_position", "0")
}

if(!window.sessionStorage.getItem("game_pause")){
  window.sessionStorage.setItem("game_pause", "no")
}

if(!window.sessionStorage.getItem("resolve")){
  window.sessionStorage.setItem("resolve", "no")
}else if(window.sessionStorage.getItem("resolve") == 'yes'){
  reveal_submission()
}

var p_score;
var play = document.getElementById("play");
var pause = document.getElementById("pause");
var next = document.getElementById("next");
var prev = document.getElementById("previous");

play.disabled = true;
pause.disabled = true;
next.disabled = true;
prev.disabled = true;
populate_player_list()

$.ajax({
  url: '/api/games/game/' + getCookie('game') + '/game_state',
  type:'POST',
  datatype: 'json',
  data: {state: 'G'},
  success: function(result){
    if(result.url){
      window.location.href=result.url
    }
    if(result.current_song){
      window.sessionStorage.setItem("current_song", JSON.stringify(result.current_song))
    }
  }
})

if(getCookie('spotify')){
  window.onSpotifyWebPlaybackSDKReady = () => {
    const token = getCookie('spotify');
    const player = new Spotify.Player({
      name: 'Who\'s Jam Player',
      getOAuthToken: cb => { cb(token); }
    });

    // Error handling
    player.addListener('initialization_error', ({ message }) => {
      $.ajax({
        url: '/api/spotify/spotify_signin',
        type:'GET',
        success: function(auth_url){
          window.location.href = auth_url
        }
      })
    });
    player.addListener('authentication_error', ({ message }) => {
      $.ajax({
        url: '/api/spotify/spotify_signin',
        type:'GET',
        success: function(auth_url){
          window.location.href = auth_url
        }
      })
    });
    player.addListener('account_error', ({ message }) => {
      $.ajax({
        url: '/api/spotify/spotify_signin',
        type:'GET',
        success: function(auth_url){
          window.location.href = auth_url
        }
      })
     });
    player.addListener('playback_error', ({ message }) => { console.error(message); });

    // Playback status updates
    player.addListener('player_state_changed', state => {
      if(state.paused && window.sessionStorage.getItem('user_pause') == 'no' && window.sessionStorage.getItem('autoplayed') == 'no'){
        let current_song = JSON.parse(window.sessionStorage.getItem('current_song'))

        if(current_song.name == 'Buffer' || current_song.name == 'Queue'){
          next_song()
          window.sessionStorage.setItem('autoplayed','yes')
          window.sessionStorage.setItem("song_position", JSON.stringify(0))
        }else{
          window.sessionStorage.setItem("resolve", "yes")
          $.ajax({
            url: '/api/games/game/' + getCookie('game') + '/resolve',
            type:'POST',
            datatype: 'json',
            data: {resolve: true}
          })
        }
      }else if(state.position > window.sessionStorage.getItem("song_position")){
        window.sessionStorage.setItem("song_position", JSON.stringify(state.position))
      }

      window.sessionStorage.setItem('play_state', JSON.stringify(state))
    });

    // Ready
    player.addListener('ready', ({ device_id }) => {
      play.disabled = false
      pause.disabled = false
      next.disabled = false;
      prev.disabled = false;

      $.ajax({
        url: '/api/games/game/' + getCookie('game') + '/device_id',
        type:'POST',
        datatype: 'json',
        data: {device_id: device_id}
      })
    });

    // Not Ready
    player.addListener('not_ready', ({ device_id }) => {
      console.log('Device ID has gone offline', device_id);
    });

    // Connect to the player!
    player.connect()


    if (getCookie('admin')){
     $("div.admin").show();
     $("div.admin_button").hide();
    }

    document.getElementById('play').onclick = function() {
      let state = window.sessionStorage.getItem("play_state")
      if(state == 'null') state=undefined

      if(!state){
         let current_song = window.sessionStorage.getItem("current_song")
         if(current_song){
           current_song = JSON.parse(current_song).song
           play_song(current_song.uri, getCookie('spotify'), getCookie('device_id'), false)
         }
      }else{
        if(window.sessionStorage.getItem("user_pause") == 'no' && JSON.parse(state).track_window.current_track.uri){
          let current_song = window.sessionStorage.getItem("current_song")
          if(current_song){
            current_song = JSON.parse(current_song).song
            play_song(current_song.uri, getCookie('spotify'), getCookie('device_id'), true)
          }
        }else{
          player.resume().then(() => {
            console.log('Resumed!');
            p_score = setInterval(point_score, 50)
            window.sessionStorage.setItem("user_pause", 'no')
          });
        }
      }

      $.ajax({
        url: '/api/games/game/' + getCookie('game') + '/pause_toggle',
        type:'POST',
        datatype: 'json',
        data: {paused: false},
      })
    };

    document.getElementById('pause').onclick = function() {
      $.ajax({
        url: '/api/games/game/' + getCookie('game') + '/pause_toggle',
        type:'POST',
        datatype: 'json',
        data: {paused: true},
      })

      player.pause().then(() => {
        console.log('Paused!!');
        clearInterval(p_score)
        window.sessionStorage.setItem("user_pause", 'yes')
      });
    };
  };
}

document.getElementById('next').onclick = function() {
  window.sessionStorage.setItem('point_total', String(1000))
  window.sessionStorage.setItem('song_position', String(0))
  next_song()
};

document.getElementById('previous').onclick = function() {
  if(window.confirm('Go Back to Previous Song?')){
    window.sessionStorage.setItem('point_total', String(1000))
    window.sessionStorage.setItem('song_position', String(0))
    prev_song()
  }
};

function next_song(){
  $.ajax({
    url: '/api/games/game/' + getCookie('game') + '/change_song',
    type:'POST',
    datatype: 'json',
    data: {forward: true},
    success: function(result){
      let entry = result.entry
      if(result.error){
        alert(result.error)
      }else{
        window.sessionStorage.setItem("current_song", JSON.stringify(entry))
        play_song(entry.song.uri, getCookie('spotify'), getCookie('device_id'), false)
      }

      setTimeout(function(){
        window.sessionStorage.setItem('autoplayed','no')
      }, 1000)
    }
  })
}

function prev_song(){
  $.ajax({
    url: '/api/games/game/' + getCookie('game') + '/change_song',
    type:'POST',
    datatype: 'json',
    data: {forward: false},
    success: function(result){
      let entry = result.entry
      if(result.error){
        alert(result.error)
      }else{
        window.sessionStorage.setItem("current_song", JSON.stringify(entry))
        play_song(entry.song.uri, getCookie('spotify'), getCookie('device_id'), false)
      }
    }
  })
}

function play_song(uri, token, device, seek){
  $.ajax({
    url: 'https://api.spotify.com/v1/me/player/play?device_id=' + device,
    type:'PUT',
    data: JSON.stringify({uris: [uri]}),
    headers: {
      'Authorization': 'Bearer ' + token
    },
    success: function(){
      let current_song = JSON.parse(window.sessionStorage.getItem("current_song"))
      if(p_score) clearInterval(p_score)

      if(current_song.name == 'Buffer' || current_song.name == 'Queue'){
        $("div.player_block").css('visibility', 'hidden');
      }else{
        p_score = setInterval(point_score, 50)
        $("div.player_block").css('visibility', 'visible');
      }

      if(seek){
        setTimeout(seek_song, 200)
      }else{
        window.sessionStorage.setItem("point_total", '1000')
      }
    },
    error: function(resp){
      console.log(resp);
      $.ajax({
        url: '/api/spotify/spotify_signin',
        type:'GET',
        success: function(auth_url){
          window.location.href = auth_url
        }
      })
    }
  })
}

function seek_song(){
  $.ajax({
    url: 'https://api.spotify.com/v1/me/player/seek?position_ms=' + JSON.parse(window.sessionStorage.getItem("song_position")) + '&device_id=' + getCookie('device_id'),
    type:'PUT',
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Authorization": 'Bearer ' + getCookie('spotify')
    }
  })
}

function end_game(){
  window.sessionStorage.clear();
  $.ajax({
    url: '/api/games/game/' + getCookie('game') + '/set_game_state',
    type:'POST',
    datatype: 'json',
    data: {state: 'E'},
    success: function(){
      $.ajax({
        url: '/api/games/game/' + getCookie('game') + '/game_state',
        type:'POST',
        datatype: 'json',
        data: {state: 'G'},
        success: function(result){
          if(result.url){
            window.location.href=result.url
          }
        }
      })
    },
    error: function(resp){
      alert(resp)
    }
  })
}

function get_state() {
  if(window.sessionStorage.getItem("resolve") == 'yes'){
    reveal_submission()
  }

  $.ajax({
    url: '/api/games/game/' + getCookie('game') + '/game_state',
    type:'POST',
    datatype: 'json',
    data: {state: 'G'},
    success: function(result){
      if(result.url){
        window.location.href=result.url
      }
      if(result.current_song != undefined){
        window.sessionStorage.setItem("current_song", JSON.stringify(result.current_song))
      }
      if(result.paused != undefined){
        window.sessionStorage.setItem("game_pause", (JSON.parse(result.paused)) ? 'yes' : 'no')
      }
      if(result.song_score != undefined){
        window.sessionStorage.setItem("point_total", JSON.stringify(result.song_score))
      }
      if(result.resolve != undefined){
        if(JSON.parse(result.resolve)){
          window.sessionStorage.setItem("resolve", "yes")
        }else{
          window.sessionStorage.setItem("resolve", "no")
        }
      }
    }
  })
}

function playerSelect(obj){
  document.getElementById('selected_player').innerHTML = $(obj).html();
  document.getElementById('selected_score').innerHTML = $('#points').html()
  $('#selected_player_card').css('visibility', 'initial');
}

function populate_player_list(){
  var list = document.getElementById('player_list');

  $.ajax({
    url: '/api/games/game/' + getCookie('game') + '/get_players',
    type:'GET',
    success: function(data){
      for(var i=0; i<data.length; i++){
        list.innerHTML += "<a id=\"player_" + i + "\" class=\"list-group-item list-group-item-action\" value=\"" + data[i].name + "\">" + data[i].name + "</a>";
        $("#player_" + i).attr('onClick', 'playerSelect(this);');
      }
    }
  })
}

function qSongSelect(obj){
  if(window.confirm('Add Song: ' + $(obj).html() + ' ?')){
    $('#q_song_results')['0'].innerHTML = '';
    $('#q_song_search')['0'].value = '';

    $.ajax({
      url: '/api/games/game/' + getCookie('game') + '/queue_song',
      type:'POST',
      datatype: 'json',
      data:{song: window.sessionStorage.getItem(obj.id)},
      success: function(resp){
        alert(resp)
      }
    })
  }
}

function search_song(){
  var search = document.getElementById('q_song_search');
  var list = document.getElementById('q_song_results');
  list.innerHTML=''

  $.ajax({
    url: '/api/spotify/search_song',
    type:'POST',
    datatype: 'json',
    data:{song:search.value},
    success: function(results){
      results = results.results
      for(var i=0; i<results.length; i++){
        list.innerHTML += "<a id=\"q_song_list_" + i + "\" class=\"list-group-item list-group-item-action\" value=\"song_" + i +"\">" + results[i].name + '  |  ' + results[i].artist + "</a>";
        $("#q_song_list_" + i).attr('onClick', 'qSongSelect(this);');
        window.sessionStorage.setItem("q_song_list_" + i, JSON.stringify(results[i]))
      }
    }
  })
}

function connectSpotify(){
  $.ajax({
    url: '/api/spotify/spotify_signin',
    type:'GET',
    success: function(auth_url){
      window.location.href = auth_url
    }
  })
}

function point_score(){
  let time_interval = 50
  let state = window.sessionStorage.getItem('play_state')
  let points = document.getElementById('points');
  let current = JSON.parse(window.sessionStorage.getItem('point_total'))

  if(getCookie('admin')){
    if(parseInt(current)%250 == 0 && current < 1000 && current > 0){
      $.ajax({
        url: '/api/games/game/' + getCookie('game') + '/song_score',
        type:'POST',
        datatype: 'json',
        data:{score: window.sessionStorage.getItem('point_total')}
      })
    }
  }

  if(window.sessionStorage.getItem('game_pause') == 'yes')
    return null

  if(state != null && state != 'null'){
    state = JSON.parse(state)
    let ratio = 1000.0 / state.duration

    if(current <= 1000 && current > 0){
      let new_score = current - ratio*time_interval
      points.innerHTML = String(new_score).split('.')[0]
      points.value = new_score
    }else if(current < 0){
      points.innerHTML = '0'
      points.value = 0
    }else{
      points.innerHTML = '1000'
      points.value = 1000.0
    }
  }else{
    points.innerHTML = '0'
    points.value = 0
  }

  window.sessionStorage.setItem('point_total', String(points.value))
}

async function reveal_submission(){
  let current_song = JSON.parse(window.sessionStorage.getItem('current_song'))
  $("div.player_block").hide()
  // $("#player_b").load(" #player_b > *");
  $("div.resolve_block").show()
  // $("#resolve_b").load(" #resolve_b > *");

  if(p_score) clearInterval(p_score)
  document.getElementById('play').disabled = true;
  document.getElementById('pause').disabled = true;
  document.getElementById('next').disabled = true;
  document.getElementById('previous').disabled = true;

  window.sessionStorage.setItem("song_position", "0")
  window.sessionStorage.setItem("point_total", '1000')

  document.getElementById('song_name').innerHTML = current_song.song.name;
  document.getElementById('song_artist').innerHTML = current_song.song.artist;
  $('div.song_show').show()
  // $("#resolve_b").load(" #resolve_b > *");

  document.getElementById('player_name').innerHTML = current_song.name
  document.getElementById('drinks_r').innerHTML = 'Sips Received: 0'
  document.getElementById('drinks_g').innerHTML = 'Sips To Give: 0'

  // $("#resolve_b").load(" #resolve_b > *");
  await new Promise(r => setTimeout(r, 4000));
  $('div.player_show').show()
  // $("#resolve_b").load(' #resolve_b').fadeIn("fast");
}

function continue_game(){
  $("div.player_block").show()
  $("div.resolve_block").hide()
  $('div.song_show').hide()
  $('div.player_show').hide()

  document.getElementById('play').disabled = false;
  document.getElementById('pause').disabled = false;
  document.getElementById('next').disabled = false;
  document.getElementById('previous').disabled = false;

  $.ajax({
    url: '/api/games/game/' + getCookie('game') + '/resolve',
    type:'POST',
    datatype: 'json',
    data: {resolve: false}
  })

  window.sessionStorage.setItem("resolve", "no")
  next_song()
}
