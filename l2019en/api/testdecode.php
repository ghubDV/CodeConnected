<?php

    include 'permissions.php';
    require 'vendor/autoload.php';
    use \Firebase\JWT\JWT;

    //getting the data sent by axios
    $data = json_decode(file_get_contents("php://input"),true);

    $secret = file_get_contents('./config/secret.key', true);
    $jwt = $data['accessToken'];

    try {
        $decoded = JWT::decode($jwt, $secret, array('HS512'));

        $data = (object)$decoded;

        echo json_encode((object)array(
            "isValid" => true,
            "userdata" => $data->userdata
        ));
    }

    catch (Exception $e) {
        echo json_encode((object)array(
            "isValid" => false,
        ));
    }


    //retrieve data from the decoded jwt
    /*
     $data = (object)$decoded;

     echo $data->userdata->id;
    */
    die;
?>