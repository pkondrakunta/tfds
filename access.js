// CONSTANTS AND REQUIREMENTS
var os = require('os');
var SSH = require('simple-ssh');
let Client = require('ssh2-sftp-client');
const fs = require('fs');
let sftp = new Client();
const Path = require('path');
const remote = require('electron').remote;
const app = remote.app;
var dDataPath = app.getPath('downloads');


// Developer Modify Paths Goes Here
let artifactPath = '/home/pi/droneData/PA-actions';
let devPath = '/home/pi/droneData/devBin';
let keyPath = '/home/pi/droneData/keys';
let logsPath = '/home/pi/droneData/flightLogs';
let certPath = '/home/pi/droneData/cert';

let genKeyCmd = 'python droneData/genKey.py';
let verifyCmd = 'python droneData/validatePA.py --pafile ';
let listDirCmd = 'python droneData/listDir.py';
let clearLogCmd = 'python droneData/clearLogs.py';
let clearPACmd = 'python droneData/deletePA.py --pafile ';
// Developer Modify Path ends Here

//------------Modify paths---------------
// let artifactPath = '/home/pi/NPNT_TEST/PA';
// let invArtifactPath = '/home/pi/NPNT_TEST/PA/ARCHIVE';
// let devPath = '/home/pi/NPNT_TEST/devBin';
// let keyPath = '/home/pi/NPNT_TEST/DGCA';
// let logsPath = '/home/pi/NPNT_TEST/LOGS';
// let certPath = '/home/pi/NPNT_TEST/DGCA';

// let genKeyCmd = 'python NPNT_TEST/keys.py';
// let verifyCmd = 'python NPNT_TEST/validatePA.py --pafile ';
// let listDirCmd = 'python NPNT_TEST/listLogsDir.py';
// let clearLogCmd = 'python NPNT_TEST/clearLogs.py';
// let clearPACmd = 'python NPNT_TEST/deletePA.py --pafile ';
// Modify Path ends Here

$(function () {
    $('[data-toggle="tooltip"]').tooltip()
})

// Receive IP and Username from previous page 
var queryString = decodeURIComponent(window.location.search);
queryString = queryString.substring(1);
var queries = queryString.split("&");
console.log(queries);

// Creating global variables "ip" and "uname" from fetched data
var ip = queries[0];
var uname = queries[1];
console.log('This is the data received: \n' + ip + '\n' + uname);

// Configuring the ssh connection variable
const config = {
    host: ip,
    username: 'pi',
    password: 'thanos_master',
    readyTimeout: 2000,
    retries: 2, // integer. Number of times to retry connecting
    retry_factor: 0.5, // integer. Time factor used to calculate time between retries
    retry_minTimeout: 800
};


// function to execute the deletePA script incase of a duplicate PA file
function deletePA(path) {
    return new Promise(function (resolve, reject) {
        var ssh = new SSH({
            host: ip,
            user: 'pi',
            pass: 'thanos_master'
        });

        clearPACmd = clearPACmd + path
        ssh.exec(clearPACmd, {
            out: function (stdout) {
                console.log(stdout);
                alert(stdout);
                resolve(true)
            }
        }).start()

    })

}


// Function for transfering file from Desktop to Raspberry Pi
function transfer(src, path) {

    sftp.connect(config).then(() => {
            return sftp.exists(path);
        })
        .then(async function (data) {
            if (data == false) {
                document.getElementById('uploadSpinner').style.display = "none";
                alert("file uploaded succesfully!");
                $('#fileUploadModal').modal('hide');
                return sftp.put(src, path);
            } else {
                var result = confirm('A file with the same name already exists. Uploading this one will replace the previous file. \n Are you sure you want to replace the old file?')
                if (result) {
                    let delPAres = await deletePA(path);
                    document.getElementById('uploadSpinner').style.display = "none";
                    alert("file uploaded succesfully!");
                    $('#fileUploadModal').modal('hide');
                    return sftp.put(src, path);
                }
            }
            console.log(data)
        })
        .then(() => {
            return sftp.end();
        })
        .catch(err => {
            document.getElementById('uploadSpinner').style.display = "none";
            console.error(err.message);
            alert("Error in file upload")
            window.location.reload();
        });
}

// function to transfer DGCA certificate
function transferCert(src, path) {

    sftp.connect(config).then(() => {
            return sftp.exists(path);
        })
        .then(data => {
            if (data == false) {
                document.getElementById('certuploadSpinner').style.display = "none";
                alert("Certificate uploaded succesfully!");
                $('#certUploadModal').modal('hide');
                return sftp.put(src, path);
            } else {
                var result = confirm('A file with the same name already exists. Uploading this one will replace the previous file. \n Are you sure you want to replace the old file?')
                if (result) {
                    document.getElementById('certuploadSpinner').style.display = "none";
                    alert("Certificate uploaded succesfully!");
                    $('#certUploadModal').modal('hide');
                    return sftp.put(src, path);
                }
            }
            console.log(data)
        })
        .then(() => {
            return sftp.end();
        })
        .catch(err => {
            document.getElementById('certuploadSpinner').style.display = "none";
            console.error(err.message); // error message will include 'example-client'
            alert("Error in file upload")
            window.location.reload();
        });

}

// Function to show Home buttons and hide the others when you click "Home" in navbar
function showHomeButtons() {
    document.getElementById("Home_buttons").style.display = "block";
    document.getElementById("PA_buttons").style.display = "none";
    document.getElementById("Key_buttons").style.display = "none";
    document.getElementById("Dev_buttons").style.display = "none";
    document.getElementById("Logs_buttons").style.display = "none";
    document.getElementById("home-nav").classList.add("active");
    document.getElementById("dev-nav").classList.remove("active");
    document.getElementById("pa-nav").classList.remove('active');
    document.getElementById("key-nav").classList.remove('active');
    document.getElementById("log-nav").classList.remove('active');
}

// Function to show Key buttons and hide the others when you click "Key Actions" in navbar
function showKeyButtons() {
    document.getElementById("Key_buttons").style.display = "block";
    document.getElementById("Home_buttons").style.display = "none";
    document.getElementById("PA_buttons").style.display = "none";
    document.getElementById("Dev_buttons").style.display = "none";
    document.getElementById("Logs_buttons").style.display = "none";
    document.getElementById("key-nav").classList.add("active");
    document.getElementById("home-nav").classList.remove('active');
    document.getElementById("pa-nav").classList.remove('active');
    document.getElementById("dev-nav").classList.remove('active');
    document.getElementById("log-nav").classList.remove('active');
}

// Function to show PA buttons and hide the others when you click "PA Actions" in navbar
function showPAButtons() {
    document.getElementById("Key_buttons").style.display = "none";
    document.getElementById("Home_buttons").style.display = "none";
    document.getElementById("PA_buttons").style.display = "block";
    document.getElementById("Dev_buttons").style.display = "none";
    document.getElementById("Logs_buttons").style.display = "none";
    document.getElementById("pa-nav").classList.add("active");
    document.getElementById("home-nav").classList.remove('active');
    document.getElementById("dev-nav").classList.remove('active');
    document.getElementById("key-nav").classList.remove('active');
    document.getElementById("log-nav").classList.remove('active');

}

// Function to show Log buttons and hide the others when you click "PA Actions" in navbar
function showLogsButtons() {
    document.getElementById("Key_buttons").style.display = "none";
    document.getElementById("Home_buttons").style.display = "none";
    document.getElementById("PA_buttons").style.display = "none";
    document.getElementById("Dev_buttons").style.display = "none";
    document.getElementById("Logs_buttons").style.display = "block";
    document.getElementById("log-nav").classList.add("active");
    document.getElementById("home-nav").classList.remove('active');
    document.getElementById("dev-nav").classList.remove('active');
    document.getElementById("key-nav").classList.remove('active');
    document.getElementById("pa-nav").classList.remove('active');
}

// Function to show Dev buttons and hide the others when you click "Developer Options" in navbar
function showDevButtons() {
    document.getElementById("Key_buttons").style.display = "none";
    document.getElementById("Home_buttons").style.display = "none";
    document.getElementById("PA_buttons").style.display = "none";
    document.getElementById("Dev_buttons").style.display = "block";
    document.getElementById("Logs_buttons").style.display = "none";
    document.getElementById("dev-nav").classList.add("active");
    document.getElementById("home-nav").classList.remove('active');
    document.getElementById("pa-nav").classList.remove('active');
    document.getElementById("key-nav").classList.remove('active');
    document.getElementById("log-nav").classList.remove('active');
}

// Takes the input file data, parses for the filename and calls the transfer function 
function submittingForm() {

    var temp_path = document.getElementById("filename").files[0].path;
    let data = fs.createReadStream(document.getElementById("filename").files[0].path);
    var fileName = "";
    for (i = temp_path.length - 1; i >= 0; i--) {
        if (temp_path[i] == "/" || temp_path[i] == "\\") {
            fileName = temp_path.slice(i + 1, temp_path.length);
            break;
        }
    }

    path = artifactPath + "/" + fileName;
    var result = confirm('Are you sure you want to upload this file?')
    if (result) {
        document.getElementById('uploadSpinner').style.display = "inline-block";
        transfer(data, path);
    }
}

// Takes the input dev file data, parses for the filename and calls the transfer function 
function devPut() {
    var temp_path = document.getElementById("devfile").files[0].path;
    let data = fs.createReadStream(document.getElementById("devfile").files[0].path);
    var fileName = "";
    for (i = temp_path.length - 1; i >= 0; i--) {
        if (temp_path[i] == "/" || temp_path[i] == "\\") {
            fileName = temp_path.slice(i + 1, temp_path.length);
            break;
        }
    }

    path = devPath + "/" + fileName;
    console.log(data);
    var result = confirm('Are you sure you want to upload this file?')
    if (result) {
        transfer(data, path);
        $('#fileUploadModal').modal('hide');
    }
}

// Function to upload the DGCA Certificate
function uploadCert() {
    var temp_path = document.getElementById("certfile").files[0].path;
    let data = fs.createReadStream(document.getElementById("certfile").files[0].path);
    var fileName = "";
    for (i = temp_path.length - 1; i >= 0; i--) {
        if (temp_path[i] == "/" || temp_path[i] == "\\") {
            fileName = temp_path.slice(i + 1, temp_path.length);
            break;
        }
    }

    path = certPath + "/" + fileName;
    console.log(data);
    var result = confirm('Are you sure you want to upload this file?')
    if (result) {
        document.getElementById('certuploadSpinner').style.display = "inline-block";
        transferCert(data, path);

    }
}

// Function takes the Raspberry Pi file path to be deleted and deletes it
function execDelete() {

    var result = confirm("Are you sure you want to delete this file?");
    if (result == true) {
        console.log("Confirmed!!");

        path = ""
        var sel = document.getElementById('delSelect')
        var val = sel.options[sel.selectedIndex].text;
        var filename = artifactPath + "/" + val;

        sftp.connect(config)
            .then(() => {
                return sftp.delete(filename);
            })
            .then(() => {
                alert('File deleted successfully!');
                $('#displayListModal').modal('hide');
                return sftp.end();
            })
            .catch(err => {
                console.error(err.message);
            });

    }

}

// Function called to get the files in PA Path when the Delete PA is clicked
function getDelList() {
    // getFiles(artifactPath, 'deleteList');
    document.getElementById('textDelete').innerHTML = ' ';
    document.getElementById('delSpinner').style.display = 'inline-block';
    document.getElementById('delform').style.display = 'none';


    document.getElementById("delbtn").disabled = true;

    sftp.connect(config)
        .then(() => {
            return sftp.list(artifactPath);
        })
        .then(receivedData => {
            console.log(receivedData);
            document.getElementById('delform').style.display = 'block';
            document.getElementById('delSpinner').style.display = 'none';
            document.getElementById('delSelect').innerHTML = ' ';
            var filter_arr = [];

            for (var eachfile in receivedData) {
                if (receivedData[eachfile].name.slice(-4, ) == ".zip" || receivedData[eachfile].name.slice(-4, ) == ".xml") {
                    filter_arr.push(receivedData[eachfile].name);
                }
            }
            console.log(filter_arr);
            if (filter_arr == "") {
                document.getElementById('delSpinner').style.display = 'none';
                document.getElementById('textDelete').innerHTML = 'No PA file found';
            } else {
                for (var i in filter_arr) {
                    document.getElementById('delSelect').innerHTML += "<option>" + filter_arr[i] + "</option>";
                }

            }
        })
        .then(() => {
            document.getElementById("delbtn").disabled = false;
            return sftp.end();
        })
        .catch(err => {
            console.error(err.message);
            document.getElementById('delSpinner').style.display = 'none';
            document.getElementById('textDelete').innerHTML = 'Sorry. Could not retrieve any data.';

        });
}

// Function to extract files. Using it for devGet to delete files continuously
function extractData(folderPath, loaderId) {
    document.getElementById(loaderId).style.color = 'black';
    document.getElementById(loaderId).innerHTML = '<div class="spinner-border spinner-border-sm text-center" role="status"> </div>';

    sftp.connect(config)
        .then(() => {
            return sftp.list(folderPath);
        })
        .then(receivedData => {
            console.log(receivedData);
            document.getElementById(loaderId).innerHTML = ' ';
            if (receivedData == "") {
                document.getElementById(loaderId).style.color = 'red';
                document.getElementById(loaderId).innerHTML = 'No files found. Folder empty.';
            } else {
                for (var eachfile in receivedData) {
                    var id = "";
                    id = folderPath + '/' + receivedData[eachfile].name;
                    document.getElementById(loaderId).innerHTML +=
                        '<h6 class="list-group-item" style="text-align:left;">' +
                        receivedData[eachfile].name + '<button id="' + id + '"class="btn btn-outline-primary delete-btn btn-sm" onclick="sshDownload(this.id)">Download</button></h6>';
                }
            }
        })
        .then(() => {
            return sftp.end();
        })
        .catch(err => {
            console.error(err.message);
            document.getElementById(loaderId).style.color = 'red';
            document.getElementById(loaderId).innerHTML = 'Sorry. Could not retrieve any data.';

        });
}

// Function to download a remote file to the default Downloads folder on the Desktop
function sshDownload(dFileName) {
    var extfileName = "";
    for (i = dFileName.length - 1; i >= 0; i--) {
        if (dFileName[i] == "/" || dFileName[i] == "\\") {
            extfileName = dFileName.slice(i + 1, dFileName.length);
            break;
        }
    }
    if (os.type() == "Windows_NT") {
        destFile = dDataPath + "\\" + extfileName;
    } else if (os.type() == "Linux" || os.type() == "Darwin") {
        destFile = dDataPath + "/" + extfileName;
    } else {
        alert('OS not detected. Unable to set a download path.');
    }

    sftp.connect(config)
        .then(() => {
            return sftp.get(dFileName, destFile);
        })
        .then(() => {
            alert("File download successful!\nPath: " + destFile);
            sftp.end();
        })
        .catch(err => {
            console.error(err.message);
            alert("Error. File download failed.");

        });
}

// Fetches Developer files 
function devGet() {
    extractData(devPath, 'devDList');
}

// Fetches PA files 
function getPAfiles() {
    document.getElementById('textDelete').innerHTML = ' ';
    document.getElementById('delSpinner').style.display = 'inline-block';
    document.getElementById('delform').style.display = 'none';


    document.getElementById("delbtn").disabled = true;

    sftp.connect(config)
        .then(() => {
            return sftp.list(artifactPath);
        })
        .then(receivedData => {
            console.log(receivedData);
            document.getElementById('extPAform').style.display = 'block';
            document.getElementById('extPASpinner').style.display = 'none';
            document.getElementById('extPASelect').innerHTML = '';
            var filter_arr = [];

            for (var eachfile in receivedData) {
                if (receivedData[eachfile].name.slice(-4, ) == ".zip" || receivedData[eachfile].name.slice(-4, ) == ".xml") {
                    filter_arr.push(receivedData[eachfile].name);
                }
            }
            console.log(filter_arr);
            if (filter_arr == "") {
                document.getElementById('extPASpinner').style.display = 'none';
                document.getElementById('textExtPA').innerHTML = 'No PA file found';
            } else {
                for (var i in filter_arr) {
                    document.getElementById('extPASelect').innerHTML += "<option>" + filter_arr[i] + "</option>";
                }

            }
        })
        .then(() => {
            document.getElementById("extPAbtn").disabled = false;
            return sftp.end();
        })
        .catch(err => {
            console.error(err.message);
            document.getElementById('extPASpinner').style.display = 'none';
            document.getElementById('textExtPA').innerHTML = 'Sorry. Could not retrieve any data.';

        });

}

// Downloads/Extracts the PA file after user's selection
function execExtractPA() {
    path = ""
    var sel = document.getElementById('extPASelect')
    var selected_file = sel.options[sel.selectedIndex].text;
    var filename = artifactPath + "/" + selected_file;
    sshDownload(filename);
}

// Downloads the logs after user's selection
function execDownloadLogs() {
    path = ""
    var sel = document.getElementById('DlogsSelect')
    var selected_file = sel.options[sel.selectedIndex].text;
    var filename = logsPath + "/" + selected_file;
    sshDownload(filename);
}

//Downloads Public Keys 
function getPK() {
    var pk_name = " ";
    sftp.connect(config)
        .then(() => {
            return sftp.list(keyPath, "*.pem");
        })
        .then(data => {
            console.log(data);
            if (data == "") {
                alert('No Public Keys were found. Generate Public Keys and try again.');
                return sftp.end();

            } else {
                pk_name = keyPath + "/" + data[0].name;
                return sftp.end();
            }
        })
        .then(() => {
            if (pk_name != " ") {
                sshDownload(pk_name);
            }
        })
        .catch(err => {
            console.error(err.message);
            alert('Could not retrieve data. Please try connecting again.')
        });

}

// Function to create new keys 
function execGenKey() {
    var result = confirm('Generating new keys will replace your old keys. Are you sure you want to generate new keys? ')
    if (result == true) {
        $('#genLoader').modal('show');

        var ssh = new SSH({
            host: ip,
            user: 'pi',
            pass: 'thanos_master'
        });

        ssh.exec(genKeyCmd, {
            out: function (stdout) {
                console.log(stdout);
                alert(stdout + "\nYou can download your keys using Get Public Keys.");
                $('#genLoader').modal('hide');

            }
        }).start();

    }

}

//Fetches the log files 
// Function to list every directory and files in Flight Logs folder of Raspberry Pi
function execListDir() {
    var listpath = logsPath;
    document.getElementById('textDlogs').innerHTML = ' ';
    document.getElementById('DlogsSpinner').style.display = 'inline-block';
    document.getElementById('Dlogsform').style.display = 'none';


    var ssh = new SSH({
        host: ip,
        user: 'pi',
        pass: 'thanos_master'
    });
    var rpiPath = listpath;

    ssh.exec(listDirCmd, {
        out: function (stdout) {
            document.getElementById('Dlogsform').style.display = 'block';
            document.getElementById('DlogsSpinner').style.display = 'none';
            document.getElementById('DlogsSelect').innerHTML = '';

            var dirList = JSON.parse(stdout);
            console.log(dirList);
            for (var each in dirList) {

                if (dirList[each] == "") {
                    id = rpiPath + '/' + each;
                    document.getElementById('DlogsSelect').innerHTML += "<option>" +  each + "</option>";

                } else {
                    for (var i in dirList[each]) {
                        var id = "";
                        id = rpiPath + '/' + each + '/' + dirList[each][i];
                        console.log(dirList[each]);
                        document.getElementById('DlogsSelect').innerHTML += "<option>" + each + '/' + dirList[each][i] + "</option>";

                    }
                }

            }
        }
    }).start();

}

// Function to Clear all the Flight Logs
function execLogs() {
    var result = confirm('This will erase all your flight logs and is irrevertable. Do you want to continue anyway?')
    if (result == true) {
        var ssh = new SSH({
            host: ip,
            user: 'pi',
            pass: 'thanos_master'
        });

        ssh.exec(clearLogCmd, {
            out: function (stdout) {
                console.log(stdout);
                alert(stdout + "\nFlight logs cleared!");
            }
        }).start();

    }
}

// Function to get PA files for verfication dropdown
function getVerifyList() {
    document.getElementById('textVerify').innerHTML = ' ';
    document.getElementById('verifySpinner').style.display = 'inline-block';
    document.getElementById('verifyform').style.display = 'none';


    document.getElementById("verifybtn").disabled = true;

    sftp.connect(config)
        .then(() => {
            return sftp.list(artifactPath);
        })
        .then(receivedData => {

            console.log(receivedData);
            document.getElementById('verifyform').style.display = 'block';
            document.getElementById('verifySpinner').style.display = 'none';
            document.getElementById('verifySelect').innerHTML = ' ';
            if (receivedData == "") {
                document.getElementById('verifySpinner').style.display = 'none';
                document.getElementById('textVerify').innerHTML = 'No PA found. Upload a PA before verifying it.';
            } else {
                for (var eachfile in receivedData) {
                    document.getElementById('verifySelect').innerHTML += "<option>" + receivedData[eachfile].name + "</option>";
                }
            }
        })
        .then(() => {
            document.getElementById("verifybtn").disabled = false;
            return sftp.end();
        })
        .catch(err => {
            console.error(err.message);
            document.getElementById('verifySpinner').style.display = 'none';
            document.getElementById('textVerify').innerHTML = 'Sorry. Could not retrieve any data.';

        });

}

// Runs a python script on Raspberry Pi to verify PA
function execVerify() {
    path = ""
    var sel = document.getElementById('verifySelect')
    var val = sel.options[sel.selectedIndex].text;
    // alert(val);
    path = artifactPath + "/" + val;
    path = verifyCmd + path;

    var ssh = new SSH({
        host: ip,
        user: 'pi',
        pass: 'thanos_master'
    });

    ssh.exec(path, {
        out: function (stdout) {
            // console.log(stdout);
            alert(stdout);
            $('#verifyModal').modal('hide');
        }
    }).start();
}

// You can use this function to download the PA files in bundles
function execBundle(){

}

// You can use this function to delete all the PA files
function execDeleteAll(){

}