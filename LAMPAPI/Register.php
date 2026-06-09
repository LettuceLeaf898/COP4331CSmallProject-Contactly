
<?php
 
	$inData = getRequestInfo();
 
	$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
	if( $conn->connect_error )
	{
		returnWithError( $conn->connect_error );
	}
	else
	{
		$stmt = $conn->prepare("SELECT ID FROM Users WHERE Login=?");
		$stmt->bind_param("s", $inData["login"]);
		$stmt->execute();
		$result = $stmt->get_result();
 
		if( $result->fetch_assoc() )
		{
			returnWithError("Login already taken");
		}
		else
		{
			$stmt = $conn->prepare("INSERT INTO Users (FirstName, LastName, Login, Password, Email, PhoneNumber) VALUES (?,?,?,?,?,?)");
			$stmt->bind_param("ssssss", $inData["firstName"], $inData["lastName"], $inData["login"], $inData["password"], $inData["email"], $inData["phone"]);
 
			if( $stmt->execute() )
			{
				returnWithError("");
			}
			else
			{
				returnWithError("Registration failed");
			}
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