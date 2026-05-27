Searchcontacts · PHP
<?php
 
	$inData = getRequestInfo();
 
	$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
	if( $conn->connect_error )
	{
		returnWithError( $conn->connect_error );
	}
	else
	{
		$search = "%" . $inData["search"] . "%";
 
		$stmt = $conn->prepare("SELECT ID, FirstName, LastName, Phone, Email, AddDate FROM Contacts WHERE UserID=? AND (FirstName LIKE ? OR LastName LIKE ? OR Phone LIKE ? OR Email LIKE ?)");
		$stmt->bind_param("issss", $inData["userId"], $search, $search, $search, $search);
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
		header('Content-type: application/json');
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