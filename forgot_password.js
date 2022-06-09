const firebase = require("firebase");
require("firebase/firestore");
const sgMail = require('@sendgrid/mail');
var rs = require("randomstring");

// checks for internet connectivity
checkInternet();

firebase.initializeApp({
    apiKey: "AIzaSyABnfvM1-gzhWs5EvXzIQCEJtOqiArU3No",
    authDomain: "tfds-e2248.firebaseapp.com",
    projectId: "tfds-e2248"
});

// sendgrid api key
sgMail.setApiKey("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");


var db = firebase.firestore();
var un = "";
let temporary_pwd = "";

// enables password setting UI
function setPwd() {
    un = document.getElementById("signupuser").value;
    document.getElementById("autheduser").innerHTML = un;
    document.getElementById("settingpsw").style.display = "block";
    document.getElementById("signupuser").style.display = "none";
    document.getElementById("temp_setup").style.display = "none";
    document.getElementById("spswbtn").style.display = "block";
}

// checks if temporary password matches with the password entered by the user
function check_temp_pwd() {
    var temp_input = document.getElementById("temp_pwd").value;
    if (temp_input == temporary_pwd) {
        setPwd();
    } else {
        document.getElementById('temp_text').style.color = "red";
        document.getElementById('temp_text').innerHTML = "\nInvalid password";
    }
}

// takes mailid as input from user, generates a random password and sends the user a mail.
function enter_temp() {
    var mailid = document.getElementById("signupuser").value;
    console.log(mailid)
    db.collection("thanos-users").where("username", "==", mailid).get()
        .then(function (querySnapshot) {
            if (querySnapshot.empty == true) {
                console.log("Nobody with that username");
                alert("Username not registered with Thanos!")
                window.location.reload();
            } else {
                temporary_pwd = rs.generate(8);
                console.log(temporary_pwd);
                const msg = {
                    to: mailid,
                    from: 'Thanos@thanos.in',
                    subject: 'Reset Password Request',
                    html: '<p style="font-size:medium;">We have received a request to reset your password. Your temporary password is: <strong>' + temporary_pwd + '</strong></p><br/><hr/><p style="font-size:xx-small;">This is an auto-generated e-mail. DO NOT reply to this mail.</p>',
                };
                sgMail.send(msg);
                document.getElementById("nextbtn").style.display = "none";
                document.getElementById("temp_setup").style.display = "block";
            }
        })
}

var $password1 = $("#p1"),
    $password2 = $("#p2"),
    $statusMessage = $("#validate-status"),
    $spswbtn = $("#spswbtn");

// password validation function
function testpwd() {
    if ($password1.val() == $password2.val()) {
        $statusMessage.text("Passwords Match");
        // alert($password1.val() + "is the password");
        $spswbtn.prop("disabled", false);
    } else {
        $statusMessage.text("Passwords Do Not Match");
        $spswbtn.prop("disabled", true);
    }
}

// sets the password on firebase
function writepwd() {
    var pass = document.getElementById("p2").value;
    console.log(pass)
    db.collection("thanos-users").where("username", "==", un).get()
        .then(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
                var d_id = doc.id;
                db.collection("thanos-users").doc(d_id).update({
                        "pwd": pass
                    })
                    .then(function () {
                        alert("Password set successfully!");
                        window.location.assign("index.html");
                    })
                    .catch(function (error) {
                        alert("Error setting password. Try again.", error);
                    });
            })
        });

    return false;

}

// checks for internet connectivity and updates UI accordingly.
function checkInternet() {
    require('dns').lookup('google.com', function (err) {
        if (err && err.code == "ENOTFOUND") {
            document.getElementById("main-div").style.display="none";
            document.getElementById("internet").style.display="block";
        } else {
            document.getElementById("main-div").style.display="block";
            document.getElementById("internet").style.display="none";
        }
    })
}