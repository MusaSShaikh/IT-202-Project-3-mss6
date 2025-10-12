// 'database' lol
const caterers = [
    { fname: "<Musa", lname: "Shaikh", idnum: "2468", email: "musa@cc.com", phone: "555-555-5555 ext 555", password: "$AR1a"},
    { fname: "Prof", lname: "Dee", idnum: "1357", email: "dee@cc.com", phone: "555-123-4567 ext 111", password: "$FK2b"},
    { fname: "Zayd", lname: "Hussain", idnum: "9876", email: "zayd@cc.com", phone: "555-444-8888 ext 999", password: "$ZH3c"},
    { fname: "Layla", lname: "Ahmed", idnum: "4820", email: "layla@cc.com", phone: "555-678-9012 ext 222", password: "$LA4d"},
    { fname: "omar", lname: "saeed", idnum: "7319", email: "omar@cc.com", phone: "555-333-4444 ext 333", password: '$OS5e'},
];


// pwd thingy toggle
document.addEventListener("DOMContentLoaded", () => {
    const togglePwd = document.getElementById('togglePwd');
    const passwordInput = document.getElementById('password');

    togglePwd.addEventListener("click", () => {
        const type = passwordInput.type === "password" ? "text" : "password";
        passwordInput.type = type;
    });
});

function validate() {
    const fname = document.getElementById("fname");
    const lname = document.getElementById("lname");
    const password = document.getElementById("password");
    const idnum = document.getElementById("idnum");
    const phone = document.getElementById("phone");
    const email = document.getElementById("email");
    const confirmEmail = document.getElementById("confirmEmail");
    const transaction = document.getElementById("transaction").value;

    // rexeg
    const nameRegex = /^[A-Za-z]+$/;
    const idRegex = /^\d{4}$/;
    const phoneRegex = /^(\d{3}[- ]\d{3}[- ]\d{4})( ext \d+)?$/;

    const emailRegex = /^[\w.-]+@[A-Za-z]+\.[A-Za-z]{1,3}$/;
    const passRegex = /^[^A-Za-z0-9](?=.*[A-Z])(?=.*\d)[A-Za-z0-9@#$%^&*!]{1,4}$/;


    if (!fname.value.match(nameRegex)) {
        alert("Enter a valid first name.");
        fname.focus();
        return false;
    }
    if (!lname.value.match(nameRegex)) {
        alert('Enter a valid last name.');
        lname.focus();
        return false;
    }
    if (!password.value.match(passRegex)) {
        alert("Password must start with a special character, include an uppercase letter, a number, and be max 5 chars.");
        password.focus();
        return false;
    }
    if (!idnum.value.match(idRegex)) {
        alert("Caterer ID must be exactly 4 digits.");
        idnum.focus();
        return false;
    }
    if (!phone.value.match(phoneRegex)) {
        alert("Phone number must be in format 555-555-5555 ext 555.");
        phone.focus();
        return false;
    }
    if (confirmEmail.checked && !email.value.match(emailRegex)) {
        alert("Please enter a valid email address.");
        email.focus();
        return false;
    }

    verify(fname.value, lname.value, idnum.value, email.value, phone.value, password.value, transaction);
    return false;
}

function verify(fname, lname, idnum, email, phone, password, transaction) {
    const found = caterers.find(c =>
        //make htem lowercase it keeps breakung
        c.fname.toLowerCase() === fname.toLowerCase() &&
        c.lname.toLowerCase() === lname.toLowerCase() &&
        c.idnum === idnum &&
        c.email.toLowerCase() === email.toLowerCase() &&
        c.phone.toLowerCase() === phone.toLowerCase() &&
        c.password === password
    );

    if (found) {
        alert('Welcome' + `${fname} ${lname}` + ', you have entered the system. Transaction: ${transaction}.');
    } else {
        alert(`${fname} ${lname}` + ' cannot be found');
    }
}

function resetForm() {
    document.getElementById("catererForm").reset();
}
