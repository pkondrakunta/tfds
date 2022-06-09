const firebase = require("firebase");
require("firebase/firestore");
var CryptoJS = require("crypto-js");
var SECRET_KEY = 'nnj8h!KQC<KgP2/';
const storage = require('electron-json-storage');
const dataPath = storage.getDefaultDataPath();
const sgMail = require('@sendgrid/mail');
var rs = require("randomstring");

firebase.initializeApp({
  apiKey: "AIzaSyABnfvM1-gzhWs5EvXzIQCEJtOqiArU3No",
  authDomain: "tfds-e2248.firebaseapp.com",
  projectId: "tfds-e2248"
});

sgMail.setApiKey("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");

var db = firebase.firestore();
var un = "";
let temporary_pwd = "";

function changetosignup() {
  document.getElementById("loginform").style.display = "none";
  document.getElementById("signupform").style.display = "block";
  document.getElementById("signupbtn").style.display = "none";
  document.getElementById("logbtn").style.display = "block";
  document.getElementById("boxtitle").innerHTML = "SIGN UP";
}

function changetologin() {
  window.location.reload();
  document.getElementById("signupform").style.display = "none";
  document.getElementById("loginform").style.display = "block";
  document.getElementById("logbtn").style.display = "none";
  document.getElementById("signupbtn").style.display = "block";
  document.getElementById("boxtitle").innerHTML = "LOG IN";
}

// gets mailid as input from user, generates random password and sends a mail
function setPwd() {
  if (document.getElementById("signupuser").value) {
    var text = document.getElementById("signupuser").value;
    db.collection("thanos-users").where("username", "==", text).get()
      .then(function (querySnapshot) {
        if (querySnapshot.empty == true) {
          console.log("Nobody with that username");
          document.getElementById("autheduser").innerHTML = "Try a different username"
        } else {
          querySnapshot.forEach(function (doc) {
            if (doc.data().pwd != "") {
              console.log("password already set");
              document.getElementById("autheduser").innerHTML = "Sorry, you have already set a password. If you have forgotten your password, please reset."
            } else {
              console.log("password to be set");
              temporary_pwd = rs.generate(8);
              console.log(temporary_pwd);
              const msg = {
                to: text,
                from: 'Thanos@thanos.in',
                subject: 'Signup Request',
                html: '<p style="font-size:medium;">Thanks for signing up with Thanos Technologies. Your temporary password is: <strong>' + temporary_pwd + '</strong>. Please use this to set your password.</p><br/><hr/><p style="font-size:xx-small;">This is an auto-generated e-mail. DO NOT reply to this mail.</p>',
              };
              sgMail.send(msg);
              document.getElementById("nextbtn").style.display = "none";
              document.getElementById("temp_setup").style.display = "block";
            }
          });
        }
      })
  }
}

// checks if temporary password matches with that entered by the user and updates UI accordingly
function check_temp_pwd() {
  var temp = document.getElementById("temp_pwd").value;
  if (temp == temporary_pwd) {
    un = document.getElementById("signupuser").value;
    document.getElementById("autheduser").innerHTML = un;
    document.getElementById("settingpsw").style.display = "block";
    document.getElementById("signupuser").style.display = "none";
    document.getElementById("temp_setup").style.display = "none";
    document.getElementById("spswbtn").style.display = "block";
  } else {
    document.getElementById('temp_text').style.color = "red";
    document.getElementById('temp_text').innerHTML = "Invalid password";
  }
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

// writes password to firebase
function writepwd() {
  var pass = document.getElementById("p2").value;
  db.collection("thanos-users").where("username", "==", un).get()
    .then(function (querySnapshot) {
      querySnapshot.forEach(function (doc) {
        var d_id = doc.id;
        db.collection("thanos-users").doc(d_id).update({
            "pwd": pass
          })
          .then(function () {
            alert("Password set successfully!");
            window.location.reload();
          })
          .catch(function (error) {
            alert("Error setting password. Try again.", error);
          });
      })
    });

  return false;

}

// encrypts and stores data on local storage
function ncryptnstore(data, key) {
  var ndata = CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY);
  storage.set(key, String(ndata));
}

// decrypts local storage info
function dcryptnshow(key) {
  return new Promise(function (resolve, reject) {
    decryptedData = " "
    storage.get(key, function (error, tdata) {
      if (error) {
        decryptedData = "error"
        reject(decryptedData)
      } else {
        var bytes = CryptoJS.AES.decrypt(tdata.toString(), SECRET_KEY);
        decryptedData = bytes.toString(CryptoJS.enc.Utf8);
        resolve(decryptedData);
      }

    });

  })

}

// checks for active internet connectivity
function checkInternet() {
  require('dns').lookup('google.com', function (err) {
    if (err && err.code == "ENOTFOUND") {
      login();
    } else {
      var user = document.getElementById("user").value;
      var pwd = document.getElementById("psw").value;
      document.getElementById("loginfail").innerHTML = "Please Wait...";
      onlineauth(user, pwd);
    }
  })
}

// offline login functionality
async function login() {
  var user = document.getElementById("user").value;
  var pwd = document.getElementById("psw").value;
  try {
    let fdata = await dcryptnshow("user_data");
    if (JSON.parse(fdata).username == user) {
      if (JSON.parse(fdata).pwd == pwd) {
        alert("Welcome back " + user + " !");
        window.location.assign("page2.html");
      } else {
        document.getElementById("loginfail").innerHTML = "Check the password you entered or retry after connecting to the internet.";
      }
    } else {
      document.getElementById("loginfail").innerHTML = "User not found! To add a new user, please connect to the internet & retry.";
      // onlineauth(user, pwd);
    }
  } catch (error) {
    document.getElementById("loginfail").innerHTML = "User not found! To add a new user, please connect to the internet & retry.";
    // onlineauth(user, pwd)
  }
}

// online login functionality
function onlineauth(a, b) {
  var uname = a;
  var pword = b;
  if (navigator.onLine) {
    db.collection("thanos-users").where("username", "==", uname).get()
      .then(function (querySnapshot) {
        if (querySnapshot.empty == true) {
          document.getElementById("loginfail").innerHTML = "Invalid username. Contact Thanos in case of any queries.";
        } else {
          querySnapshot.forEach(async function (doc) {
            if (pword == doc.data().pwd) {
              udata = doc.data();
              ncryptnstore(udata, "user_data");
              alert("Welcome Back " + uname + " !");
              window.location.assign("page2.html");
            } else {
              document.getElementById("loginfail").innerHTML = "Check the password you entered. Contact Thanos in case of any queries.";
            }
          });
        }
      })

  } else {
    alert("You are offline currently. Connect to the internet and retry.");
    window.location.reload();
  }
}