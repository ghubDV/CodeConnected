<?php

    function generate_ac_hash()
    {
        $activation_code = substr(str_shuffle('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'),1,10);
        $arc_hash = password_hash($activation_code,PASSWORD_DEFAULT);

        return (object)array(
            "code" => $activation_code,
            "hash" => $arc_hash
        );
    }

    function encrypt_var($variable)
    {
        $encrypted = password_hash($variable,PASSWORD_DEFAULT);
        
        return $encrypted;
    }

    function runQuery($query,$params)
    {
        $db = new dbclass();
        
        $response = $db->run_query($query,$params);

        $affectedRows = $response['affectedRows'];
        $result = $response['result'];

        return (object)array(
            "affectedRows" => $affectedRows,
            "result" => $result
        );
    }

    function createProfilePath($rootPathList,$childPathList)
    {
        foreach($rootPathList as $rootPath)
        {
            if(!file_exists(realpath(dirname(__FILE__) .$rootPath)))
            {
                mkdir(dirname(__FILE__) . $rootPath,0777,true);

                foreach($childPathList as $childPath)
                {
                    mkdir(realpath(dirname(__FILE__) . $rootPath).$childPath,0777,true);
                }
            }

            else
            {
                foreach($childPathList as $childPath)
                {
                    if(!file_exists(realpath(dirname(__FILE__) . $rootPath).$childPath))
                    {
                        mkdir(realpath(dirname(__FILE__) . $rootPath).$childPath,0777,true);
                    }
                }
            }
        }
    }

    function move_files_to_server($fileList,$pathList)
    {
        $list = array_combine($fileList,$pathList);
        foreach($fileList as $index => $file)
        {
            move_uploaded_file($file,$pathList[$index]);
        }
    }

    function clearDirectory($path)
    {
        $files = glob($path); // get all file names
        foreach($files as $file)
        { 
            // iterate files
            if(is_file($file))
                unlink($file); // delete file
        }
    }

    function encode_file_to_axios($relativePath,$type,$folder)
    {
        if(isset($relativePath) && !empty($relativePath))
        {
            $fileName = explode("/",$relativePath);
            $id = explode(".",$fileName[1]);
            $path = '../../profiles/'.$type."profiles/".$type[0]."id.".$id[1]."/".$folder."/".$fileName[count($fileName) - 1];

            if(@file_get_contents($path) === FALSE)
            {
                return null;
            }
            else
            {
                $cache = @file_get_contents($path);

                $file = 'data:'.mime_content_type($path).';base64,'.base64_encode($cache);
    
                return $file;
            }
        }
        return null;
    }
?>