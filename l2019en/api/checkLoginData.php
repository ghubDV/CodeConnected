<?php
    include 'permissions.php';
    include 'login.php';

    //getting the data sent by axios
    $data = json_decode(file_get_contents("php://input"),true);

    $login = new login($data['username'],$data['password'],$data['accType']);

    $result = $login->tryLog();

    //check if user tries to register or activate his account
    /*if(!$data['hasLogged'])
    {
        $result = $login->tryReg();
    }
    else if($data['hasLogged'])
    {
        $result = $login->checkActivationCode();
    }*/

    echo json_encode($result);

?>