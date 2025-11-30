<!DOCTYPE html>
<html>
<head>
    <title>AJAX Chat</title>
    <style>
        body { font-family: sans-serif; padding: 20px; }
        .box { border: 2px solid #333; padding: 15px; margin-bottom: 20px; width: 400px; }
        label { display: block; margin-top: 10px; font-weight: bold; }
        input, textarea { width: 95%; padding: 5px; }
        .error { color: red; font-weight: bold; }
        .btn-listen { margin-top: 10px; cursor: pointer; background: #ddd; padding: 5px; }
    </style>
</head>
<body>

    <div class="box" style="background-color: #fcf6e6;">
        <h3>ENTER YOUR NAME / PASSWORD</h3>
        
        <label>Name:</label>
        <input type="text" id="myName" placeholder="e.g. joe">
        
        <label>Password:</label>
        <input type="password" id="myPass" placeholder="e.g. 007">
        
        <label>Message (Transmitted as you type):</label>
        <textarea id="myMessage" rows="4" onkeyup="sendMessage()"></textarea>
        
        <div id="statusMsg" class="error"></div>
    </div>

    <div class="box" style="background-color: #fcf6e6;">
        <h3>ENTER VALID NAME TO LISTEN</h3>
        
        <label>Target Name:</label>
        <input type="text" id="targetName" placeholder="e.g. moe">
        
        <button class="btn-listen" onclick="listenToChat()">LISTEN (Click to fetch)</button>
        
        <label>Chat Retrieved:</label>
        <textarea id="chatResult" rows="4" readonly></textarea>
    </div>

    <script>
        // AJAX FUNCTION 1: PUSH (Send Data)
        function sendMessage() {
            const name = document.getElementById('myName').value;
            const pass = document.getElementById('myPass').value;
            const msg  = document.getElementById('myMessage').value;
            const status = document.getElementById('statusMsg');

            if(name === "" || pass === "") {
                status.innerText = "Please enter Name and Password.";
                return;
            }

            // Create form data to send
            let formData = new FormData();
            formData.append('name', name);
            formData.append('pass', pass);
            formData.append('msg', msg);

            // Fetch API (AJAX)
            fetch('push_chat.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.text())
            .then(data => {
                // If the PHP script returns anything other than "success", show it as error
                if(data.trim() !== "success") {
                    status.innerText = data; 
                } else {
                    status.innerText = ""; // Clear error if success
                }
            });
        }

        // AJAX FUNCTION 2: PULL (Get Data)
        function listenToChat() {
            const target = document.getElementById('targetName').value;
            
            if(target === "") {
                alert("Please enter a name to listen to.");
                return;
            }

            fetch('pull_chat.php?name=' + encodeURIComponent(target))
            .then(response => response.text())
            .then(data => {
                document.getElementById('chatResult').value = data;
            });
        }
    </script>

</body>
</html>