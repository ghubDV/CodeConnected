<?php
    include 'dbclass.php';
    require 'vendor/autoload.php';

    use \Firebase\JWT\JWT;

    class login
    {
        public $db;
        public $username;
        public $password;
        public $dbtable;
        public $dbuser;
        public $dbid;
        public $accountdata;
        public $logstatus;
        public $logmsg;

        function __construct($u,$p,$t)
        {
            $this->username = $u;
            $this->password = $p;
            $this->logstatus = false;

            if($t === "Person")
            {
                $this->dbtable = "useraccounts";
                $this->dbuser = "username";
                $this->dbid = "user_id";
            }
            else
            {
                $this->dbtable = "companyaccounts"; 
                $this->dbuser = "companyname";
                $this->dbid = "company_id";
            }
            $this->db = new dbclass();
        }

        //checks if query returns results or not
        function ifQueryHasResults($query,$params)
        {
            $response = $this->db->run_query($query,$params);
            $affectedRows = $response['affectedRows'];
            $result = $response['result'];

            if($affectedRows === 1)
            {
                return true;
            }   
            
            return false;
        }
        
        function userExists($params)
        {
            $query = "SELECT * FROM ".$this->dbtable." WHERE ".$this->dbuser." = ? OR email = ?";

            if($this->ifQueryHasResults($query,$params))
            {
                return true;
            }

            return false;
        }

        function getUserData($params)
        {
            $query = "SELECT * FROM ".$this->dbtable." WHERE ".$this->dbuser." = ? OR email = ?";

            $response = $this->db->run_query($query,$params);
            $result = $response["result"];

            foreach($result as $key => $row)
            {
                if($this->dbtable === "companyaccounts")
                {
                    $this->accountdata = (object)array(
                        "id" => $row[$this->dbid],
                        "username" => $row[$this->dbuser],
                        "password_hash" => $row["password_hash"],
                        "email" => $row["email"],
                        "arc_hash" => $row["arc_hash"],
                        "secret_key" => $row["secret_key"],
                        "isActive" => $row["isActive"],
                        "type" => "company",
                        "registration_date" => $row["registration_date"]
                    ); 
                                                
                }
                else
                {
                    $this->accountdata = (object)array(
                        "id" => $row[$this->dbid],
                        "username" => $row[$this->dbuser],
                        "password_hash" => $row["password_hash"],
                        "email" => $row["email"],
                        "arc_hash" => $row["arc_hash"],
                        "secret_key" => $row["secret_key"],
                        "isActive" => $row["isActive"],
                        "type" => "user",
                        "registration_date" => $row["registration_date"]
                    ); 
                }
            }
            
        }

        function checkLoginData()
        {
            if(($this->username === $this->accountdata->username || $this->username === $this->accountdata->email) && (password_verify($this->password,$this->accountdata->password_hash)))
            {
                return true;
            }

            return false;
        }

        function tryLog()
        {
            //checking if user exists in db
            if(!$this->userExists(array($this->username,$this->username)))
            {
               $this->logstatus = false;
               $this->logmsg = "This user doesn't exist!";

               return (object)array(
                    "status" => $this->logstatus,
                    "message" => $this->logmsg
               );
            }

            //getting user data from db
            $this->getUserData(array($this->username,$this->username));


            //checking if user data from the db matches user input
            if($this->checkLoginData())
            {
                //getting the jwt secret
                $secret = file_get_contents('./config/secret.key', true);

                //creating jwt reserved claims
                $tokenID = base64_encode(random_bytes(32));
                $issuedAt = time();
                $notBefore = $issuedAt;
                $expires = $issuedAt + 86400;
                $serverName = 'localhost';

                
                $this->logstatus = true;
                $this->logmsg = "Logged in successfuly!";

                $data = [
                    'iat' => $issuedAt,
                    'jti' => $tokenID,
                    'iss' => $serverName,
                    'nbf' => $notBefore,
                    'exp' => $expires,
                    'userdata' => [
                        "id" => $this->accountdata->id,
                        "username" => $this->accountdata->username,
                        "email" => $this->accountdata->email,
                        "isActive" => $this->accountdata->isActive,
                        "type" => $this->accountdata->type
                    ]

                ];

                $jwt = JWT::encode($data,$secret,'HS512');


                return (object)array(
                    "status" => $this->logstatus,
                    "message" => $this->logmsg,
                    "jwt" => $jwt
                );
            

            }

            else
            {
                $this->logstatus = false;
                $this->logmsg = "Wrong username/email or password!";

                return (object)array(
                    "status" => $this->logstatus,
                    "message" => $this->logmsg
               );
            }
            
        }
    }
?>