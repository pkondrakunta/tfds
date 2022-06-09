var evilscan = require("evilscan");
var wifi = require("node-wifi");
var CryptoJS = require("crypto-js");
var SECRET_KEY = 'nnj8h!KQC<KgP2/';
const storage = require('electron-json-storage');
const dataPath = storage.getDefaultDataPath();

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


wifi.init({
  iface: null // network interface, choose a random wifi interface if set to null
});

let options = {
  target: "192.168.0.0-192.168.255.254",
  port: "22",
  status: "TROU",
  timeout: 3000,
  banner: true
};

let mobileoptions = {
  target: "192.168.43.0-192.168.43.254",
  port: "22",
  status: "TROU",
  timeout: 3000,
  banner: true
};


let dev_arr1 = [];
let dev_arr2 = [];
let dev_arr = [];

function refresh() {
  window.location.assign("");
}

function displayDrones() {
  document.getElementById("droneListView").innerHTML = "";
  console.log(dev_arr);
  document.getElementById("droneListView").classList.remove("text-center");
  document.getElementById('tryAdv').style.display = "inline-block";
  if (dev_arr == "") {
    document.getElementById("droneListView").classList.add("text-center");
    document.getElementById("droneListView").innerText += "No device found.\n You can try advanced search!\n";
  }

  for (var drone in dev_arr) {
    var name = dev_arr[drone].banner.slice(22, -4);
    var ip = dev_arr[drone].ip;


    document.getElementById("droneListView").innerHTML +=
      '<a href="#" class="list-group-item list-group-item-action">' +
      name +
      "<br/> <small>" +
      ip +
      '</small> <br/><button id="' +
      drone +
      '" class="btn btn-outline-th connect" onclick="tryconnecting(this.id)">Connect</button></a>';
  }
}

async function tryconnecting(id) {
  // var a_id = "list" + id;
  // alert("Trying to connect to: " + dev_arr[id].banner.slice(22, -4) + "\n" + dev_arr[id].ip);
  var queryString = "?" + dev_arr[id].ip + "&" + dev_arr[id].banner.slice(22, -4);
  console.log(queryString)
  let reg_drones = await dcryptnshow("user_data");
  drones = Array.from(JSON.parse(reg_drones).rpiun);
  // alert(drones[0]);
  if (drones.includes(dev_arr[id].banner.slice(22, -4))) {
    // if(drones.includes("Thanos0300")){
    window.location.assign("access.html" + queryString);
  } else {
    alert("You cannot connect to this UAV. Register with Thanos before proceeding further");
    window.location.reload();
  }
}

var scanner = new evilscan(options);
var mobscanner = new evilscan(mobileoptions);


scanner.on("result", function (data) {
  if (data.status == "open") {
    dev_arr1.push(data);
  }
});

scanner.on("error", function (err) {
  throw new Error(data.toString());
});

scanner.on("done", function () {
  console.log("Scanning complete!");
  console.log(dev_arr1);
  mobscan();
});

mobscanner.on("result", function (data) {
  if (data.status == "open") {
    dev_arr2.push(data);
  }
});

mobscanner.on("error", function (err) {
  throw new Error(data.toString());
});

mobscanner.on("done", function () {
  console.log("Scanning complete!");
  dev_arr = dev_arr1.concat(dev_arr2);
  displayDrones();
});


wifi.getCurrentConnections(function (err, currentConnections) {
  if (err) {
    console.log(err);
  }
  console.log(currentConnections[0].ssid);
  document.getElementById("wifiSSID").innerHTML =
    "Connected Wi-Fi: " + currentConnections[0].ssid;
});

scanner.run();

$(function () {
  $('[data-toggle="tooltip"]').tooltip()
})

function mobscan() {
  mobscanner.run();
}


function advSearch() {
  var new_ip = document.getElementById('given_ip').value;
  console.log(new_ip);
  let advoptions = {
    target: new_ip,
    port: "22",
    status: "TROU",
    timeout: 3000,
    banner: true
  }
  var advscanner = new evilscan(advoptions);
  dev_arr.length = 0;
  advscanner.on("result", function (data) {
    if (data.status == "open") {
      dev_arr.push(data);
    }
  });

  advscanner.on("error", function (err) {
    document.getElementById("advMod").innerHTML = '<br/><p>Invalid IP</p>'
    throw new Error(data.toString());
  });

  advscanner.on("done", function () {
    console.log("Scanning complete!");
    console.log(dev_arr);

    if (dev_arr == "") {
      document.getElementById("advMod").innerHTML = '<br/><p>Could not find device on this IP</p>'
    } else {
      console.log(typeof (dev_arr));
      document.getElementById("advMod").innerHTML = " ";
      var result = confirm('Device found. Do you want to connect to ' + dev_arr[0].banner.slice(22, -4) + ' ?');
      if (result == true) {
        console.log(result);
        $('#advSearch').modal('hide');
        tryconnecting(0);
      }
    }
  });

  advscanner.run();
  document.getElementById("advMod").innerHTML = '<br/><div class="d-flex justify-content-center"><div class="spinner-border text-secondary" role="status"></div></div>'

}