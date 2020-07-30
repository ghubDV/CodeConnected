<?php
    include 'permissions.php';
    include 'searchAlg.php';
    $data = json_decode(file_get_contents("php://input"),true);

    $searchTerms = null;

    if($data['searchby'] === 'People')
    {
        $searchTerms = (object)array(
            "firstName" => (isset($data['UI']['firstName']) ? ($data['UI']['firstName']) : (null)),
            "lastName" => (isset($data['UI']['lastName']) ? ($data['UI']['lastName']) : (null))
        );
    }
    else if($data['searchby'] === 'Companies')
    {
        $searchTerms = (object)array(
            "companyName" => (isset($data['UI']['companyName']) ? ($data['UI']['companyName']) : (null))
        );
    }
    else
    {
        $searchTerms = (object)array(
            "jobName" => (isset($data['UI']['jobName']) ? ($data['UI']['jobName']) : (null))
        );
    }

    $search = new searchAlg($searchTerms,$data['searchby'],$data['filters']);

    $result = $search->search();

    echo json_encode($result);

    die;
?>