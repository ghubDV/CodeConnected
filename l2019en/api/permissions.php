<?php
    //allow the react app to make a xmlHttpRequest to the php server
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS, DELETE, PUT');
    header('Access-Control-Allow-Headers: Host, Connection, Accept, Authorization, Content-Type, X-Requested-With, User-Agent, Referer, Methods');
    if($_SERVER["REQUEST_METHOD"]== "OPTIONS"){
        echo "";
        die;    
    }
?>