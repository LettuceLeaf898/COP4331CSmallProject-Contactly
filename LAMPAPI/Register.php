<?php
 
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
		// Check duplicate login
		$stmt = $conn->prepare("SELECT ID FROM Users WHERE Login=?");
		$stmt->bind_param("s", $inData["login"]);
		$stmt->execute();
		if( $stmt->get_result()->fetch_assoc() )
		{
			returnWithError("Login already taken");
			exit;
		}
 
		// Check duplicate email
		$stmt = $conn->prepare("SELECT ID FROM Users WHERE Email=?");
		$stmt->bind_param("s", $inData["email"]);
		$stmt->execute();
		if( $stmt->get_result()->fetch_assoc() )
		{
			returnWithError("Email already registered");
			exit;
		}
 
		// Check duplicate phone
		$phone = formatPhone($inData["phone"]);
		$stmt = $conn->prepare("SELECT ID FROM Users WHERE PhoneNumber=?");
		$stmt->bind_param("s", $phone);
		$stmt->execute();
		if( $stmt->get_result()->fetch_assoc() )
		{
			returnWithError("Phone number already registered");
			exit;
		}
 
		// Insert user
		$stmt = $conn->prepare("INSERT INTO Users (FirstName, LastName, Login, Password, Email, PhoneNumber) VALUES (?,?,?,?,?,?)");
		$stmt->bind_param("ssssss", $inData["firstName"], $inData["lastName"], $inData["login"], $inData["password"], $inData["email"], $phone);
 
		if( $stmt->execute() )
		{
			returnWithError("");
		}
		else
		{
			returnWithError("Registration failed");
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