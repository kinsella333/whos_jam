
document.getElementById('buffer_check').onchange = function() {
  document.getElementById('buffer_playlist_search').disabled = !this.checked;
  document.getElementById('buffer_playlist_search_b').disabled = !this.checked;
  document.getElementById('buffer_playlist_results').disabled = !this.checked;
  document.getElementById('min').disabled = !this.checked;
  document.getElementById('max').disabled = !this.checked;

  if (!this.checked){
    document.getElementById('buffer_selected_playlist').value = ''
    document.getElementById('buffer_selected_playlist').innerHTML = ''
  }
};

document.getElementById('playing_check').onchange = function() {
  document.getElementById('name').disabled = !this.checked;
  document.getElementById('song_search_b').disabled = !this.checked;
  document.getElementById('song_search').disabled = !this.checked;
};

const $form = $('#game_settings')
$form.on('submit', submitHandler)
window.sessionStorage.setItem("selected_buffer_playlists", JSON.stringify([]))
window.sessionStorage.setItem("selected_bot_playlists", JSON.stringify([]))

function bufferPlaylistSelect(obj){
  let list = JSON.parse(window.sessionStorage.getItem("selected_buffer_playlists"))

  $('#buffer_selected_playlist_card').css('display', 'initial')
  $('#buffer_playlist_results')['0'].innerHTML = '';
  $('#buffer_playlist_search')['0'].value = '';

  if(list.length < 3){
    let results = document.getElementById('buffer_selected_playlists')
    results.innerHTML = ''

    list.push({
      name: $(obj)[0].innerHTML,
      id: $(obj)[0]['attributes']['value'].value
    })

    for(var i=0; i<list.length; i++){
      results.innerHTML += "<div id=\"buf_" + i + "\" class=\"playlist_selected\" value=\"bufer_" + i + "\">" +
                                "<label class=\"p_name\">" + list[i].name + "</label>" +
                                "<button id=\"buf_close_" + i + "\" type=\"button\" onClick=\"removePlaylist(this)\" class=\"btn btn-primary c_playlist\">" +
                                "<i class=\"far fa-times-circle\"></i></button></div>"

    }

    window.sessionStorage.setItem("selected_buffer_playlists", JSON.stringify(list))
  }else{
    alert('Can Not Add More Buffer PLaylists')
  }
}

function removeBufPlaylist(obj){
  let list = JSON.parse(window.sessionStorage.getItem("selected_buffer_playlists"))
  let index = obj.id.split('_')[2];

  for(var i=0; i<list.length; i++){
    if(i==index){
      list.splice(i, 1);
      break
    }
  }
  let results = document.getElementById('buffer_selected_playlists')
  results.innerHTML = ''

  for(var i=0; i<list.length; i++){
    results.innerHTML += "<div id=\"buf_" + i + "\" class=\"playlist_selected\" value=\"bufer_" + i + "\">" +
                              "<label class=\"p_name\">" + list[i].name + "</label>" +
                              "<button id=\"buf_close_" + i + "\" type=\"button\" onClick=\"removeBufPlaylist(this)\" class=\"btn btn-primary c_playlist\">" +
                              "<i class=\"far fa-times-circle\"></i></button></div>"

  }

  window.sessionStorage.setItem("selected_buffer_playlists", JSON.stringify(list))
}

function botPlaylistSelect(obj){
  let list = JSON.parse(window.sessionStorage.getItem("selected_bot_playlists"))

  $('#bot_selected_playlist_card').css('display', 'initial')
  $('#bot_playlist_results')['0'].innerHTML = '';
  $('#bot_playlist_search')['0'].value = '';

  if(list.length < 3){
    let results = document.getElementById('bot_selected_playlists')
    results.innerHTML = ''

    list.push({
      name: $(obj)[0].innerHTML,
      id: $(obj)[0]['attributes']['value'].value
    })

    for(var i=0; i<list.length; i++){
      results.innerHTML += "<div id=\"bot_" + i + "\" class=\"playlist_selected\" value=\"bot_" + i + "\">" +
                                "<label class=\"p_name\">" + list[i].name + "</label>" +
                                "<button id=\"bot_close_" + i + "\" type=\"button\" onClick=\"removeBotPlaylist(this)\" class=\"btn btn-primary c_playlist\">" +
                                "<i class=\"far fa-times-circle\"></i></button></div>"

    }

    window.sessionStorage.setItem("selected_bot_playlists", JSON.stringify(list))
  }else{
    alert('Can Not Add More Bot PLaylists')
  }
}

function removeBotPlaylist(obj){
  let list = JSON.parse(window.sessionStorage.getItem("selected_bot_playlists"))
  let index = obj.id.split('_')[2];

  for(var i=0; i<list.length; i++){
    if(i==index){
      list.splice(i, 1);
      break
    }
  }
  let results = document.getElementById('bot_selected_playlists')
  results.innerHTML = ''

  for(var i=0; i<list.length; i++){
    results.innerHTML += "<div id=\"bot_" + i + "\" class=\"playlist_selected\" value=\"bot_" + i + "\">" +
                              "<label class=\"p_name\">" + list[i].name + "</label>" +
                              "<button id=\"bot_close_" + i + "\" type=\"button\" onClick=\"removeBotPlaylist(this)\" class=\"btn btn-primary c_playlist\">" +
                              "<i class=\"far fa-times-circle\"></i></button></div>"

  }

  window.sessionStorage.setItem("selected_bot_playlists", JSON.stringify(list))
}

function songSelect(obj){
  document.getElementById('song_results').innerHTML = '';
  document.getElementById('song_search').value = '';
  document.getElementById('selected_song').value = obj.id.split('_')[2];
  document.getElementById('selected_song').innerHTML = $(obj).html();
  $('#selected_song_card').css('display', 'initial');
}

function search_playlist(t){
  var search, list;
  if(t=='buffer'){
    search = document.getElementById('buffer_playlist_search');
    list = document.getElementById('buffer_playlist_results');
    list.innerHTML=''
  }else{
    search = document.getElementById('bot_playlist_search');
    list = document.getElementById('bot_playlist_results');
    list.innerHTML=''
  }


  $.ajax({
    url: '/api/spotify/search_playlist',
    type:'POST',
    datatype: 'json',
    data:{playlist:search.value},
    success: function(results){
      results = results.results
      for(var i=0; i<results.length; i++){
        if(t=='buffer'){
          list.innerHTML += "<a class=\"list-group-item list-group-item-action\" onclick=\"bufferPlaylistSelect(this)\" value=\"" + results[i].id + "\">" + results[i].name + '  |  ' + results[i].owner + "</a>";
        }else{
          list.innerHTML += "<a class=\"list-group-item list-group-item-action\" onclick=\"botPlaylistSelect(this)\" value=\"" + results[i].id + "\">" + results[i].name + '  |  ' + results[i].owner + "</a>";
        }
      }

    }
  })
}

function search_song(){
  var search = document.getElementById('song_search');
  var list = document.getElementById('song_results');
  list.innerHTML=''

  $.ajax({
    url: '/api/spotify/search_song',
    type:'POST',
    datatype: 'json',
    data:{song:search.value},
    success: function(results){
      results = results.results
      for(var i=0; i<results.length; i++){
        list.innerHTML += "<a id=\"song_list_" + i + "\" class=\"list-group-item list-group-item-action\" value=\"song_" + i +"\">" + results[i].name + '  |  ' + results[i].artist + "</a>";
        $("#song_list_" + i).attr('onClick', 'songSelect(this);');
        window.sessionStorage.setItem("song_list_" + i, JSON.stringify(results[i]))
      }
    }
  })
}

function submitHandler (e) {
  e.preventDefault()
  var playing = document.getElementById('playing_check');
  var name = document.getElementById('name');
  var song = document.getElementById('selected_song');

  var buffer = document.getElementById('buffer_check');
  var min = document.getElementById('min');
  var max = document.getElementById('max');
  var buffer_playlists = [], bot_playlists = []

  var buf_list = JSON.parse(window.sessionStorage.getItem("selected_buffer_playlists"))
  for(var i=0; i<buf_list.length; i++)
    buffer_playlists.push(buf_list[i].id)

  var bot_list = JSON.parse(window.sessionStorage.getItem("selected_bot_playlists"))
  for(var i=0; i<bot_list.length; i++)
    bot_playlists.push(bot_list[i].id)


  if(playing.checked && (name.value.trim().length == 0 || !song.value)){
    alert('Need a Name and song to play.')
  }else if(buffer.checked && (min < 0 || max > 9 || buffer_playlists.length == 0)){
    alert('Need a Playlist if you want a Buffer.')
  }else if(bot_playlists.length == 0){
    alert('Need a Bot Playlist to fill out the Game.')
  }else{

    if(playing.checked){
      var p = {
        name: name.value,
        song: window.sessionStorage.getItem("song_list_" + song.value)
      }
    }
    if(buffer.checked){
      var buf = {
        min: min.value,
        max: max.value,
        playlists: buffer_playlists
      }
    }

    var bot ={
      playlists: bot_playlists
    }

    $.ajax({
      url: '/api/games/launch_game',
      type:'POST',
      datatype: 'json',
      data: {player: JSON.stringify(p), buffer: JSON.stringify(buf), bot: JSON.stringify(bot)},
      success: function(game){
        window.sessionStorage.clear();
        window.location = game.url + '/' + game.game_id + '/lobby';
      },
      error: function(){
        alert('Game Keys Error')
      }
    })
  }
};
