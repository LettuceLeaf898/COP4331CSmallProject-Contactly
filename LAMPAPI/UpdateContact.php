<?php

	header('Access-Control-Allow-Origin: *');
	header('Access-Control-Allow-Methods: POST');
	header('Access-Control-Allow-Headers: Content-Type');	

	header('Content-Type: application/json');
 
	require_once 'vendor/autoload.php';
 
	use libphonenumber\PhoneNumberUtil;
	use libphonenumber\PhoneNumberFormat;
 
	$inData = getRequestInfo();
 
	$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
	if( $conn->connect_error )
	{
		returnWithError( $conn->connect_error );
	}
	else
	{
		$phone = formatPhone($inData["phone"]);
 
		$stmt = $conn->prepare("UPDATE Contacts SET FirstName=?, LastName=?, Phone=?, Email=? WHERE ID=? AND UserID=?");
		$stmt->bind_param("ssssii", $inData["firstName"], $inData["lastName"], $phone, $inData["email"], $inData["contactId"], $inData["userId"]);
		$stmt->execute();
 
		if( $stmt->affected_rows > 0 )
		{
			returnWithError("");
		}
		else
		{
			returnWithError("Contact not found");
		}
 
		$stmt->close();
		$conn->close();
	}
 
	function formatPhone( $phone )
	{
		$digits = preg_replace('/[^0-9]/', '', $phone);
		$isInternational = substr(trim($phone), 0, 1) === '+';
 
		if( $isInternational )
		{
			$countryCode = substr($digits, 0, strlen($digits) - 10);
			$localDigits = substr($digits, -10);
 
			if( $countryCode === '1' )
			{
				return '(' . substr($localDigits, 0, 3) . ') ' . substr($localDigits, 3, 3) . '-' . substr($localDigits, 6, 4);
			}
			else
			{
				try
				{
					$phoneUtil = PhoneNumberUtil::getInstance();
					$parsed    = $phoneUtil->parse($phone, null);
					if( $phoneUtil->isValidNumber($parsed) )
					{
						return $phoneUtil->format($parsed, PhoneNumberFormat::INTERNATIONAL);
					}
				}
				catch( Exception $e ) {}
 
				return '+' . $digits;
			}
		}
		else
		{
			if( strlen($digits) == 11 && $digits[0] == '1' )
			{
				$digits = substr($digits, 1);
			}
 
			if( strlen($digits) == 10 )
			{
				return '(' . substr($digits, 0, 3) . ') ' . substr($digits, 3, 3) . '-' . substr($digits, 6, 4);
			}
 
			return $digits;
		}
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