 <?php
$data = file_get_contents($_FILES['audio']['tmp_name']);    

$fp = fopen("saved_audio/" . $_REQUEST["name"] . '.wav', 'wb');

fwrite($fp, $data);
fclose($fp);
?>