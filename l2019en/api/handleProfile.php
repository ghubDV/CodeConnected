<?php
    include 'permissions.php';
    include 'dbclass.php';
    include 'reusableFunctions.php';
    require __DIR__ . '/vendor/autoload.php';

    class Profile {

       public $db;
       public $accountTable;
       public $profileTable;
       public $id;
       public $idType;
       public $type;
       public $profileData;
       public $files;
       public $add;
       public $edit;
       public $pusher;

       function __construct($i,$idType,$t,$profile,$files)
       {
           $this->id = $i;
           $this->idType = $idType;
           $this->type = $t;
           $this->profileData = $profile;
           $this->files = $files;
           $this->db = new dbclass();
           $this->add = false;
           $this->edit = false;

           if($t === 'company')
           {
                $this->profileTable = 'companydata';
                $this->accountTable = 'companyaccounts';
           }
           else if($t === "user")
           {
                $this->profileTable = 'userdata';
                $this->accountTable = 'useraccounts';
           }
           else
           {
               $this->profileTable = 'jobdata';
               $this->accountTable = 'companyaccounts';
           }
       }

       function checkUser($table)
       {
            $query = "SELECT * FROM ".$table." WHERE ".$this->type."_id = ?";
            $params = array($this->id);
            $dbResponse = runQuery($query,$params);

            if($dbResponse->affectedRows === 1)
            {
                return true;
            }

            return false;
       }

       function checkIfApplied($userID,$jobID)
       {
            $query="SELECT * FROM applications WHERE userprofile_id = ? AND job_id = ?";

            $params= array($userID,$jobID);

            $dbResponse = runQuery($query,$params);

            if($dbResponse->affectedRows === 1)
            {
               return true;
            }

            return false;
       }

       function updateProfile()
       {
          //setting avatar and cv paths to add to the db
          $avatarPath = "";
          $cvPath = "";
          $message = "";

          $query = "UPDATE ".$this->profileTable." SET";

          if($this->type === 'user')
          {
               $message = "Profile ";
               $queryArray = array(
                    " first_name = ?,",
                    " last_name = ?,",
                    " birth_date = ?,",
                    " avatar = ?,",
                    " description = ?,",
                    " profession = ?,",
                    " cv = ?,",
                    " education = ?,",
                    " country = ?,",
                    " state = ?,",
                    " city = ?,",
                    " contact_email = ?,"
               );

               $paramsNames = array(
                    "firstName",
                    "lastName",
                    "birthDate",
                    "avatar",
                    "description",
                    "profession",
                    "cv",
                    "education",
                    "country",
                    "state",
                    "city",
                    "contactEmail"
               );
          }

          else if($this->type === "company")
          {
               $message = "Profile ";
               $queryArray = array(
                    " companyName = ?,",
                    " workDomain = ?,",
                    " companyDescription = ?,",
                    " founded = ?,",
                    " contactEmail = ?,",
                    " avatar = ?,",
                    " country = ?,",
                    " state = ?,",
                    " city = ?,",
                    " website = ?,"
               );

               $paramsNames = array(
                    "companyName",
                    "workDomain",
                    "companyDescription",
                    "founded",
                    "contactEmail",
                    "avatar",
                    "country",
                    "state",
                    "city",
                    "website"
               );
          }
          else if($this->type === "job")
          {
               $message = "Job post ";
               $queryArray = array(
                    " jobName = ?,",
                    " companyName = ?,",
                    " jobDescription = ?,",
                    " jobFunction = ?,",
                    " contactEmail = ?,",
                    " experienceLevel = ?,",
                    " country = ?,",
                    " state = ?,",
                    " city = ?,",
                    " avatar = ?,"
               );

               $paramsNames = array(
                    "jobName",
                    "companyName",
                    "jobDescription",
                    "jobFunction",
                    "contactEmail",
                    "experienceLevel",
                    "country",
                    "state",
                    "city",
                    "avatar"
               );
          }

          $params = array();

          foreach($paramsNames as $index => $paramName)
          {
               if($paramName === "avatar" && isset($this->files->avatar))
               {
                    $query.=$queryArray[$index];

                    $avatarPath = $this->type."profiles/".$this->type[0]."id.".$this->id."/avatar/".$this->files->avatar['name'];

                    array_push($params,$avatarPath);
               }
               else if($paramName === "cv" && isset($this->files->cv))
               {
                    $query.=$queryArray[$index];

                    $cvPath = $this->type."profiles/".$this->type[0]."id.".$this->id."/cv/".$this->files->cv['name'];

                    array_push($params,$cvPath);
               }

               else if(isset($this->profileData->{$paramName}))
               {
                    $query.= $queryArray[$index];
                    array_push($params,$this->profileData->{$paramName});
               }

               else
               {

               }
          }

          //update query
          $query = mb_substr($query,0,-1);
          $query.= " WHERE ".$this->type."_id = ?";
          array_push($params,$this->id);

          $dbResponse = runQuery($query,$params);

          if($dbResponse->affectedRows === 1)
          {
               //profile was updated
               echo json_encode((object)array(
                    "message" => $message."was updated successfully!",
                    "severity" => "success"
               ));
          }
          else
          {
               //profile update failed
               echo json_encode((object)array(
                    "message" => $message."update failed due to server or invalid credentials!",
                    "severity" => "error"
               ));
          }
      }

       function insertProfile()
       {

          //setting avatar and cv paths to add to the db
          $avatarPath = "";
          $cvPath = "";
          $message = "";
          if(isset($this->files->avatar))
          {
               $avatarPath = $this->type."profiles/".$this->type[0]."id.".$this->id."/avatar/".$this->files->avatar['name'];
          }
          else
          {

          }

          if(isset($this->files->cv))
          {
               $cvPath = $this->type."profiles/".$this->type[0]."id.".$this->id."/cv/".$this->files->cv['name'];
          }
          else
          {

          }

          //constructing insert profile query
          if($this->type === "user")
          {
               $message="Profile ";

               $query = "INSERT INTO ".$this->profileTable." (user_id,first_name,last_name,birth_date,avatar,description,profession,cv,education,country,state,city,contact_email)
                         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)";

               $params = array(
                    $this->id,
                    $this->profileData->firstName,
                    $this->profileData->lastName,
                    $this->profileData->birthDate,
                    $avatarPath,
                    $this->profileData->description,
                    $this->profileData->profession,
                    $cvPath,
                    $this->profileData->education,
                    $this->profileData->country,
                    $this->profileData->state,
                    $this->profileData->city,
                    $this->profileData->contactEmail
               );
          }
          else if($this->type === "company")
          {
               $message="Profile ";

               $query = "INSERT INTO ".$this->profileTable." (company_id,companyName,workDomain,companyDescription,founded,contactEmail,avatar,country,state,city,website)
                         VALUES (?,?,?,?,?,?,?,?,?,?,?)";

               $params = array(
                    $this->id,
                    $this->profileData->companyName,
                    $this->profileData->workDomain,
                    $this->profileData->companyDescription,
                    $this->profileData->founded,
                    $this->profileData->contactEmail,
                    $avatarPath,
                    $this->profileData->country,
                    $this->profileData->state,
                    $this->profileData->city,
                    $this->profileData->website
               );
          }
          else if($this->type === "job")
          {
               $message="Job post ";


               $query = "INSERT INTO ".$this->profileTable." (companyprofile_id,jobName,jobDescription,jobFunction,contactEmail,experienceLevel,country,state,city)
                         VALUES (?,?,?,?,?,?,?,?,?)";

               $params = array(
                    $this->id,
                    $this->profileData->jobName,
                    $this->profileData->jobDescription,
                    $this->profileData->jobFunction,
                    $this->profileData->contactEmail,
                    $this->profileData->experienceLevel,
                    $this->profileData->country,
                    $this->profileData->state,
                    $this->profileData->city,
               );
          }

          $dbResponse = runQuery($query,$params);

          if($dbResponse->affectedRows === 1)
          {
               //profile created
               echo json_encode((object)array(
                    "message" => $message."was created successfuly",
                    "severity" => "success"
               ));
          }
          else
          {
               //query failed
               echo json_encode((object)array(
                    "message" => $message."creation failed due to server or invalid credentials!",
                    "severity" => "error"
               ));
          }
       }

       function insertApplication($userID,$jobID,$companyID)
       {
            $query = "INSERT INTO applications(userprofile_id,companyprofile_id,job_id)
                      SELECT ? ,? , ?
                      WHERE (SELECT jobdata.status
                             FROM jobdata
                             WHERE jobdata.job_id = ? ) = 'active'";

            $params = array($userID,$companyID,$jobID,$jobID);

            $dbResponse = runQuery($query,$params);

            if($dbResponse->affectedRows === 1)
            {
               return true;
            }
            else
            {
               return false;
            }
       }

       function create_notification($type,$userprofileID,$companyprofileID,$jobID,$sender,$recipient,$application_status)
       {
          $query = "DELETE FROM notifications
                    WHERE notification_type = 'application updated' AND
                          userprofile_id = ".$userprofileID." AND
                          companyprofile_id = ".$companyprofileID." AND
                          job_id = ".$jobID." AND
                          sender = '".$sender."' AND
                          recipient = '".$recipient."'";

          $dbResponse=runQuery($query,array());

          $query = "INSERT INTO notifications(notification_type,companyprofile_id,userprofile_id,job_id,request_id,sender,recipient)
                    SELECT '".$type."',companydata.companyprofile_id,userdata.userprofile_id,jobdata.job_id,
                           applications.request_id ,'".$sender."' , '".$recipient."'
                    FROM useraccounts
                    INNER JOIN userdata on(useraccounts.user_id=userdata.user_id)
                    INNER JOIN applications on(userdata.userprofile_id=applications.userprofile_id)
                    INNER JOIN jobdata on(applications.job_id=jobdata.job_id)
                    INNER JOIN companydata on(jobdata.companyprofile_id=companydata.companyprofile_id)
                    INNER JOIN companyaccounts on(companydata.company_id=companyaccounts.company_id)
                    WHERE userdata.userprofile_id = ? AND jobdata.job_id = ? AND companydata.companyprofile_id = ?";

          $params = array($userprofileID,$jobID,$companyprofileID);

          $dbResponse = runQuery($query,$params);

          if($dbResponse->affectedRows === 1)
          {
               return true;
          }
          else
          {
               return false;
          }
       }

       function getProfile()
       {
          if($this->idType === null)
          {
               $query = "SELECT * FROM ".$this->profileTable." WHERE ".$this->type."_id = ?";
               $params = array($this->id);
          }
          else if($this->type === "job")
          {
               $query = "SELECT companydata.companyprofile_id,companydata.companyName,companydata.avatar,
                                jobdata.job_id, jobdata.jobName,jobdata.jobDescription,jobdata.jobFunction,jobdata.datePosted,jobdata.experienceLevel,
                                jobdata.country as country,jobdata.state as state,jobdata.city as city,jobdata.contactEmail,jobdata.status,
                                COUNT(applications.request_id) as applicationsNumber
                         FROM ".$this->profileTable."
                         INNER JOIN companydata on(companydata.companyprofile_id=".$this->profileTable.".companyprofile_id)
                         INNER JOIN applications on(".$this->profileTable.".job_id = applications.job_id)
                         WHERE ".$this->profileTable.".".$this->idType."_id = ?";
               $params = array($this->id);
          }
          else
          {
               $query = "SELECT * FROM ".$this->profileTable." WHERE ".$this->idType."_id = ?";
               $params = array($this->id);
          }


          $dbResponse = runQuery($query,$params);

          if($dbResponse->affectedRows === 1)
          {
               //profile_found

               if($this->type === "company")
               {
                    foreach($dbResponse->result as $key => $row)
                    {
                         $avatar = encode_file_to_axios($row['avatar'],$this->type,'avatar');

                         echo json_encode((object)array(
                              "profileExists" => true,
                              "profile_id" => $row['companyprofile_id'],
                              "companyName" => $row['companyName'],
                              "workDomain" => $row['workDomain'],
                              "companyDescription" => $row['companyDescription'],
                              "founded" => $row['founded'],
                              "contactEmail" => $row['contactEmail'],
                              "avatar" => $avatar,
                              "country" => $row['country'],
                              "state" => $row['state'],
                              "city" => $row['city'],
                              "website" => $row['website']
                         ));
                    }
               }

               else if($this->type === "user")
               {

                    foreach($dbResponse->result as $key => $row)
                    {
                         $avatar = encode_file_to_axios($row['avatar'],$this->type,'avatar');
                         $cv = encode_file_to_axios($row['cv'],$this->type,'cv');

                         echo json_encode((object)array(
                              "profileExists" => true,
                              "firstName" => $row['first_name'],
                              "lastName" => $row['last_name'],
                              "birthDate" => $row['birth_date'],
                              "avatar" => $avatar,
                              "description" => $row['description'],
                              "profession" => $row['profession'],
                              "cv" => $row['cv'],
                              "cvFile" => $cv,
                              "education" => $row['education'],
                              "country" => $row['country'],
                              "state" => $row['state'],
                              "city" => $row['city'],
                              "contactEmail" => $row['contact_email']
                         ));
                    }
               }

               else if($this->type === "job")
               {
                    foreach($dbResponse->result as $key => $row)
                    {
                         $avatar = encode_file_to_axios($row['avatar'],'company','avatar');

                         echo json_encode((object)array(
                              "profileExists" => ($row['status'] === 'active') ? (true) : (false),
                              "company_id" => $row['companyprofile_id'],
                              "companyName" => $row['companyName'],
                              "job_id" => $row['job_id'],
                              "jobName" => $row['jobName'],
                              "jobDescription" => $row['jobDescription'],
                              "jobFunction" => $row['jobFunction'],
                              "datePosted" => $row['datePosted'],
                              "experienceLevel" => $row['experienceLevel'],
                              "country" => $row['country'],
                              "state" => $row['state'],
                              "city" => $row['city'],
                              "contactEmail" => $row['contactEmail'],
                              "avatar" => $avatar,
                              "applicationsNumber" => $row['applicationsNumber']
                         ));
                    }
               }

          }

          else
          {
               echo json_encode((object)array(
                    "profileExists" => false
               ));

          }
       }

       function getJobList()
       {
            $query = "SELECT jobdata.job_id,companydata.avatar,jobdata.jobName,
                             companydata.companyName,jobdata.country,jobdata.state,
                             jobdata.city,jobdata.datePosted,jobdata.experienceLevel,jobdata.status
                      FROM companyaccounts
                      INNER JOIN companydata ON(companyaccounts.company_id=companydata.company_id)
                      INNER JOIN jobdata ON(companydata.companyprofile_id=jobdata.companyprofile_id)
                      WHERE companyaccounts.company_id = ?";

            $params = array($this->id);
            $jobList = array();

            $dbResponse = runQuery($query,$params);

            if($dbResponse->affectedRows >= 1)
            {
               foreach($dbResponse->result as $key => $row)
               {
                    $avatar = encode_file_to_axios($row['avatar'],'company','avatar');
                    $job = ((object)array(
                         "type" => $this->type,
                         "id" => $row['job_id'],
                         "jobName" => $row['jobName'],
                         "avatar" => $avatar,
                         "companyName" => $row['companyName'],
                         "country" => $row['country'],
                         "state" => $row['state'],
                         "city" => $row['city'],
                         "datePosted" => $row['datePosted'],
                         "experienceLevel" => $row['experienceLevel'],
                         "status" => $row['status']
                    ));

                    array_push($jobList,$job);
               }
            }

            echo json_encode($jobList);
       }

       function getProfileEdit($jobID)
       {
          $query = "SELECT companydata.companyprofile_id,jobdata.job_id,companydata.avatar,jobdata.jobName,
                           companydata.companyName,jobdata.jobDescription,jobdata.jobFunction,jobdata.country,jobdata.state,
                           jobdata.city,jobdata.datePosted,jobdata.experienceLevel,jobdata.contactEmail
                    FROM companyaccounts
                    INNER JOIN companydata ON(companyaccounts.company_id=companydata.company_id)
                    INNER JOIN jobdata ON(companydata.companyprofile_id=jobdata.companyprofile_id)
                    WHERE companyaccounts.company_id = ? AND jobdata.job_id = ?";

          $params = array($this->id,$jobID);

          $dbResponse = runQuery($query,$params);

          if($dbResponse->affectedRows === 1)
          {
               foreach($dbResponse->result as $key => $row)
               {
                    $avatar = encode_file_to_axios($row['avatar'],'company','avatar');
                    echo json_encode((object)array(
                         "profileExists" => true,
                         "company_id" => $row['companyprofile_id'],
                         "job_id" => $row['job_id'],
                         "jobName" => $row['jobName'],
                         "companyName" => $row['companyName'],
                         "jobDescription" => $row['jobDescription'],
                         "jobFunction" => $row['jobFunction'],
                         "datePosted" => $row['datePosted'],
                         "experienceLevel" => $row['experienceLevel'],
                         "country" => $row['country'],
                         "state" => $row['state'],
                         "city" => $row['city'],
                         "avatar" => $avatar,
                         "contactEmail" => $row['contactEmail']
                    ));
               }
          }
          else
          {
               echo json_encode((object)array(
                    "profileExists" => false
               ));
          }

       }

       //getter function for inserting the application
       function getApplicationData($companyprofileID)
       {
            $data = array(null,null);

            $query = "SELECT userdata.userprofile_id
                      FROM useraccounts
                      INNER JOIN userdata ON(useraccounts.user_id = userdata.user_id)
                      WHERE useraccounts.user_id = ?";
            $params = array($this->id);

            $dbResponse = runQuery($query,$params);

            if($dbResponse->affectedRows === 1)
            {
               foreach($dbResponse->result as $key => $row)
               {
                    $data[0] = $row['userprofile_id'];
               }
            }

            $query = "SELECT companyaccounts.company_id
                      FROM companydata
                      INNER JOIN companyaccounts ON(companydata.company_id = companyaccounts.company_id)
                      WHERE companydata.companyprofile_id = ?";
            $params = array($companyprofileID);

            $dbResponse = runQuery($query,$params);

            if($dbResponse->affectedRows === 1)
            {
               foreach($dbResponse->result as $key => $row)
               {
                    $data[1] = $row['company_id'];
               }
            }

            return $data;
       }

       //getting a list with applied jobs for a user
       function getAppliedJobs()
       {
          $results=array();

          $query = "SELECT companydata.companyName,companydata.companyprofile_id,companydata.avatar,jobdata.contactEmail,
                           jobdata.jobName,jobdata.job_id,applications.updated_on,applications.status,applications.userprofile_id
                    FROM useraccounts
                    INNER JOIN userdata ON(useraccounts.user_id = userdata.user_id)
                    INNER JOIN applications ON(userdata.userprofile_id = applications.userprofile_id)
                    INNER JOIN jobdata ON(applications.job_id = jobdata.job_id)
                    INNER JOIN companydata ON(jobdata.companyprofile_id = companydata.companyprofile_id)
                    WHERE useraccounts.user_id = ?
                    ORDER BY applications.updated_on DESC";

          $params = array($this->id);

          $dbResponse = runQuery($query,$params);

          if($dbResponse->affectedRows >= 1)
          {
               foreach($dbResponse->result as $key => $row)
               {
                    $avatar = encode_file_to_axios($row['avatar'],'company','avatar');
                    $result = (object)array(
                         "type" => "application",
                         "job_id" => $row['job_id'],
                         "companyprofile_id" => $row['companyprofile_id'],
                         "userprofile_id" => $row['userprofile_id'],
                         "jobName" => $row['jobName'],
                         "companyName" => $row['companyName'],
                         "contactEmail" => $row['contactEmail'],
                         "avatar" => $avatar,
                         "status" => $row['status'],
                         "updated_on" => $row['updated_on']
                    );

                    array_push($results,$result);
               }
          }

          echo json_encode($results);

       }

       //get applicants for the jobs posted
       function getApplicants()
       {
          $results=array();

          $query = "SELECT useraccounts.user_id as user_id,userdata.first_name,userdata.last_name,userdata.profession,userdata.avatar,userdata.cv,
                           companydata.companyprofile_id,companydata.companyName,
                           jobdata.jobName,jobdata.job_id,applications.status,applications.userprofile_id,
                           userdata.country,userdata.state,userdata.city,applications.updated_on
                    FROM companyaccounts
                    INNER JOIN companydata ON(companyaccounts.company_id = companydata.company_id)
                    INNER JOIN jobdata ON(companydata.companyprofile_id = jobdata.companyprofile_id)
                    INNER JOIN applications ON(jobdata.job_id = applications.job_id)
                    INNER JOIN userdata ON(applications.userprofile_id = userdata.userprofile_id)
                    INNER JOIN useraccounts ON(userdata.user_id=useraccounts.user_id)
                    WHERE companyaccounts.company_id = ? AND jobdata.status = 'active'";

          $params = array($this->id);

          $dbResponse = runQuery($query,$params);

          if($dbResponse->affectedRows >= 1)
          {
               foreach($dbResponse->result as $key => $row)
               {
                    $avatar = encode_file_to_axios($row['avatar'],'user','avatar');
                    $cv = encode_file_to_axios($row['cv'],'user','cv');
                    $result = (object)array(
                         "type" => "applicant",
                         "first_name" => $row['first_name'],
                         "last_name" => $row['last_name'],
                         "profession" => $row['profession'],
                         "user_id" => $row['user_id'],
                         "userprofile_id" => $row['userprofile_id'],
                         "companyName" => $row['companyName'],
                         "companyprofile_id" => $row['companyprofile_id'],
                         "jobName" => $row['jobName'],
                         "job_id" => $row['job_id'],
                         "avatar" => $avatar,
                         "cv" => $row['cv'],
                         "cvFile" => $cv,
                         "status" => $row['status'],
                         "country" => $row['country'],
                         "state" => $row['state'],
                         "city" => $row['city'],
                         "updated_on" => $row['updated_on']
                    );

                    array_push($results,$result);
               }
          }

          echo json_encode($results);
       }

       //get notifications
       function getNotifications()
       {
            $notifications = array();
            $notificationsCount = null;
            $sender = '';
            if ($this->type ==='user')
            {
               $sender = 'company';
            }
            else
            {
               $sender = 'user';
            }

            $query = "SELECT COUNT(*) as notificationsCount
                      FROM ".$this->type."accounts
                      INNER JOIN ".$this->type."data ON(".$this->type."accounts.".$this->type."_id = ".$this->type."data.".$this->type."_id)
                      INNER JOIN applications ON(".$this->type."data.".$this->type."profile_id = applications.".$this->type."profile_id)
                      INNER JOIN jobdata ON(applications.job_id = jobdata.job_id)
                      INNER JOIN notifications ON(applications.request_id=notifications.request_id)
                      WHERE ".$this->type."accounts.".$this->type."_id = ? AND notifications.is_read = '0' AND notifications.recipient = '".$this->type."'";

            $params = array($this->id);

            $dbResponse = runQuery($query,$params);

            foreach($dbResponse->result as $key => $row)
            {
               $notificationsCount = $row['notificationsCount'];
            }

            $query = "SELECT *, ".$sender."data.avatar as senderAvatar,applications.status as application_status,
                              CONCAT(userdata.first_name,' ',userdata.last_name) as userName,companydata.companyName as companyName
                      FROM ".$this->type."accounts
                      INNER JOIN ".$this->type."data ON(".$this->type."accounts.".$this->type."_id = ".$this->type."data.".$this->type."_id)
                      INNER JOIN applications ON(".$this->type."data.".$this->type."profile_id = applications.".$this->type."profile_id)
                      INNER JOIN jobdata ON(applications.job_id = jobdata.job_id)
                      INNER JOIN notifications ON(applications.request_id=notifications.request_id)
                      INNER JOIN ".$sender."data ON(notifications.".$sender."profile_id = ".$sender."data.".$sender."profile_id)
                      WHERE ".$this->type."accounts.".$this->type."_id = ? AND notifications.recipient = '".$this->type."'
                      ORDER BY notifications.created_at DESC";

            $params = array($this->id);

            $dbResponse = runQuery($query,$params);

            foreach($dbResponse->result as $key => $row)
            {
                if($row['notification_id'] !== null)
                {
                    $avatar = encode_file_to_axios($row['senderAvatar'],$row['sender'],'avatar');

                    $notification = (object)array(
                         "notification_id" => $row['notification_id'],
                         "notification_type" => $row['notification_type'],
                         "companyprofile_id" => $row['companyprofile_id'],
                         "companyName" => $row['companyName'],
                         "userprofile_id" => $row['userprofile_id'],
                         "userName" => $row['userName'],
                         "job_id" => $row['job_id'],
                         "jobName" => $row['jobName'],
                         "sender" => $row['sender'],
                         "status" => $row['application_status'],
                         "sender_avatar" => $avatar,
                         "is_read" => $row['is_read'],
                         "created_at" => $row['created_at']
                     );

                     array_push($notifications,$notification);
                }
            }

            echo json_encode((object)array(
               "notifications" => $notifications,
               "notificationsCount" => $notificationsCount
            ));
       }

       //clear directories and copy files
       function handleFiles()
       {
          $fileList = array();
          $pathList = array();

          if(isset($this->files->cv))
          {
               //clean cv directory first
               clearDirectory('../../profiles/'.$this->type.'profiles/'.$this->type[0].'id.'.$this->id.'/cv/*');

               array_push($fileList,$this->files->cv['tmp_name']);
               array_push($pathList,'../../profiles/'.$this->type.'profiles/'.$this->type[0].'id.'.$this->id.'/cv'.'/'.$this->files->cv['name']);
          }
          else
          {

          }

          if(isset($this->files->avatar))
          {
               //clean avatar directory first
               clearDirectory('../../profiles/'.$this->type.'profiles/'.$this->type[0].'id.'.$this->id.'/avatar/*');

               array_push($fileList,$this->files->avatar['tmp_name']);
               array_push($pathList,'../../profiles/'.$this->type.'profiles/'.$this->type[0].'id.'.$this->id.'/avatar'.'/'.$this->files->avatar['name']);
          }
          else
          {

          }

          //moving files to server(avatar and cv)
          if(!empty($fileList) && !empty($pathList))
          {
               move_files_to_server($fileList,$pathList);
          }
       }

       function deleteCV()
       {
          clearDirectory('../../profiles/'.$this->type.'profiles/uid.'.$this->id.'/cv/*');

          $query = "UPDATE ".$this->profileTable.
                   " SET cv = ?".
                   " WHERE user_id = ?";

          $dbResponse = runQuery($query,array("",$this->id));

          if($dbResponse->affectedRows === 1)
          {
               echo json_encode("cv_deleted");
          }
          else
          {
               echo json_encode("failed");
          }

       }

       function disableJob()
       {
          //deleting all notifications for the disabled job
          $query = "DELETE FROM notifications
          WHERE job_id = ?";

          $dbResponse = runQuery($query,array($this->id));

          //deleting all applications from the disabled job
          $query = "DELETE FROM applications
                    WHERE job_id = ?";

          $dbResponse = runQuery($query,array($this->id));

          //set job status to inactive
          $query = "UPDATE ".$this->profileTable.
                   " SET status = 'inactive'".
                   " WHERE job_id = ?";

          $dbResponse = runQuery($query,array($this->id));

          if($dbResponse->affectedRows === 1)
          {
               echo json_encode((object)array(
                    "message" => "Job post deleted successfully!",
                    "severity" => "success"
               ));
          }
          else
          {
               echo json_encode((object)array(
                    "message" => "Job post delete operation failed!",
                    "severity" => "error"
               ));
          }
       }

       function deleteApplication($userprofile_id)
       {
          $query = "DELETE FROM notifications
                    WHERE notifications.userprofile_id = ? AND notifications.request_id =
                    (SELECT applications.request_id
                    FROM applications
                    WHERE applications.userprofile_id = ? AND applications.job_id = ?)";

          $dbResponse = runQuery($query,array($userprofile_id,$userprofile_id,$this->id));

          $query = "DELETE FROM applications
                    WHERE applications.userprofile_id = ? AND applications.job_id = ?";

          $dbResponse = runQuery($query,array($userprofile_id,$this->id));

          if($dbResponse->affectedRows >= 1)
          {
               echo json_encode((object)array(
                    "message" => "Application deleted successfully!",
                    "severity" => "success"
               ));
          }
          else
          {
               echo json_encode((object)array(
                    "message" => "Application delete operation failed!",
                    "severity" => "error"
               ));
          }
       }

       function update()
       {
          $this->handleFiles();

          $this->updateProfile();
       }

       function add()
       {

            if($this->type === "company")
            {
               //company
               $root = array('/../../profiles/companyprofiles/cid.'.$this->id);
               $child = array('/avatar');

               //path creation for user data
               createProfilePath($root,$child);

               $this->handleFiles();

               //adding profile to database
               $this->insertProfile();

            }
            else if($this->type === "user")
            {
               $root = array('/../../profiles/userprofiles/uid.'.$this->id);
               $child = array('/cv','/avatar');

               //path creation for user data
               createProfilePath($root,$child);

               $this->handleFiles();

               //adding profile to database
               $this->insertProfile();

            }
            else if($this->type === "job")
            {

               //adding profile to database
               $this->insertProfile();
            }

       }

       function addApplication($jobID,$companyprofileID)
       {
            $data = $this->getApplicationData($companyprofileID);
            $userprofileID = $data[0];
            $companyID = $data[1];

            if($userprofileID === null)
            {
               echo json_encode((object)array(
                    "message" => "Application failed - profile not found!",
                    "severity" => "error"
               ));
            }
            else if($companyID === null)
            {
               echo json_encode((object)array(
                    "message" => "Application failed - company not found!",
                    "severity" => "error"
               ));
            }
            else if($this->checkIfApplied($userprofileID,$jobID))
            {
               echo json_encode((object)array(
                    "message" => "You've already applied for this job!",
                    "severity" => "warning"
               ));
            }
            else
            {
               $type="new application";
               $sender="user";
               $recipient="company";

               $insert = $this->insertApplication($userprofileID,$jobID,$companyprofileID);
               $notification = $this->create_notification($type,$userprofileID,$companyprofileID,$jobID,$sender,$recipient,'pending');

               if($insert && $notification)
               {
                    //trigger push notification
                    $options = array(
                    'cluster' => '<cluster>'
                    );

                    $pusher = new Pusher\Pusher(
                    '<key>',
                    '<secret>',
                    '<app_id>',
                    $options
                    );

                    $data['type'] = 'insert application';
                    $pusher->trigger('notifications-company.'.$companyID, 'addNotification', $data);

                    echo json_encode((object)array(
                         "message" => "Application was made successfully!",
                         "severity" => "success"
                    ));
               }
               else{
                    echo json_encode((object)array(
                         "message" => "An error was encountered when making the application!",
                         "severity" => "error"
                    ));
               }
            }
       }

       function setApplicationStatus($userprofileID,$companyID,$status)
       {
          $companyprofileID = null;
          $userID = null;
          $query = "UPDATE applications
                    SET applications.status = '".$status."'".
                    " WHERE job_id = ? AND userprofile_id = ?";
          $params = array($this->id,$userprofileID);

          $dbResponse = runQuery($query,$params);

          if($dbResponse->affectedRows === 1)
          {
               //getting companyprofileID
               $query = "SELECT companydata.companyprofile_id
                         FROM companyaccounts
                         INNER JOIN companydata on(companydata.company_id=companyaccounts.company_id)
                         WHERE companyaccounts.company_id = ?";
               $params = array($companyID);

               $dbResponse = runQuery($query,$params);

               foreach($dbResponse->result as $key => $row)
               {
                    $companyprofileID = $row['companyprofile_id'];
               }

               //getting userID
               $query = "SELECT useraccounts.user_id
                         FROM userdata
                         INNER JOIN useraccounts on(useraccounts.user_id=userdata.user_id)
                         WHERE userdata.userprofile_id = ?";

               $params = array($userprofileID);

               $dbResponse = runQuery($query,$params);

               foreach($dbResponse->result as $key => $row)
               {
                    $userID = $row['user_id'];
               }

               $type="application updated";
               $sender="company";
               $recipient="user";

               $notification = $this->create_notification($type,$userprofileID,$companyprofileID,$this->id,$sender,$recipient,$status);

               if($notification)
               {
                    //trigger push notification
                    $options = array(
                    'cluster' => '<cluster>'
                    );

                    $pusher = new Pusher\Pusher(
                    '<key>',
                    '<secret>',
                    '<app_id>',
                    $options
                    );

                    $data['type'] = 'set application status';
                    $pusher->trigger('notifications-user.'.$userID, 'addNotification', $data);
               }

               echo json_encode((object)array(
                    "message" => "Application status set!",
                    "severity" => "success",
                    "user" => $userID
               ));
          }
          else
          {
               echo json_encode((object)array(
                    "message" => "Failed to set application status!",
                    "severity" => "error"
               ));
          }
       }

       function reActivateJob()
       {
          $query = "UPDATE jobdata
                    SET jobdata.status = 'active'
                    WHERE job_id = ?";

          $params = array($this->id);

          $dbResponse = runQuery($query,$params);

          if($dbResponse->affectedRows === 1)
          {
               echo json_encode((object)array(
                    "message" => "Job reactivated successfully",
                    "severity" => "success"
               ));
          }
          else
          {
               echo json_encode((object)array(
                    "message" => "Failed to reactivate job",
                    "severity" => "error"
               ));
          }
       }

       function NotificationsSeen()
       {
          $query = "UPDATE ".$this->type."accounts as acc
                    INNER JOIN ".$this->type."data ON(acc.".$this->type."_id = ".$this->type."data.".$this->type."_id)
                    INNER JOIN applications ON(".$this->type."data.".$this->type."profile_id = applications.".$this->type."profile_id)
                    INNER JOIN jobdata ON(applications.job_id = jobdata.job_id)
                    INNER JOIN notifications as n ON(applications.request_id=n.request_id)
                    SET n.is_read = '1'
                    WHERE acc.".$this->type."_id = ? AND n.is_read = '0'";

          $params = array($this->id);

          $dbResponse = runQuery($query,$params);

          $this->getNotifications();
       }

       function showInput()
       {
            echo json_encode(
                 (object)array(
                      "files" => $this->files,
                      "data" => $this->profileData,
                      "id" => $this->id,
                      "type" => $this->type)
            );
       }

    }

    //getting the data sent by axios
    $data = (object)json_decode($_POST['data']);
    $files = (object)$_FILES;

    if(!isset($data->id))
    {
         $data->id = null;
    }

    if(!isset($data->type))
    {
         $data->type = null;
    }

    if(!isset($data->inputData))
    {
          $data->inputData = null;
    }

    if(!isset($data->idType))
    {
          $data->idType = null;
    }

    $profile = new Profile($data->id,$data->idType,$data->type,$data->inputData,$files);

    if($data->request === "getProfile")
    {
         $profile->getProfile();
    }
    if($data->request === "getProfileEdit")
    {
         $profile->getProfileEdit($data->jobID);
    }
    if($data->request === "getJobList")
    {
         $profile->getJobList();
    }
    if($data->request === "getApplicationsList")
    {
          $profile->getAppliedJobs();
    }
    if($data->request === "getApplicants")
    {
          $profile->getApplicants();
    }
    if($data->request === "getNotifications")
    {
         $profile->getNotifications();
    }
    if($data->request === "NotificationsSeen")
    {
         $profile->NotificationsSeen();
    }
    if($data->request === "addProfile")
    {
         $profile->add();
    }
    if($data->request === "addApplication")
    {
         $profile->addApplication($data->jobID,$data->companyID);
    }
    if($data->request === "updateProfile")
    {
         $profile->update();
    }
    if($data->request === "deleteCV")
    {
         $profile->deleteCV();
    }
    if($data->request === "disableJob")
    {
         $profile->disableJob();
    }
    if($data->request === "deleteApplication")
    {
         $profile->deleteApplication($data->userprofile);
    }
    if($data->request === "setApplicationStatus")
    {
         $profile->setApplicationStatus($data->userprofile,$data->companyID,$data->status);
    }
    if($data->request === "reActivateJob")
    {
         $profile->reActivateJob();
    }

?>
