var start = false

if (getCookie('admin')){
 $("div.admin").show();
}

$.ajax({
  url: '/api/games/game/' + getCookie('game') + '/game_state',
  type:'POST',
  datatype: 'json',
  data: {state: 'L'},
  success: function(result){
    if(result.url){
      window.location.href=result.url
    }
  }
})

$.ajax({
  url: '/api/games/game/' + getCookie('game') + '/get_players',
  type:'GET',
  success: function(results){
    populate_player_list(results)
  }
})

function startTimer() {
  setInterval(function(){
    $.ajax({
      url: '/api/games/game/' + getCookie('game') + '/game_state',
      type:'POST',
      datatype: 'json',
      data: {state: 'L'},
      success: function(result){
        if(result.url){
          window.location.href=result.url
        }
      }
    })

    $.ajax({
      url: '/api/games/game/' + getCookie('game') + '/get_players',
      type:'GET',
      success: function(results){
        populate_player_list(results)
      }
    })
  }, 5000);
}

function populate_player_list(data){
  var list = document.getElementById('player_list');
  list.innerHTML=''

  for(var i=0; i<data.length; i++)
    list.innerHTML += "<a class=\"list-group-item list-group-item-action\" value=\"" + data[i].name + "\">" + data[i].name + "</a>";

  document.getElementById('player_count').innerHTML = data.length;
}

function start_game(){
  $.ajax({
    url: '/api/games/game/' + getCookie('game') + '/create_playlist',
    type:'GET',
    success: function(){
      $.ajax({
        url: '/api/games/game/' + getCookie('game') + '/set_game_state',
        type:'POST',
        datatype: 'json',
        data: {state: 'G'},
        success: function(){
          $.ajax({
            url: '/api/games/game/' + getCookie('game') + '/game_state',
            type:'POST',
            datatype: 'json',
            data: {state: 'L'},
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
    },
    error: function(resp){
      alert(resp)
    }
  })

}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    let t = parts.pop().split(';').shift();
    return t.substring(4, t.length).split('.')[0]
  }
}
