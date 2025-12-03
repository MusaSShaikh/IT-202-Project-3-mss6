<?php
// 10 PTS: LIST NAMES (PHP SCRIPT - embedded)
// This block runs on the server before the page loads to list current users.
include 'connect.php'; 

$nameList = "";
$sql = "SELECT username FROM chat_table";
$result = $con->query($sql);

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $nameList .= $row["username"] . "<br>";
    }
} else {
    $nameList = "No users found in database.";
}
// We close the connection here for the page load query
$con->close();
?>

<!DOCTYPE html>
<html>
<head>
    <title>AJAX Chat Application</title>
    <style>
        body { font-family: sans-serif; padding: 20px; }
        /* Added styling for the name list box */
        .name-list-box { 
            border: 2px solid #007bff; 
            padding: 10px; 
            margin-bottom: 20px; 
            background-color: #e9f7fe;
            width: 400px;
        }
        .box { border: 2px solid #333; padding: 15px; margin-bottom: 20px; width: 400px; background-color: #fcf6e6; }
        label { display: block; margin-top: 10px; font-weight: bold; }
        input, textarea { width: 95%; padding: 5px; }
        .error { color: red; font-weight: bold; margin-top: 5px; }
        .btn-listen { margin-top: 10px; cursor: pointer; padding: 5px 10px; }
    </style>
</head>
<body>

    <div class="name-list-box">
        <h3 style="margin-top:0; color:#0056b3;">CURRENT NAMES IN DATABASE</h3>
        <div>
            <?php echo $nameList; ?>
        </div>
    </div>

    <div class="box">
        <h3>ENTER YOUR NAME / PASSWORD</h3>
        
        <label>Name:</label>
        <input type="text" id="myName" placeholder="e.g. joe">
        
        <label>Password:</label>
        <input type="password" id="myPass" placeholder="e.g. 007">
        
        <label>Message (Transmitted as you type):</label>
        <textarea id="myMessage" rows="4" onkeyup="sendMessage()"></textarea>
        
        <div id="statusMsg" class="error"></div>
    </div>

    <div class="box">
        <h3>ENTER VALID NAME TO LISTEN</h3>
        
        <label>Target Name:</label>
        <input type="text" id="targetName" placeholder="e.g. moe">
        
        <button class="btn-listen" onclick="listenToChat()">LISTEN (Click to fetch)</button>
        
        <label>Chat Retrieved:</label>
        <textarea id="chatResult" rows="4" readonly></textarea>
    </div>

    <script>
        // AJAX 1: Push data to server (Update Entry)
        function sendMessage() {
            const name = document.getElementById('myName').value;
            const pass = document.getElementById('myPass').value;
            const msg  = document.getElementById('myMessage').value;
            const status = document.getElementById('statusMsg');

            // Simple client-side check, but the real check is in PHP
            if(name === "" || pass === "") {
                status.innerText = "Please enter Name and Password.";
                return;
            }

            let formData = new FormData();
            formData.append('name', name);
            formData.append('pass', pass);
            formData.append('msg', msg);

            fetch('push_chat.php', { method: 'POST', body: formData })
            .then(response => response.text())
            .then(data => {
                // The PHP script returns "success" or an error message.
                // If it is NOT "success", we display the warning.
                if(data.trim() !== "success") {
                    status.innerText = data; 
                } else {
                    status.innerText = ""; // Clear warning if successful
                }
            });
        }

        // AJAX 2: Pull data from server (Retrieve Entry)
        function listenToChat() {
            const target = document.getElementById('targetName').value;
            if(target === "") { alert("Enter a name to listen to."); return; }

            fetch('pull_chat.php?name=' + encodeURIComponent(target))
            .then(response => response.text())
            .then(data => {
                document.getElementById('chatResult').value = data;
            });
        }
    </script>
</body>
</html>