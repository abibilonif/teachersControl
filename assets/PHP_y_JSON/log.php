<?php
$_POST = json_decode(file_get_contents('php://input'), true);
if (isset($_POST['user']) AND isset($_POST['pass'])) {
    $varUser = $_POST['user'];
    $varPass = $_POST['pass'];
    $varListUsers=array("Aina"=>"abf", "Joan"=>"jgr", "Pep"=>"pbm", "Sandra"=>"sgl");

if (isset($varListUsers[$varUser]) AND $varListUsers[$varUser] == $varPass) {
    echo "OK";
}else{
echo "KO";
};
};
?>
