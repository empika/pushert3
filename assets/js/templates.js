var T3Templates = (function (){
  return {
    /*
    * compile all the templates for efficient use later
    */
    // lobby templates
    player_table_row: _.template($('#player-table-row').html()),
    player_name_error: _.template($('#player-name-error').html()),
    send_invite: _.template($('#send-invite').html()),
    receive_invite: _.template($('#receive-invite').html()),
    
    // game templates
    game_table: _.template($('#game-table').html()),
    potential_turn: _.template($('#potential-turn').html()),
    player_mark: _.template($('#player-mark').html()),
    opponent_mark: _.template($('#opponent-mark').html()),
    turn_indicator: _.template($('#turn-indicator').html()),
    winner_state: _.template($('#winner-state').html()),
  }
}());