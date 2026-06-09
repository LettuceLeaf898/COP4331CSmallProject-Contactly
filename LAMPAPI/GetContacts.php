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
		$page    = isset($inData["page"]) ? (int)$inData["page"] : 1;
		$limit   = 15;
		$offset  = ($page - 1) * $limit;

		// Get total count
		$stmt = $conn->prepare("SELECT COUNT(*) as total FROM Contacts WHERE UserID=?");
		$stmt->bind_param("i", $inData["userId"]);
		$stmt->execute();
		$total = $stmt->get_result()->fetch_assoc()['total'];
		$totalPages = ceil($total / $limit);

		// Get contacts for this page
		$stmt = $conn->prepare("SELECT ID, FirstName, LastName, Phone, Email, AddDate FROM Contacts WHERE UserID=? ORDER BY LastName, FirstName LIMIT ? OFFSET ?");
		$stmt->bind_param("iii", $inData["userId"], $limit, $offset);
		$stmt->execute();
		$result = $stmt->get_result();

		$contacts = array();
		while( $row = $result->fetch_assoc() )
		{
			$contacts[] = $row;
		}

		if( count($contacts) > 0 )
		{
			returnWithInfo($contacts, $page, $totalPages, $total);
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
		$retValue = '{"contacts":[],"page":0,"totalPages":0,"total":0,"error":"' . $err . '"}';
		sendResultInfoAsJson( $retValue );
	}

	function returnWithInfo( $contacts, $page, $totalPages, $total )
	{
		$retValue = '{"contacts":' . json_encode($contacts) . ',"page":' . $page . ',"totalPages":' . $totalPages . ',"total":' . $total . ',"error":""}';
		sendResultInfoAsJson( $retValue );
	}

?>