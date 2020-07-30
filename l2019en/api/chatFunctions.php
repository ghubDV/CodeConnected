<?php
    include 'permissions.php';
    require __DIR__ . '/vendor/autoload.php';

    $options = array(
    'cluster' => '<cluster>'
    );
    $pusher = new Pusher\Pusher(
    '<key>',
    '<secret>',
    '<app_id>',
    $options
    );

    $data = json_decode(file_get_contents("php://input"),true);

    if($data['request'] === "inviteChat")
    {
        $pushData = (object)array(
            "action" => "invitation",
            "from" => $data['fromName'],
            "for" => $data['for'],
            "channelName" => $data['channelName'],
            "linkToPartner" => $data['linkToPartner'],
        );


        $pusher->trigger('global-channel', 'notify', $pushData);

        echo json_encode((object)array(
            "result" => "success"
        ));
    }

    if($data['request'] === "sendMessage")
    {
        $pushData = (object)array(
            "action" => "sendMessage",
            "message" => $data['message'],
        );

        $pusher->trigger('chat-'.$data['channel'], 'addMessage', $pushData);

        echo json_encode((object)array(
            "result" => "success"
        ));
    }

?>
