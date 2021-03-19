if(getCookie('game')){
  document.getElementById('create_game').innerHTML = 'Current Game';
  $("#create_game").attr('onClick', 'window.location=\'/api/games/game/' + getCookie('game') + '/lobby\'');
}else {
  document.getElementById('create_game').innerHTML = 'Create Game'; 
  $("#create_game").attr('onClick', 'window.location=\'/api/games/create_game\'');
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    let t = parts.pop().split(';').shift();
    return t.substring(4, t.length).split('.')[0]
  }
}
