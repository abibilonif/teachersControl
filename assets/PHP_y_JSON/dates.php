<?php
$_POST = json_decode(file_get_contents('php://input'), true);
$arrayPost[]=$_POST;
$file = '/opt/lampp/htdocs/ionic/date.json';
$jsonDates=json_decode(file_get_contents($file),true);
$num=count($jsonDates);
$jsonDates[$num+1]=$arrayPost;
json_encode($jsonDates);
file_put_contents($file,json_encode($jsonDates));
echo 'OK';
?>
