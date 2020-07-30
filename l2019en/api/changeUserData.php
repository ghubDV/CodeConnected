<?php
    include 'permissions.php';
    include 'dbclass.php';
    include 'createUserJWT.php';
    include 'sendMail.php';
    include 'reusableFunctions.php';

    //get data
    $data = json_decode(file_get_contents("php://input"),true);

    class changeUserData
    {
       public $db;
       public $dbtable;
       public $type;
       public $current_email;
       public $new_email;
       public $password;
       public $new_password;

       function __construct($current_e,$new_e,$p,$new_p,$t)
       {
           $this->check='';
           $this->current_email = $current_e;
           $this->new_email = $new_e;
           $this->password = $p;
           $this->new_password = $new_p;
           $this->db = new dbclass();
           $this->type = $t;
           if($t === "Company")
           {
               $this->dbtable = "companyaccounts";
           }
           else
           {
               $this->dbtable = "useraccounts";
           }
       }

       function checkUser()
       {

           //constructing check query
            $query = "SELECT * FROM ".$this->dbtable." WHERE email = ?";
            $params = array($this->current_email);

            //running query to check if any results match
            $response = $this->db->run_query($query,$params);
            $affectedRows = $response['affectedRows'];
            $result = $response['result'];

            //email and pass hash from db
            $email = '';
            $pass_hash = '';


            if($affectedRows === 1)
            {
                //getting email and pass from db
                foreach ($result as $key => $row)
                {
                    $email = $row['email'];
                    $pass_hash = $row['password_hash'];
                }

                if(password_verify($this->password,$pass_hash))
                {
                    return true;
                }
            }   

            return false;

       }

       function updateEmail()
       {
            //generate activation code hash
            $arc_hash = generate_ac_hash();

            //constructing update query
            $query = "UPDATE ".$this->dbtable." ".
                     "SET email = ?, isActive = 'F', arc_hash = ?".
                     "WHERE email = ?";
            $params = array($this->new_email,$arc_hash->hash,$this->current_email);

            //running update query
            $response = $this->db->run_query($query,$params);
            $affectedRows = $response['affectedRows'];

            if($affectedRows === 1)
            {
                return true;
            }
            
            return false;
       }

       function updatePassword()
       {
           //update password query
            $query = "UPDATE ".$this->dbtable." ".
                     "SET password_hash = ?".
                     "WHERE email = ?";
            
            //generating new password hash and constructing the parameter list for the query
            $newPass_hash = password_hash($this->new_password,PASSWORD_DEFAULT);
            $params = array($newPass_hash,$this->current_email);

            //running update query
            $response = $this->db->run_query($query,$params);
            $affectedRows = $response['affectedRows'];

            if($affectedRows === 1)
            {
                return true;
            }
            
            return false;
       }


       function getUpdatedData($onThisEmail)
       {
            //constructing get query
            $query = "SELECT * FROM ".$this->dbtable." WHERE email = ?";
            $params = array($onThisEmail);

            //running query to check if any results match
            $response = $this->db->run_query($query,$params);
            $affectedRows = $response['affectedRows'];
            $result = $response['result'];

            //user data vars
            $id = '';
            $username = '';
            $email = '';
            $isActive = '';


            if($affectedRows === 1)
            {
                //getting email and pass from db
                foreach ($result as $key => $row)
                {
                    $id = $row[$this->type.'_id'];
                    $username = $row[$this->type.'name'];
                    $email = $row['email'];
                    $isActive = $row['isActive'];
                }

                //issuing a jwt token with the user data
                $token = JWT_create($id,$username,$email,$isActive,$this->type);
                return $token;
            }

            return false;
        }   

       function sendActivationCode()
       {
           //generating a new activation code and hash
            $arc_hash = generate_ac_hash();

            $query = "UPDATE ".$this->dbtable.
                     " SET arc_hash = ?".
                     " WHERE email = ?";
            $params = array($arc_hash->hash,$this->current_email);

            $response = $this->db->run_query($query,$params);
            $affectedRows = $response['affectedRows'];

            if($affectedRows === 1)
            {
                //send mail
                $to = $this->current_email;
                $subject = "account activation";
                $HTMLbody = "Your account activation code is <b>".$arc_hash->code."</b>";
                $nonHTMLbody = "Your account activation code is ".$arc_hash->code;

                sendMail($to,$subject,$HTMLbody,$nonHTMLbody);

                return ((object)array(
                    "code" => $arc_hash->code,
                    "server" => true,
                    "sent" => true
                ));   
            }
            else
            {
                return ((object)array(
                    "server" => false,
                    "sent" => false
                ));   
            }

       }

       function checkActivationCode($activation_code)
       {
        $query = "SELECT * FROM ".$this->dbtable.
                 " WHERE email = ?";
        $params = array($this->current_email);

        //running query to check if any results match
        $response = $this->db->run_query($query,$params);
        $affectedRows = $response['affectedRows'];
        $result = $response['result'];

        //activation code hash from db
        $arc_hash = '';


        if($affectedRows === 1)
        {
            //getting activation code hash from db
            foreach ($result as $key => $row)
            {
                $arc_hash = $row['arc_hash'];
            }

            if(password_verify($activation_code,$arc_hash))
            {
                return true;
            }
        }  
        
        return false;
       }

       function checkAC($activation_code)
       {
        $query = "SELECT * FROM ".$this->dbtable.
                 " WHERE email = ?";
        $params = array($this->current_email);

        //running query to check if any results match
        $response = $this->db->run_query($query,$params);
        $affectedRows = $response['affectedRows'];
        $result = $response['result'];

        //activation code hash from db
        $arc_hash = '';


        if($affectedRows === 1)
        {
            //getting activation code hash from db
            foreach ($result as $key => $row)
            {
                $arc_hash = $row['arc_hash'];
            }

            if(password_verify($activation_code,$arc_hash))
            {
                return ((object)array(
                    "isMatch" => true,
                )); 
            }
        }  
        
        return ((object)array(
            "isMatch" => false,
        ));

       }

       function activateAccount($activation_code)
       {
           if(!$this->checkActivationCode($activation_code))
           {
                return ((object)array(
                    "server" => false,
                    "credentials" => false,
                    "active" => false
                )); 
           }
           else
           {
                $query = "UPDATE ".$this->dbtable.
                         " SET isActive = 'T'".
                         " WHERE email = ?";
                $params = array($this->current_email);

                $response = $this->db->run_query($query,$params);
                $affectedRows = $response['affectedRows'];

                if($affectedRows === 1)
                {
                    $token = $this->getUpdatedData($this->current_email);

                    return ((object)array(
                        "server" => true,
                        "credentials" => true,
                        "active" => true,
                        "jwt" => $token
                    )); 
                }

                else
                {
                    return ((object)array(
                        "server" => false,
                        "credentials" => true,
                        "active" => false
                    )); 
                }
           }
       }

       function changeEmail()
       {
           if(!$this->checkUser())
           {
               //user data is not valid or something went wrong

               return ((object)array(
                    "error" => $this->check,
                    "server" => true,
                    "credentials" => false,
                    "emailChange" => false
               ));

           }
           else
           {
                //updating user data
                if(!$this->updateEmail())
                {
                    //query failed
                    return ((object)array(
                        "server" => false,
                        "credentials" => true,
                        "emailChange" => false
                    ));
                }
                else
                {
                    $token = $this->getUpdatedData($this->new_email);

                    return ((object)array(
                        "server" => true,
                        "credentials" => true,
                        "emailChange" => true,
                        "jwt" => $token
                    ));
                }

            }
       }

       function changePassword()
       {
            if(!$this->checkUser())
            {
                //user data is not valid or something went wrong

                return ((object)array(
                    "server" => true,
                    "credentials" => false,
                    "passwordChange" => false
                ));

            }
            else
            {
                 //updating password
                 if(!$this->updatePassword())
                 {
                     //query failed
                     return ((object)array(
                         "server" => false,
                         "credentials" => true,
                         "passwordChange" => false
                     ));
                 }
                 else
                 {
                     return ((object)array(
                         "server" => true,
                         "credentials" => true,
                         "passwordChange" => true,
                     ));
                 }
            }
       }

    }

    if($data['change'] === 'email')
    {
        $change = new changeUserData($data['c_email'],$data['n_email'],$data['pass'],null,$data['type']);

        $result = $change->changeEmail();

        echo json_encode($result);
        die;
    }
    
    if($data['change'] === 'password')
    {
        $change = new changeUserData($data['c_email'],null,$data['pass'],$data['n_pass'],$data['type']);

        $result = $change->changePassword();

        echo json_encode($result);
        die;
    }

    if($data['change'] === 'send')
    {
        $change = new changeUserData($data['c_email'],null,null,null,$data['type']);

        $result = $change->sendActivationCode();

        echo json_encode($result);
        die;
    }

    if($data['change'] === 'activate')
    {
        $change = new changeUserData($data['c_email'],null,null,null,$data['type']);

        $result = $change->activateAccount($data['activation_code']);

        echo json_encode($result);
        die;
    }

    if($data['change'] === 'checkActivationCode')
    {
        $change = new changeUserData($data['c_email'],null,null,null,$data['type']);

        $result = $change->checkAC($data['activation_code']);

        echo json_encode($result);

        die;
    }
    if($data['change'] === 'forgotChange')
    {
        $change = new changeUserData($data['c_email'],null,null,$data['n_pass'],$data['type']);

        $result = $change->updatePassword();

        echo json_encode($result);
        die;
    }
?>