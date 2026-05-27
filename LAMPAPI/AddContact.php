<?php
 
	$inData = getRequestInfo();
 
	$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
	if( $conn->connect_error )
	{
		returnWithError( $conn->connect_error );
	}
	else
	{
		$stmt = $conn->prepare("INSERT INTO Contacts (FirstName, LastName, Phone, Email, UserID) VALUES (?,?,?,?,?)");
		$stmt->bind_param("ssssi", $inData["firstName"], $inData["lastName"], $inData["phone"], $inData["email"], $inData["userId"]);
 
		if( $stmt->execute() )
		{
			returnWithError("");
		}
		else
		{
			returnWithError("Failed to add contact");
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
		header('Content-type: application/json');
		echo $obj;
	}
 
	function returnWithError( $err )
	{
		$retValue = '{"error":"' . $err . '"}';
		sendResultInfoAsJson( $retValue );
	}
 
?>