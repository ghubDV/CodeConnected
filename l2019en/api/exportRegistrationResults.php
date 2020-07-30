<?php
    include 'permissions.php';
    include 'register.php';

    //getting the data sent by axios
    $data = json_decode(file_get_contents("php://input"),true);

    $register = new register($data['username'],$data['password'],$data['email'],$data['activation_code'],$data['accType']);

    //check if user tries to register or activate his account
    if(!$data['hasRegistered'])
    {
        $result = $register->tryReg();
    }
    else if($data['hasRegistered'])
    {
        $result = $register->checkActivationCode();
    }

    echo json_encode($result);

?>