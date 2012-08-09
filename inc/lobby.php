<!DOCTYPE html>
<html lang="en">
<head>
  <title>T3</title>
 
  <link href="//netdna.bootstrapcdn.com/twitter-bootstrap/2.0.4/css/bootstrap-combined.min.css" rel="stylesheet">
  <link href="/assets/css/style.css" rel="stylesheet">
</head>
<body>
  <div class="container">
    <div class="row">
      <div class="span12">
        <h1>Tic Tac Toe</h1>
      </div>
    </div>
    <!-- Title -->
    <div id="lobby">
      <div class="row">
        <div class="span12">
          <h2>Lobby</h2>
          <p>Request a game with a player or wait for someone to request a game with you!</p>
        </div>
      </div>
  
      <!-- Player table -->
      <div class="row">
        <div class="span8">
          <table id="player-table" class="table table-bordered table-striped">
            <thead>
              <tr>
                <th>Players: <span class="total">0</span></th>
                <th>Invite</th>
              </tr>
            </thead>
            <tbody>
            </tbody>
          </table>
        </div>
      </div>
    </div> <!-- end #lobby -->
    
    <div id="game"></div>
    <footer>
      <p>Made with love by <a href="http://www.twitter.com/empika">@empika</a>.
        Using <a href="http://www.pusher.com">Pusher</a>.
      </p>
    </footer>
  </div> <!-- end #container -->
  
  <!-- <p id="clear-storage">clear</p> -->
  
  <!-- Hidden elements. Modal windows etc -->
  <div class="modal hide fade in" id="modal-name-entry" data-backdrop="static">
    <div class="modal-header">
      <h3>Enter your name</h3>
    </div>
    <div class="modal-body">
      <div class="errors"></div>
      <form class="">
        <input type="text" class="span3" placeholder="Pop your name in here…">
      </form>
    </div>
    <div class="modal-footer">
      <a href="#" class="btn btn-primary">Done</a>
    </div>
  </div>
  
  <div class="modal hide fade in" id="modal-invite" data-backdrop="static">
  </div>
  
  <!-- Lobby Templates -->
  <script id="player-table-row" type="text/html">
    <tr id="<%= guid %>">
      <td>
        <%= name %>
      </td>
      <td>
        <% if (my_guid !== guid ) { %>
          <button class="btn" href="#" data-guid=<%= guid %>>Invite</button>
        <% } else { %>
          <span class="label label-info">That&apos;s you!</span>
        <% } %>
      </td>
    </tr>
  </script>
  
  <script id="player-name-error" type="text/html">
    <div class="alert alert-error">
      <a class="close" data-dismiss="alert" href="#">×</a>
      <h4 class="alert-heading">Uh oh!</h4>
      <%= error %>
    </div>
  </script>
  
  <script id="receive-invite" type="text/html">
    <div class="modal-header">
      <h3>New invite</h3>
    </div>
    <div class="modal-body">
      <strong><%= name %></strong> challenges you, do you accept?
    </div>
    <div class="modal-footer">
      <a href="#" class="btn invite-decline">No thanks</a>
      <a href="#" class="btn btn-primary invite-accept">Let&apos;s go!</a>
    </div>
    
  </script>
  
  <script id="send-invite" type="text/html">
    <div class="modal-header">
      <h3>New invite</h3>
    </div>
    <div class="modal-body">
      You invited <strong><%= name %></strong>. Awaiting their response.
    </div>
    <div class="modal-footer">
      <div class="progress progress-striped active">
        <div class="bar" style="width: 100%;"></div>
      </div>
    </div>
  </script>
  
  <!-- Game Templates -->  
  <script id="game-table" type="text/html">
    <div class="row">
      <div class="span12">
        <h2><strong><%= my_name %></strong> vs. <strong><%= opponent_name %></strong></h2>
      </div>
    </div>
    <div class="row">
      <div class="span4">
        <div id="game-state"></div>
      </div>
    </div>
    
    <div class="row">
      <div class="span4">
        
        <table id="game-table" class="game-table">
          <tbody>
            <!-- row one -->
            <tr>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
            </tr>
            <!-- row two -->
            <tr>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
            </tr>
            <!-- row three -->
            <tr>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
            </tr>
          </tbody>
        </table>
        
      </div>
    </div>
  </script>
  
  <script id="potential-turn" type="text/html">
    <span class="potential-turn">
      <img src="assets/img/circle_light.gif" />
    </span>
  </script>
  
  <script id="player-mark" type="text/html">
    <span class="player-mark">
      <img src="assets/img/circle.gif" />
    </span>
  </script>
  
  <script id="opponent-mark" type="text/html">
    <span class="opponent-mark">
      <img src="assets/img/cross.gif" />
    </span>
  </script>
  
  <script id="turn-indicator" type="text/html">
    <% if (player_turn === true) { %>
      <div class="alert alert-success">
        <strong>It&apos;s your turn,</strong> pick a goodun!
      </div>
    <% } else { %>
      <div class="alert alert-info">
        <strong>Wait for it,</strong> it&apos;s your opponents turn.
      </div>
    <% } %>
  </script>
  
  <script id="winner-state" type="text/html">
    <div class="alert alert-error">
      <% if (game_state.draw != true && game_state.winner === true) { %>
        <strong>A winner is you!</strong>
      <% } else  if (game_state.draw === true ) { %>
        <strong>Miraculous,</strong> you and your opponent we equally matched.
      <% } else  { %>
        <strong>You lost,</strong> better luck next time.
      <% } %>
      <button class="btn btn-primary btn-back-to-lobby" href="#">Back to the lobby</button>
    </div>
  </script>
  
  <!-- Scripts only down here -->
  <!-- Vendor -->
  <script src="//ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js" type="text/javascript"></script>
  <script src="//netdna.bootstrapcdn.com/twitter-bootstrap/2.0.4/js/bootstrap.min.js" type="text/javascript"></script>
  <script src="//js.pusher.com/1.12/pusher.min.js" type="text/javascript"></script>
  <script src="//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.3.3/underscore-min.js" type="text/javascript"></script>
  
  <!-- App -->
  <script src="/assets/js/class.js" type="text/javascript"></script>
  <script src="/assets/js/templates.js" type="text/javascript"></script>
  <script src="/assets/js/game.js" type="text/javascript"></script>
  <script src="/assets/js/lobby.js" type="text/javascript"></script>
  <script src="/assets/js/app.js" type="text/javascript"></script>
  
</body>
</html>