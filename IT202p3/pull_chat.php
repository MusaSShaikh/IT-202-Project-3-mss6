<?php
include 'connect.php';

$targetName = $_GET['name'] ?? '';

// Select content for specific user
$stmt = $con->prepare("SELECT chat_content FROM chat_table WHERE username = ?");
$stmt->bind_param("s", $targetName);
$stmt->execute();
$stmt->bind_result($content);

if ($stmt->fetch()) {
    echo $content;
} else {
    echo "User not found or no messages.";
}

$stmt->close();
$con->close();
?>