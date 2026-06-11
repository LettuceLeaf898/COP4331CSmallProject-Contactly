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
 
		$stmt = $conn->prepare("INSERT INTO Contacts (FirstName, LastName, Phone, Email, UserID) VALUES (?,?,?,?,?)");
		$stmt->bind_param("ssssi", $inData["firstName"], $inData["lastName"], $phone, $inData["email"], $inData["userId"]);
 
		if( $stmt->execute() )
		{
			returnWithError("");
		}
		else
		{
			returnWithError("Failed to add contact: " . $stmt->error);
		}
 
		$stmt->close();
		$conn->close();
	}
 
	function formatPhone( $phone )
	{
		try
		{
			$phoneUtil = PhoneNumberUtil::getInstance();
			$parsed    = $phoneUtil->parse($phone, "US");
 
			if( $phoneUtil->isValidNumber($parsed) )
			{
				$region = $phoneUtil->getRegionCodeForNumber($parsed);
 
				if( $region === "US" )
				{
					// Manually format US numbers as (###) ###-####
					$digits = preg_replace('/[^0-9]/', '', $phone);
					// Strip leading 1 if 11 digits
					if( strlen($digits) == 11 && $digits[0] == '1' )
					{
						$digits = substr($digits, 1);
					}
					return '(' . substr($digits, 0, 3) . ') ' . substr($digits, 3, 3) . '-' . substr($digits, 6, 4);
				}
				else
				{
					return $phoneUtil->format($parsed, PhoneNumberFormat::INTERNATIONAL);
				}
			}
			else
			{
				return preg_replace('/[^0-9+]/', '', $phone);
			}
		}
		catch( Exception $e )
		{
			return preg_replace('/[^0-9+]/', '', $phone);
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
    sendResultInfoAsJson( json_encode(["error" => $err]) );
}
?>