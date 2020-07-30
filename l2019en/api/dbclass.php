<?php

    class dbclass
    {
        public $dbserver = '<db_server>';
        public $dbuser ='<db_user>';
        public $dbpass = '<db_pass>';
        public $dbname = '<db_name>';

        function db_open()
        {
            try
            {
                $conn = new PDO('mysql:dbname='.$this->dbname.';host='.$this->dbserver,$this->dbuser,$this->dbpass);
            }

            catch(PDOException $e)
            {
                echo 'Exception -> ';
                var_dump($e->getMessage());
                die;
            }

            return $conn;
        }

        function run_query($query,$params)
        {
            $stmt = $this->db_open()->prepare($query);
            $stmt->execute($params);
            $count = $stmt->rowCount();
            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return array('affectedRows' => $count,'result' => $result);
        }
    }

?>
