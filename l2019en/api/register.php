<?php
    include 'dbclass.php';
    include 'sendMail.php';

    class register
    {
        public $db;
        public $username;
        public $password;
        public $email;
        public $activation_code;
        public $dbtable;
        public $regerr;
        public $success;

        function __construct($u,$p,$e,$a,$t)
        {
            $this->username=$u;
            $this->password=$p;
            $this->email=$e;
            $this->activation_code=$a;
            $this->db= new dbclass();

            if($t === 'Person')
            {
                $this->dbtable = "useraccounts";
            }
            else
            {
                $this->dbtable = "companyaccounts";
            }
        }

        //checks if query returns results or not
        function ifQueryHasResults($query,$params)
        {
            $response = $this->db->run_query($query,$params);
            $affectedRows = $response['affectedRows'];
            $result = $response['result'];

            if($affectedRows > 0)
            {
                return false;
            }   
            
            return true;
        }

        function verifyUserdata($col,$param)
        {
            //checking if username already exists in database
            $query="SELECT " . $col . " FROM " . $this->dbtable . " WHERE " . $col . " = ?";

            if(!$this->ifQueryHasResults($query,$param))
            {
                return false;
            }

            return true;

        }

        function insertUser()
        {
            //creating password hash,secret and the activation code hash
            $activation_code = substr(str_shuffle('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'),1,10);
            $keygen = random_bytes(32);
            $secret = bin2hex($keygen);

            $this->activation_code = $activation_code;
            $arc_hash = password_hash($activation_code,PASSWORD_DEFAULT);
            $pass_hash = password_hash($this->password,PASSWORD_DEFAULT);

            //mysql db insert query and params
            if($this->dbtable === "companyaccounts")
            {
                $query="INSERT INTO " . $this->dbtable . " (companyname,password_hash,email,arc_hash,secret_key) VALUES (?,?,?,?,?)";
            }
            else
            {
                $query="INSERT INTO " . $this->dbtable . " (username,password_hash,email,arc_hash,secret_key) VALUES (?,?,?,?,?)";
            }

            $params = array($this->username,$pass_hash,$this->email,$arc_hash,$secret);

            $this->db->run_query($query,$params);
        }

        //checks if activation code was entered correctly by the user
        function checkActivationCode()
        {
            $query = "SELECT arc_hash FROM ".$this->dbtable." WHERE email = ?";
            $params = array($this->email);
            $arc_hash = "";

            $response = $this->db->run_query($query,$params);
            $affectedRows = $response['affectedRows'];
            $result = $response['result'];

            if($affectedRows > 0)
            {
                
                $arc_hash = $result[0]['arc_hash'];

                if(password_verify($this->activation_code,$arc_hash))
                {
                    //activation successful - update isActive to true in the db
                    $query = "UPDATE ".$this->dbtable." SET isActive = 'T' WHERE email = ?";
                    $params = array($this->email);
                    $this->db->run_query($query,$params);

                    $this->success = true;
                }

                else
                {
                    $this->success = false;
                    $this->regerr = "Activation code doesn't match!";
                }
            }
            else
            {
                $this->success = false;
                $this->regerr = "This account doesn't exist!";
                return;
            }

            return $result = (object)array(
                                            "result" => $this->success,
                                            "error" => $this->regerr
                                          );

        }

        function tryReg()
        {
            //check if user or email exists
            if(!$this->verifyUserdata(($this->dbtable === "companyaccounts") ? "companyname" : "username",array($this->username)))
            {
                $this->regerr = 'This USERNAME already exists!';
                $this->success = false;
            }

            else if(!$this->verifyUserdata('email',array($this->email)))
            {
                $this->regerr = 'This E-MAIL already exists!';
                $this->success = false;
            }

            //insert user into the db and send a mail with the activation code
            else
            {
                $this->insertUser();
                $this->success = true;

                //send mail
                $to = $this->email;
                $subject = "account activation";
                $HTMLbody = "Your account activation code is <b>".$this->activation_code."</b>";
                $nonHTMLbody = "Your account activation code is ".$this->activation_code;

                sendMail($to,$subject,$HTMLbody,$nonHTMLbody);

            }

            return $result = (object)array(
                                            "result" => $this->success,
                                            "error" => $this->regerr,
                                            "activation_code" => $this->activation_code
                                          );
        }
    }
?>