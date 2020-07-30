<?php

    require 'vendor/autoload.php';
    use \Firebase\JWT\JWT;

    function JWT_create($id,$username,$email,$isActive,$type)
    {
        $secret = file_get_contents('./config/secret.key', true);

        //creating jwt reserved claims
        $tokenID = base64_encode(random_bytes(32));
        $issuedAt = time();
        $notBefore = $issuedAt;
        $expires = $issuedAt + 86400;
        $serverName = 'localhost';

        $data = [
            'iat' => $issuedAt,
            'jti' => $tokenID,
            'iss' => $serverName,
            'nbf' => $notBefore,
            'exp' => $expires,
            'userdata' => [
                "id" => $id,
                "username" => $username,
                "email" => $email,
                "isActive" => $isActive,
                "type" => $type
            ]

        ];

        $jwt = JWT::encode($data,$secret,'HS512');

        return $jwt;
    }

?>