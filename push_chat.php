<?php
include 'connect.php';

// Get POST data
$name = $_POST['name'] ?? '';
$pass = $_POST['pass'] ?? '';
$msg  = $_POST['msg'] ?? '';

// 1. Check if user exists with correct password using Prepared Statements
$stmt = $con->prepare("SELECT username FROM chat_table WHERE username = ? AND password = ?");
$stmt->bind_param("ss", $name, $pass); // "ss" means string, string
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows > 0) {
    // 2. Credentials valid, perform UPDATE
    $updateStmt = $con->prepare("UPDATE chat_table SET chat_content = ? WHERE username = ?");
    $updateStmt->bind_param("ss", $msg, $name);
    
    if($updateStmt->execute()){
        echo "success";
    } else {
        echo "Error updating record.";
    }
    $updateStmt->close();
} else {
    echo "Error: Invalid Name or Password.";
}

$stmt->close();
$con->close();
?>