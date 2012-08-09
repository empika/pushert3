<?php 

session_start();
global $config;
$config = require_once 'config.php';

// set up our vendor libs
$app = require_once 'lib/vendor/f3/base.php';
require('lib/vendor/pusher/Pusher.php');

// set up our route methods
class Lobby {
	function get() {
		include 'inc/lobby.php';
	}
}

class PusherAuth {
  function post() {
    global $config;
    // Using: https://github.com/squeeks/Pusher-PHP
    $pusher = new Pusher($config['APP_KEY'], $config['APP_SECRET'], $config['APP_ID']);
    $id = uniqid();
    $presence_data = array('guid' => $id, 'name' => $_SESSION['player_name']);
    echo $pusher->presence_auth($_POST['channel_name'], $_POST['socket_id'], $id, $presence_data);
  }
}

class Name {
  function post() {
    $_SESSION['player_name'] = $_POST['player_name'];
    echo $_SESSION['player_name'];
  }
  
  function get() {
    $data = array('name' => NULL);
    if (isset($_SESSION['player_name'])) {
      $data['name'] = $_SESSION['player_name'];
      echo json_encode($data);
    }
    else{
      echo json_encode($data);
    }
  }
  
  function delete() {
    unset($_SESSION['player_name']);
  }
}

// hook up our routes
$app->map('/', 'Lobby');
$app->map('/pusher/auth', 'PusherAuth');
$app->map('/name', 'Name');

$app->run();

?>