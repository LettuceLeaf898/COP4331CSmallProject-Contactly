<?php

	header('Access-Control-Allow-Origin: *');
	header('Access-Control-Allow-Methods: POST');
	header('Access-Control-Allow-Headers: Content-Type');
	
	header('Content-Type: application/json');

	$inData = getRequestInfo();

	$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
	if( $conn->connect_error )
	{
		returnWithError( $conn->connect_error );
	}
	else
	{
		$validSorts = array(
			"firstName" => "FirstName",
			"lastName"  => "LastName",
			"email"     => "Email",
			"phone"     => "Phone",
			"addDate"   => "AddDate"
		);

		$sortBy = isset($validSorts[$inData["sortBy"]]) ? $validSorts[$inData["sortBy"]] : "LastName";

		$stmt = $conn->prepare("SELECT ID, FirstName, LastName, Phone, Email, AddDate FROM Contacts WHERE UserID=? ORDER BY $sortBy ASC");
		$stmt->bind_param("i", $inData["userId"]);
		$stmt->execute();
		$result = $stmt->get_result();

		$contacts = array();
		while( $row = $result->fetch_assoc() )
		{
			$contacts[] = $row;
		}

		if( count($contacts) > 0 )
		{
			returnWithInfo($contacts);
		}
		else
		{
			returnWithError("No contacts found");
		}

		$stmt->close();
		$conn->close();
	}

	function getRequestInfo()
	{
		return json_decode(file_get_contents('php://input'), true);
	}

	function sendResultInfoAsJson( $obj )
	{
		header('Content-Type: application/json');
		echo $obj;
	}

	function returnWithError( $err )
	{
		$retValue = '{"contacts":[],"error":"' . $err . '"}';
		sendResultInfoAsJson( $retValue );
	}

	function returnWithInfo( $contacts )
	{
		$retValue = '{"contacts":' . json_encode($contacts) . ',"error":""}';
		sendResultInfoAsJson( $retValue );
	}

?>