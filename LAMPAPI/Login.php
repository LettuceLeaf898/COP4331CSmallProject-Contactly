<?php

	$inData = getRequestInfo();
	
	$id = 0;
	$firstName = "";
	$lastName = "";
	$login = "";
	$email = "";
	$phoneNumber = "";
	$creationDate = "";
	$password = "";

	$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331"); 	
	if( $conn->connect_error )
	{
		returnWithError( $conn->connect_error );
	}
	else
	{
		$stmt = $conn->prepare("SELECT ID,FirstName,LastName,Login,Email,PhoneNumber,CreationDate,Password FROM Users WHERE Login=? AND Password =?");
		$stmt->bind_param("ss", $inData["login"], $inData["password"]);
		$stmt->execute();
		$result = $stmt->get_result();

		if( $row = $result->fetch_assoc()  )
		{
			returnWithInfo( $row['FirstName'], $row['LastName'], $row['ID'], $row['Login'], $row['Email'], $row['PhoneNumber'], $row['CreationDate'], $row['Password'] );
		}
		else
		{
			returnWithError("No Records Found");
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
		$retValue = '{"id":0,"firstName":"","lastName":"","login":"","email":"","phoneNumber":"","creationDate":"","password":"","error":"' . $err . '"}';
		sendResultInfoAsJson( $retValue );
	}
	
	function returnWithInfo( $firstName, $lastName, $id, $login, $email, $phoneNumber, $creationDate, $password )
	{
		$retValue = '{"id":' . $id . ',"firstName":"' . $firstName . '","lastName":"' . $lastName . '","login":"' . $login . '","email":"' . $email . '","phoneNumber":"' . $phoneNumber . '","creationDate":"' . $creationDate . '","password":"' . $password . '","error":""}';
		sendResultInfoAsJson( $retValue );
	}
	
?>