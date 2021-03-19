
if(getCookie('game')){
  document.getElementById('submit_button').value = 'Current Game';
}else {
  $("div.active_game").show();
}

const $form = $('#game_search')
$form.on('submit', submitHandler)

function submitHandler (e) {
  e.preventDefault()

  if(getCookie('game')){
    window.location = '/api/games/game/' + getCookie('game') + '/lobby'
  }else{
    var search = document.getElementById('search').value;

    if(search.length < 4 || search.length > 4){
      alert('Not A Valid Game ID')
    }else{
      $.ajax({
        url: '/api/games/join_game',
        type:'POST',
        datatype: 'json',
        data: {game_id: search},
        success: function(game){
          console.log(game);
          window.location = game.url;
        },
        error: function(){
          alert('Game Not Found')
        }
      })
    }
  }
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    let t = parts.pop().split(';').shift();
    return t.substring(4, t.length).split('.')[0]
  }
}
