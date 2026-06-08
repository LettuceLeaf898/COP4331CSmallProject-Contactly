<?php

	header('Content-Type: application/json');

	$inData = getRequestInfo();

	$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
	if( $conn->connect_error )
	{
		returnWithError( $conn->connect_error );
	}
	else
	{
		$stmt = $conn->prepare("DELETE FROM Contacts WHERE UserID=?");
		$stmt->bind_param("i", $inData["userId"]);
		$stmt->execute();

		$stmt = $conn->prepare("DELETE FROM Users WHERE ID=?");
		$stmt->bind_param("i", $inData["userId"]);
		$stmt->execute();

		if( $stmt->affected_rows > 0 )
		{
			returnWithError("");
		}
		else
		{
			returnWithError("User not found");
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