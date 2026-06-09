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
		// First check if user exists
		$stmt = $conn->prepare("SELECT ID FROM Users WHERE ID=?");
		$stmt->bind_param("i", $inData["userId"]);
		$stmt->execute();
		if( !$stmt->get_result()->fetch_assoc() )
		{
			returnWithError("User not found");
			exit;
		}
 
		// Delete user's contacts first
		$stmt = $conn->prepare("DELETE FROM Contacts WHERE UserID=?");
		$stmt->bind_param("i", $inData["userId"]);
		$stmt->execute();
 
		// Delete the user
		$stmt = $conn->prepare("DELETE FROM Users WHERE ID=?");
		$stmt->bind_param("i", $inData["userId"]);
 
		if( $stmt->execute() )
		{
			returnWithError("");
		}
		else
		{
			returnWithError("Failed to delete user: " . $stmt->error);
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
		$retValue = '{"error":"' . $err . '"}';
		sendResultInfoAsJson( $retValue );
	}
 
?>