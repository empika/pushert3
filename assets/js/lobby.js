var T3Lobby = Class.extend({
  
  templates: '',
  name_modal: '',
  invite_modal: '',
  player_name: '',
  me: '',
  lobby_channel_name: 'presence-lobby',
  game_channel_name: '',
  invite_status: {
    invite_in_progress: false,
    game_in_progress: false,
    with_user_id: '',
  },
  
  init: function (options) {
    _.extend(this, options);
    if (!this.getName()) {
      this.inputName();
    }
    else {
      this.connect();
    }
  },
  
  inputName: function () {
    var lobby = this;
    this.name_modal.find('div.modal-footer a.btn').click(function(event) {
      var errors = [],
        body_errors = lobby.name_modal.find('div.modal-body div.errors');

      // reset our errrors
      body_errors.html('');

      var name_input = lobby.name_modal.find('div.modal-body form input').val();
      if (name_input !== "") {
        if(name_input.length < 3) {
          errors.push({msg: "You got&apos;s to have at least 3 letters in your name, ok?"})
        }
      }
      else {
        errors.push({msg: "You got&apos;s to enter a name y&apos;hear"});
      }

      if (errors.length > 0) {
        _.each(errors, function(error){
          body_errors.prepend(lobby.templates.player_name_error({error: error.msg}));
        });
      }
      else {
        // we are good to go, store our name for the future
        if (lobby.setName(name_input)) {
          lobby.name_modal.modal('hide');
          lobby.connect();
        }
        else {
          body_errors.prepend(lobby.templates.player_name_error({error: "There was an saving your information"}));
        }
      }
      return false;
    });
    
    this.name_modal.modal({static: true});
  },
  
  setName: function (player_name) {
    var success = $.post('name', 'player_name=' +  player_name, function(data) {
      return;
    });
    return success;
  },
  
  getName: function () {
    var result = false;
    // pretty ugly doing this asynchronously
    $.ajax({
      type: 'GET',
      url: 'name',
      dataType: 'json',
      async: false,
      success: function(data) {
        if(data.name === null) {
          result = false;
        }
        else {
          result = true;
        }
      }
    });

    return result;
  },
  
  /*
  * Connect to the lobby channel and subscribe to the channel events
  */
  connect: function () {
    var lobby = this;
    
    // Enable pusher logging - don't include this in production
    Pusher.log = function(message) {
      if (window.console && window.console.log) window.console.log(message);
    };

    this.pusher = new Pusher('0fd5d9f0e77aa7330f8e'),
    this.lobby_channel = this.pusher.subscribe(lobby.lobby_channel_name);
    this.initializeComs();
  },
  
  initializeComs: function () {
    var lobby = this;
    
    this.lobby_channel.bind('pusher:subscription_succeeded', function(members) {
      localStorage.setItem('lobby-me', members.me);
      lobby.me = members.me;
      
      // update the total users
      $('#player-table thead tr th span.total').html(members.count);
      
      // add each member of the lobby to the list
      members.each(function(member) {
        lobby.addMember($('#player-table tbody'), member.id, member.info, members.me);
      });
    });
    
    this.lobby_channel.bind('pusher:member_added', function(member) {
      // update the total users
      $player_count = $('#player-table thead tr th span.total');
      $player_count.html(parseInt($player_count.html()) + 1);
      // add each member of the lobby to the list
      lobby.addMember($('#player-table tbody'), member.id, member.info);
    });
    
    this.lobby_channel.bind('pusher:member_removed', function(member) {
      // update the total users
      $player_count = $('#player-table thead tr th span.total');
      $player_count.html(parseInt($player_count.html()) - 1);
      
      // remove member from the lobby to the list
      lobby.removeMember($('#player-table tbody'), member.id);
      
      // check if any invites were involved
      if (lobby.invite_status.with_user_id === member.id) {
        lobby.invite_modal.modal('hide');
      }
    });
    
    // handle an invitation from a player
    this.lobby_channel.bind('client-invite-player', function(data) {
      if (!lobby.invite_status.invite_in_progress && data.their_id === lobby.me.id) {
        lobby.invite_status.invite_in_progress = true;
        lobby.invite_status.with_user_id = data.their_id.id;
        lobby.invite_modal.html(lobby.templates.receive_invite({name: data.me.info.name}));
        
        // set listeners on the accept/decline buttons
        lobby.invite_modal.find('div.modal-footer a.btn.invite-decline').click(function(event) {
          lobby.invite_status.invite_in_progress = false;
          triggered = lobby.lobby_channel.trigger('client-decline-invite', { declining_player: lobby.me });
          lobby.invite_modal.modal('hide');
          return true;
        });
        
        /*
        * disconnect form the lobby, set up a channel between the two players and start the actual game
        */
        lobby.invite_modal.find('div.modal-footer a.btn.invite-accept').click(function(event) {
          lobby.invite_modal.modal('hide');
          triggered = lobby.lobby_channel.trigger('client-accept-invite', { opponent: lobby.me });
          lobby.pusher.unsubscribe(lobby.lobby_channel_name);
          lobby.game_channel_name = 'presence-' + lobby.me.id;
          lobby.game_channel = lobby.pusher.subscribe(lobby.game_channel_name);
          lobby.removeAllMembers($('#player-table tbody'));
          lobby.game = new T3Game({opponent: data.me, game_channel: lobby.game_channel, templates: lobby.templates, player_turn: true});
          
          return ;
        });
        
        lobby.invite_modal.modal({static: true});
      }
    });
    
    // accept an invitation
    this.lobby_channel.bind('client-accept-invite', function(data){
      lobby.accecptInvite(data);
    });
    
    // handle a declined invitation
    this.lobby_channel.bind('client-decline-invite', function(data){
      lobby.declineInvite(data);
    });
    
    
  },
  
  // possibly break these out to a utils class?
  addMember: function ($table_body, id, info, me) {
    lobby = this;
    me = me || lobby.me;
    // compile the template
    var player_template = this.templates.player_table_row({guid: id, name: info.name, my_guid: me.id });
    $table_body.append(player_template);
    if (id !== me.id) {
      $('#' + id + ' td button').click(function(event){
        lobby.invitePlayer(lobby, id, event);
      });
    }
  },
  
  removeMember: function ($table_body, id) {
    $table_body.find('#' + id).remove();
  },
  
  removeAllMembers: function ($table_body) {
    $table_body.find('tr').remove();
  },
  
  // invite a player
  invitePlayer: function (lobby, id, event) {
    var player_name = $('#' + id + ' td:first').html(),
      triggered;
    if (!lobby.invite_status.invite_in_progress) {
      lobby.invite_status.invite_in_progress = true;
      lobby.invite_status.with_user_id = id;
      lobby.invite_modal.html(lobby.templates.send_invite({name: player_name}));
      triggered = lobby.lobby_channel.trigger('client-invite-player', { me: lobby.me, their_id: id });
      if (triggered) {
        lobby.invite_modal.modal({static: true});
      }
    }
  },
  
  /*
  * Accept and invite and join the channel
  */
  accecptInvite: function (response) {
    if (lobby.invite_status.invite_in_progress && lobby.invite_status.with_user_id === response.opponent.id) {
      lobby.pusher.unsubscribe(lobby.lobby_channel_name);
      lobby.game_channel_name = 'presence-' + response.opponent.id;
      lobby.game_channel = lobby.pusher.subscribe(lobby.game_channel_name);
      lobby.removeAllMembers($('#player-table tbody'));
      lobby.game = new T3Game({opponent: response.opponent, game_channel: lobby.game_channel, templates: lobby.templates, player_turn: false});
      
      lobby.invite_modal.modal('hide');
    }
  },
  
  declineInvite: function (response) {
    if (lobby.invite_status.invite_in_progress && lobby.invite_status.with_user_id === response.declining_player.id) {
      lobby.invite_status.invite_in_progress = false;
      lobby.invite_modal.modal('hide');
    }
  }

});
