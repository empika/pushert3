var T3Game = Class.extend({
  
  game_status: {},
  game_channel: '',
  
  init: function(options){
    _.extend(this, options);
    
    this.initializeGameComs();
  },
  
  initializePlayfield: function () {
    $('#lobby').hide();
    $('#game').html(this.templates.game_table({
      my_name: lobby.me.info.name, 
      opponent_name: this.opponent.info.name
    })).show();
    this.bindMouseEvents();
    this.setTurnIndicator();
  },
  
  initializeGameComs: function () {
    var game = this;
    
    // channel events
    this.game_channel.bind('pusher:subscription_succeeded', function(members) {
      game.initializePlayfield();
    });
    
    this.game_channel.bind('pusher:member_added', function(member) {
      // do we need to do anything here?
      // it would be nice to update the player when the opponent joins 
    });
    
    this.game_channel.bind('pusher:member_removed', function(member) {
      // handle an opponent rage quitting
    });
    
    // game events
    this.game_channel.bind('client-end-of-turn', function(data) {
      $opponent_move = $('#game-table tbody tr:eq(' + data.move_data.y + ') td:eq(' + data.move_data.x + ')');
      $opponent_move.html(game.templates.opponent_mark);
      $opponent_move.addClass('unavailable');
      game.player_turn = true;
      game.setTurnIndicator();
    });
    
    // game events
    this.game_channel.bind('client-game-over', function(data) {
      data.game_state.winner = !data.game_state.winner;
      game.setGameState(data.game_state);
    });
  },
  
  bindHoverEvents: function () {
    var game = this;
    $('#game-table tbody tr td').hover(
      function(event){
        $target = $(event.target);
        if (game.player_turn === true && $target.is('td') && !$target.hasClass('hover') && !$target.hasClass('unavailable')) {
          $target.addClass('hover');
          $target.html(game.templates.potential_turn());
        }
      },
      function(event){
        $target = $(event.target);
        if (game.player_turn === true && $target.is('td') && $target.hasClass('hover')) {
          $target.html('&nbsp;');
          $target.removeClass('hover');
        }
      }
    )
  },
  
  bindClickEvents: function () {
    var game = this;;
    $('#game-table tbody tr td').click(function(event){
      var $target = $(event.target),
        index = 0,
        td_index = 0;

      if ( game.player_turn === true ) {
        if ($target.is('td') && !$target.hasClass('unavailable')) {
          index = $target.index();
          td_index = $target.parent().index();
          
          $target.html(game.templates.player_mark());
          $target.addClass('unavailable').addClass('player');
          $target.removeClass('hover');
          
          // end the turn
          game.endTurn({x: index, y: td_index});
        }
        else if (($target.is('span') || $target.is('img')) && !$target.parent('td').hasClass('unavailable')) {
          $parent = $target.parents('td');
          index = $parent.index();
          td_index = $parent.parent().index();
          
          $parent.addClass('unavailable').addClass('player');
          $parent.removeClass('hover');
          $parent.html(game.templates.player_mark());
          
          // end the turn
          game.endTurn({x: index, y: td_index});
        }
      }
    });
  },
  
  bindMouseEvents: function () {
    this.bindHoverEvents();
    this.bindClickEvents();
  },
  
  endTurn: function (move_data) {
    var game_state = {};
    this.player_turn = false;
    this.setTurnIndicator();
    game_state = this.checkGameOver();
    this.game_channel.trigger('client-end-of-turn', {move_data: move_data});
    
    if (game_state.winner === true || game_state.draw === true) {
      this.setGameState(game_state);
      this.game_channel.trigger('client-game-over', {game_state: game_state});
    }
  },
  
  checkGameOver: function () {
    var $game_table_body = $('#game-table tbody'),
      state = {
        winner: false,
        draw: false
      };
      
    if (this.checkRows($game_table_body) || this.checkColumns($game_table_body) || this.checkDiagonals($game_table_body)) {
      state.winner = true;
    }
    else if (this.checkDraw($game_table_body)) {
      state.draw = true;
    }
    return state;
  },
  
  checkDraw: function (game_table_body) {
    var x = 0,
      y = 0,
      move_count = 0,
      $td = null;
    for (y = 0; y < 3; y = y + 1) {
      for(x = 0; x < 3; x = x + 1) {
        $td = game_table_body.find('tr:eq(' + y + ') td:eq(' + x + ')');
        if ($td.hasClass('unavailable')) {
          move_count = move_count + 1;
        }
      }
    }
    if (move_count === 9) {
      return true;
    }
    return false;
  },
  
  checkRows: function (game_table_body) {
    var x = 0,
      y = 0,
      move_count = 0,
      $td = null;
    for (y = 0; y < 3; y = y + 1) {
      for(x = 0; x < 3; x = x + 1) {
        $td = game_table_body.find('tr:eq(' + y + ') td:eq(' + x + ')');
        if ($td.hasClass('player')) {
          move_count = move_count + 1;
        }
      }
      if (move_count === 3) {
        return true;
      }
      move_count = 0;
    }
    return false;
  },
  
  checkColumns: function (game_table_body) {
    var x = 0,
      y = 0,
      move_count = 0,
      $td = null;
    for (x = 0; x < 3; x = x + 1) {
      for(y = 0; y < 3; y = y + 1) {
        $td = game_table_body.find('tr:eq(' + y + ') td:eq(' + x + ')');
        if ($td.hasClass('player')) {
          move_count = move_count + 1;
        }
      }
      if (move_count === 3) {
        return true;
      }
      move_count = 0;
    }
    return false;
  },
  
  checkDiagonals: function (game_table_body) {
    var x = 0,
      y = 0,
      move_count = 0,
      $td = null;
    for (x = 0; x < 3; x = x + 1) {
      $td = game_table_body.find('tr:eq(' + x + ') td:eq(' + x + ')');
      if ($td.hasClass('player')) {
        move_count = move_count + 1;
      }
      if (move_count === 3) {
        return true;
      }
    }
    move_count = 0;
    
    for (x = 0; x < 3; x = x + 1) {
      $td = game_table_body.find('tr:eq(' + x + ') td:eq(' + parseInt(2 - x) + ')');
      if ($td.hasClass('player')) {
        move_count = move_count + 1;
      }
      if (move_count === 3) {
        return true;
      }
    }
    return false;
  },
  
  setGameState: function (game_state) {
    var game = this;
    $('#game-state').html(this.templates.winner_state({game_state: game_state}));
    $('#game-state').find('button').click(function(event){
      game.finishGame();
    });
  },
  
  setTurnIndicator: function () {
    $('#game-state').html(this.templates.turn_indicator({player_turn: this.player_turn}));
  },
  
  finishGame: function() {
    lobby.pusher.unsubscribe(this.game_channel.name);
    $('#game').hide();
    $('#lobby').show();
    lobby.connect();
  },
  
});