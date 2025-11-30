<?php
// connect.php must NOT echo anything
$servername = "sql1.njit.edu";
$username = "mss6";                // Your UCID
$password = "IT202_password";      // Your MySQL password
$dbname = "mss6";                  // Your DB name

$con = mysqli_connect($servername, $username, $password, $dbname);
if (mysqli_connect_errno()) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['success' => false, 'message' => 'DB connect failed']);
    exit;
}
// no outputs ever imo
