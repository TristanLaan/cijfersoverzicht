<?php
/**
 * Copyright (c) Tristan Laan 2019.
 * This file is part of cijfersoverzicht.
 * cijfersoverzicht is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or any later
 * version.
 *
 * cijfersoverzicht is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with cijfersoverzicht.  If not, see <https://www.gnu.org/licenses/>
 */

require_once "connect.php";
if (session_status() == PHP_SESSION_NONE) { //controleren of sessie al is gestart
    session_start(); //sessie starten
}

if(!isset($_SESSION['user'])) { //uitvoeren als er op loguit is gedrukt
	$_SESSION['user'] = null; //sessie leegmaken
}

if(isset($_POST['login'])) //uitvoeren als er op inloggen is gedrukt
{
    $password = $_POST['password']; //wachtwoord beveiligen met md5 en tegen sql-injectie
    if($password == $userpass) {
        $_SESSION['user'] = "ingelogd";
    } else {
        $error = 1;
    }
}


if($_SESSION['user']==null) //weergeven als niet is ingelogd
{
	?>
<html lang="nl">
<head>
	<title>Login om cijfers te zien</title>
	<link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
</head>
<body>
	<div class = "w3-display-middle">
  <?php if(isset($error)) { //weergeven als inloggen is mislukt ?>
    <div class="w3-panel w3-red w3-card w3-display-container">
      <span onclick="this.parentElement.style.display='none'" class="w3-button w3-small w3-display-topright">×</span>
      <p><?php echo "wachtwoord is onjuist"; ?></p>
    </div>
  <?php } ?>
    <div class = "w3-card-4">
  	   <div class="w3-container w3-light-grey">
         <h2>Log in:</h2>
       </div>
  		<form method="post">
  		  <div class="w3-container">
  			   <p><input class="w3-input" type="password" name="password" placeholder="wachtwoord" required></p>
  			</div>
  			<div class="w3-bar">
  			   <button type="submit" name="login" class="knophalf w3-bar-item2 w3-button w3-block w3-dark-grey w3-border-right">Login</button>
  		  </div>
      </form>
    </div>
	</div>
</body>
</html>
	<?php
	exit();
}
else {
	if(strpos($_SERVER["SCRIPT_NAME"],"login.php") !== FALSE) {//controleren of huidige pagina login.php ?>
		<script type="text/javascript">
			window.location = "index.php";
		</script>
	<?php }
}
?>
