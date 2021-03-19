const $form = $('#game_settings')
$form.on('submit', submitHandler)

function submitHandler (e) {
  e.preventDefault()
  var name = document.getElementById('name');
  var song = document.getElementById('selected_song');

  if(name.value.trim().length == 0 || !song.value){
    alert('Need a Name and song to play.')
  }else{
    var p = {
      name: name.value,
      song: window.sessionStorage.getItem("song_list_" + song.value)
    }

    $.ajax({
      url: '/api/games/add_player',
      type:'POST',
      datatype: 'json',
      data: {player: JSON.stringify(p)},
      success: function(game){
        window.sessionStorage.clear();
        window.location = game.url;
      },
      error: function(err){
        alert(err)
      }
    })
  }
};

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

function songSelect(obj){
  document.getElementById('song_results').innerHTML = '';
  document.getElementById('song_search').value = '';
  console.log(obj.id.split('_')[2]);
  document.getElementById('selected_song').value = obj.id.split('_')[2];
  document.getElementById('selected_song').innerHTML = $(obj).html();
  $('#selected_song_card').css('display', 'initial');
}
