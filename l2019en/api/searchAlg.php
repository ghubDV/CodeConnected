<?php
    include 'permissions.php';
    include 'dbclass.php';
    include 'reusableFunctions.php';


    class searchAlg
    {
        public $db;
        public $search_result;
        public $keyword;
        public $searchby;
        public $filters;

        //count for the INTERVAL MySQL statement
        public $fDPCount;

        function __construct($key,$searchby,$fltr)
        {
            $this->keyword = $key;
            $this->searchby = $searchby;
            $this->filters = $this->partition_filters($fltr);
            $this->search_result = array();
            $this->db = new dbclass();
        }

        function partition_filters($fltrs)
        {
            $date_posted = $programming_language = $experience_level = $country = $state = $city = array();
            

            foreach($fltrs as $filter)
            {
                if($filter["type"] === "experienceLevel")
                {
                    array_push($experience_level, $filter);
                }

                if($filter["type"] === "country")
                {
                    $filter["type"] = "jobdata.country";
                    array_push($country, $filter);
                }

                if($filter["type"] === "state")
                {
                    $filter["type"] = "jobdata.state";
                    array_push($state, $filter);
                }

                if($filter["type"] === "city")
                {
                    $filter["type"] = "jobdata.city";
                    array_push($city, $filter);
                }

                if($filter["type"] === "datePosted")
                {
                    //preparing the date to use in the mysql statement
                    switch($filter["name"])
                    {
                        case "Last Day": 
                            $filter["name"] = "1 DAY";
                            $this->fDPCount = 1;
                            break;
                        
                        case "Last Week": 
                            $filter["name"] = "1 WEEK";
                            $this->fDPCount = 1;
                            break;

                        case "Last Month": 
                            $filter["name"] = "1 MONTH";
                            $this->fDPCount = 1;
                            break;
                        
                        case "Last 6 Months": 
                            $filter["name"] = "6 MONTH";
                            $this->fDPCount = 6;
                            break;

                        case "Last Year": 
                            $filter["name"] = "1 YEAR";
                            $this->fDPCount = 1;
                            break;

                    }
                    array_push($date_posted, $filter);
                }
            }

            return array_filter(array($experience_level,$programming_language,$date_posted,$country,$state,$city));
        }

        //storing search results into the target object
        function fetch_rows($result)
        {
            $fetch_res = array();
            foreach($result as $key => $row)
            {

                if($this->searchby === 'People')
                {
                    $avatar = encode_file_to_axios($row['avatar'],'user','avatar');
                    $line = (object)array("id" => $row['userprofile_id'],
                                          "type" => "user",
                                          "first_name" => $row['first_name'],
                                          "last_name" => $row['last_name'],
                                          "profession" => $row['profession'],
                                          "avatar" => $avatar,
                                          "country" => $row['country'],
                                          "state" => $row['state'],
                                          "city" => $row['city']
                                         );
                }
                else if($this->searchby === 'Companies')
                {
                    $avatar = encode_file_to_axios($row['avatar'],'company','avatar');
                    $line = (object)array("id" => $row['companyprofile_id'],
                                          "type" => "company",
                                          "companyName" => $row['companyName'],
                                          "workDomain" => $row['workDomain'],
                                          "avatar" => $avatar,
                                          "country" => $row['country'],
                                          "state" => $row['state'],
                                          "city" => $row['city']
                                         );
                }
                else
                {
                    $avatar = encode_file_to_axios($row['avatar'],'company','avatar');
                    $line = (object)array("id" => $row['job_id'],
                                          "type" => "job",
                                          "jobName" => $row['jobName'],
                                          "companyName" => $row['companyName'],
                                          "jobDescription" => $row['jobDescription'],
                                          "experienceLevel" => $row["experienceLevel"],
                                          "datePosted" => $row["datePosted"],
                                          "avatar" => $avatar,
                                          "country" => $row['country'],
                                          "state" => $row['state'],
                                          "city" => $row['city'],
                                         );
                }

                array_push($this->search_result, $line);
            }
        }

        function getSearchResult($query,$keyword)
        {
            $response = $this->db->run_query($query,$keyword);
            $affectedRows = $response['affectedRows'];
            $result = $response['result'];

            if($affectedRows > 0)
            {
                $this->fetch_rows($result);
            }       
        }

        //creating the filter part of the search query
        function filterQuery()
        {

             //filter query
             $qf = "";
            
             //parameters for the query
             $params = array();

             foreach($this->filters as $keyFilter => $filter)
             {
                 $qf.="(";

                 foreach($filter as $keyItem => $f_item)
                 {
                     //making a different condition for the date
                     if($f_item["type"] === "datePosted")
                     {
                         //assigning time measure to the query
                         if(strpos($f_item["name"],"DAY"))
                         {
                            $qf.= "datePosted > DATE_SUB(CURDATE(),INTERVAL ? DAY)"; 
                         }
                         else if(strpos($f_item["name"],"WEEK"))
                         {
                            $qf.= "datePosted > DATE_SUB(CURDATE(),INTERVAL ? WEEK)";
                         }
                         else if(strpos($f_item["name"],"MONTH"))
                         {
                            $qf.= "datePosted > DATE_SUB(CURDATE(),INTERVAL ? MONTH)";
                         }
                         else if(strpos($f_item["name"],"YEAR"))
                         {
                            $qf.= "datePosted > DATE_SUB(CURDATE(),INTERVAL ? YEAR)";
                         }

                         //transforming into int for the INTERVAL duration
                         $f_item["name"] = $this->fDPCount;
                     }

                     //last filter item in the list case
                     else if(array_key_last($filter) === $keyItem)
                     {
                         $qf.=$f_item["type"]." = ?";
                     }
                     else
                     {
                         $qf.=$f_item["type"]." = ? OR ";
                     }

                     array_push($params,$f_item["name"]);
                 }

                 //last type of filter in the list
                 if(array_key_last($this->filters) === $keyFilter)
                 {
                     $qf.=")";
                 }
                 else
                 {
                     $qf.=") AND ";
                 }
             }

             //outputting the filter query + parameter array for the bind in the prepared statement
             return $result = array("qf" => $qf,"params" => $params);
        }


        //trying another search which breaks up the keyword in case the default one gives no results
        function search_deep($filter_part)
        {
            $params = array();
            $keyword='';
            $subQuery = '';
            $fullQuery = '';
            $filterQuery = '';
            $subQueryJobMatchAll = $subQueryJobMatchOne = $subQueryJobMatchCompany = '';

            if($this->searchby === "People")
            { 
                $q = "SELECT * 
                      FROM (SELECT *, CONCAT(first_name,' ',last_name) AS full_name FROM userdata) AS t
                      WHERE "; 
                $keyword = ($this->keyword->firstName.' '.$this->keyword->lastName);             
            }
            else if($this->searchby === "Companies")
            {
                $q = "SELECT * 
                      FROM companydata
                      WHERE ";
                $keyword = $this->keyword->companyName;
            }
            else
            {
                $subQuery = "SELECT companydata.avatar, companydata.companyName,
                                    jobdata.job_id, jobdata.jobName, jobdata.experienceLevel, 
                                    jobdata.datePosted, jobdata.jobDescription,
                                    jobdata.country as country,jobdata.state as state,jobdata.city as city, jobdata.status as status
                      FROM jobdata
                      INNER JOIN companydata on(companydata.companyprofile_id = jobdata.companyprofile_id)
                      WHERE (";
                $keyword = $this->keyword->jobName;
            }
            
            $bind = ':key';
            $split_pattern = '/[\s\d,;.\/\\|:{}\[\]\+\=\(\)\*&\^%\$#@!~`<>?]+/';
            
            //if the keyword has no delimiters return
            if(preg_match($split_pattern,$keyword) === 0)
            {
                if($this->searchby === 'People')
                {
                    $q.='t.full_name REGEXP ?';
                    array_push($params,$keyword);
                }
                else if($this->searchby === "Companies")
                {
                    $q.='companyName REGEXP ?';
                    array_push($params,$keyword);
                }
                else
                {
                    $subQuery.='( jobName REGEXP ?  OR companyName REGEXP ?)) AND status = "active"';

                    array_push($params,$keyword,$keyword,$keyword);
                }

            }
            else
            {
                //construct search query with the split keyword
                $split_key = preg_split($split_pattern,$keyword, -1, PREG_SPLIT_NO_EMPTY);
                $params = $split_key;
                $fullQuery = 'SELECT * FROM (  ) as t
                              WHERE ';

                foreach($split_key as $key => $word)
                {

                    if($this->searchby === 'People')
                    {
                        if($key === array_key_last($split_key))
                        {
                            $q.= 't.full_name REGEXP ?';
                        }
                        else
                        {
                            $q.= 't.full_name REGEXP ? AND ';
                        }
                    }
                    else if($this->searchby === "Companies")
                    {
                        if($key === array_key_last($split_key))
                        {
                            $q.= 'companyName REGEXP ?';
                        }
                        else
                        {
                            $q.= 'companyName REGEXP ? AND ';
                        }
                    }
                    else
                    {
                        if($key === array_key_last($split_key))
                        {
                            $subQueryJobMatchAll .= 'jobName REGEXP ? ) AND status = "active"';
                            $subQueryJobMatchOne .= 'jobName REGEXP ? ) AND status = "active"';
                            $subQueryJobMatchCompany .= 'companyName REGEXP ? ) AND status = "active"';
                            $fullQuery .= 't.companyName REGEXP ?';

                        }
                        else
                        {
                            $subQueryJobMatchAll.= 'jobName REGEXP ? AND ';
                            $subQueryJobMatchOne.= 'jobName REGEXP ? OR ';
                            $subQueryJobMatchCompany.= 'companyName REGEXP ? OR ';
                            $fullQuery .= 't.companyName REGEXP ? OR ';
                        }
                        
                        array_splice($params,$key,0,$word);
                    }
                }

            }

            if($this->searchby === 'Jobs')
            {
                list($part1, $part2) = array_chunk($params, ceil(count($params) / 2));
            }

            //checking if filters were applied
            if(!empty($filter_part["qf"]))
            {
                $filterQuery.=" AND ".$filter_part["qf"];
                array_push($params, ...$filter_part["params"]);
                array_push($part1, ...$filter_part["params"]);
            }

            if($this->searchby === 'Jobs')
            {
                //case with no delimiters
                if($subQueryJobMatchAll === '' || $subQueryJobMatchOne === '' || $subQueryJobMatchCompany === '')
                {

                    $tempQuery = $subQuery.$filterQuery;
                    $this->getSearchResult($tempQuery,$part1);

                    if(!empty($this->search_result))
                    {
                        $tempResult = $this->search_result;

                        $this->search_result = array();

                        $fullQuery = 'SELECT *
                                      FROM ( '.$tempQuery.' ) as t
                                      WHERE t.companyName REGEXP ?';

                        $this->getSearchResult($fullQuery,$params);

                        if(empty($this->search_result))
                        {
                            $this->search_result = $tempResult;
                        }

                        return;
                    }
                }

                //case with delimiters
                else
                {
                    //search job by matching every word from user
                    $tempQuery = $subQuery.$subQueryJobMatchAll.$filterQuery;

                    $this->getSearchResult($tempQuery,$part1);

                    if(!empty($this->search_result))
                    {
                        $tempResult = $this->search_result;

                        $this->search_result = array();

                        $fullQuery = substr_replace( $fullQuery, $tempQuery, 15, 0 );

                        $this->getSearchResult($fullQuery,$params);

                        if(empty($this->search_result))
                        {
                            $this->search_result = $tempResult;
                        }

                        return;
                    }
                    
                    //search job by matching only one of the words from user
                    $tempQuery = $subQuery.$subQueryJobMatchOne.$filterQuery;

                    $this->getSearchResult($tempQuery,$part1);

                    if(!empty($this->search_result))
                    {
                        $tempResult = $this->search_result;

                        $this->search_result = array();

                        $fullQuery = substr_replace( $fullQuery, $tempQuery, 15, 0 );

                        $this->getSearchResult($fullQuery,$params);

                        if(empty($this->search_result))
                        {
                            $this->search_result = $tempResult;
                        }

                        return;
                    }

                    //search job only by company
                    $tempQuery = $subQuery.$subQueryJobMatchCompany.$filterQuery;

                    //echo json_encode((object)array($tempQuery,$params));

                    $this->getSearchResult($tempQuery,$part1);

                    return;           
                }
                
            }
            else
            {
                $this->getSearchResult($q,$params);
            }

        }

        function query_constructor($q,$params,$filter_part)
        {
            //query that'll be returned
            $mainq = "";

            if($this->searchby === 'People')
            {
                $mainq = "SELECT * 
                          FROM userdata".$q
                          ."ORDER BY first_name,last_name ASC";
            }
            else if($this->searchby === 'Companies')
            {
                $mainq = "SELECT * 
                          FROM companydata".$q
                          ."ORDER BY companyName ASC";
            }
            else
            {
                $mainq = "SELECT companydata.avatar, companydata.companyName,
                                    jobdata.job_id, jobdata.jobName, jobdata.experienceLevel, 
                                    jobdata.datePosted, jobdata.jobDescription,
                                    jobdata.country as country,jobdata.state as state,jobdata.city as city, jobdata.status as status
                            FROM jobdata
                            INNER JOIN companydata on(companydata.companyprofile_id = jobdata.companyprofile_id)
                            WHERE (".$q;

                    //checking if filters were applied
                    if(!empty($this->filters))
                    {
                        //getting the filter query + the updated params array
                        $filter_part = $this->filterQuery();
    
                        //concat main query to the filter query
                        $mainq.=" AND ".$filter_part["qf"];
    
                        //updating params list
                        array_push($params,...$filter_part["params"]);
                    }      
            }

            //results if the keyword is found in any position
            $this->getSearchResult($mainq,$params);
        }

        function search()
        {
            //search query
            $search_query = " WHERE";

            //params array for the prepared statement
            $params=array();
            $filter_part = $this->filterQuery();

            if($this->searchby === 'People')
            {
                if($this->keyword->firstName !== '')
                {
                    $search_query .= " first_name = ? AND";
                    array_push($params,$this->keyword->firstName);
                }

                if($this->keyword->lastName !== '')
                {
                    $search_query .= " last_name = ? AND";
                    array_push($params,$this->keyword->lastName);
                }

            }
            else if($this->searchby === 'Companies')
            {
                if($this->keyword->companyName !== '')
                {
                    $search_query .= " companyName = ? AND";
                    array_push($params,$this->keyword->companyName);
                }
            }
            else
            {
                if($this->keyword->jobName !== '')
                {
                    $search_query .= " jobName = ? AND status = 'active' AND";
                    array_push($params,$this->keyword->jobName);
                }
            }

            $search_query = substr($search_query,0,-3);
            $this->query_constructor($search_query,$params,$filter_part);


            if(!empty($this->search_result))
            {
                return $this->search_result;
            }

            //search deep
            else
            {
                $this->search_deep($filter_part);
                return $this->search_result;
            }            
        }
    }
?>