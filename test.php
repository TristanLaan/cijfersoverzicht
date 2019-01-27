<?php
include "connect.php";
$mysql = mysqli_connect($server,$user,$pw,$db) or $fout = 1;
if(isset($fout))
$connectie = 0;
else {
$connectie = 1;
mysqli_close($mysql) or $connectie = 2;
}


?>
<html>
  <head>
    <title><?php
      if($connectie == 0){
        echo 'FOUT! kan geen connectie maken met de database.';
      }
      if($connectie == 1)
      {
        echo 'SUCCES! er is verbinding met de database.';
      }
      if($connectie == 2)
      {
        echo 'FOUT! kan verbinding met de database niet verbreken.';
      }
      ?></title>
  </head>
  <body>
    <?php
	  if($connectie == 0)
      echo '<p style="color:red;font-weight:bold;">FOUT! kan geen connectie maken met de database.</p>';
      if($connectie == 1)
      echo '<p style="color:green;font-weight:bold;">SUCCES! er is verbinding met de database.</p>';
      if($connectie == 2)
      echo '<p style="color:red;font-weight:bold;">FOUT! kan verbinding met de database niet verbreken.</p>';
    ?>
	<form action="../PHP VWO 6/">
	  <input type="submit" value="terug"/>
	</form>
  </body>
</html>
