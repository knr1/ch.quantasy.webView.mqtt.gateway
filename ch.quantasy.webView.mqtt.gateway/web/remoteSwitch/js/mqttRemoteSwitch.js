var mqtt;
var reconnectTimeout = 2000;
var clientName="gui"+parseInt((Math.random() * 10000),10).toString(32);

function MQTTconnect() {
    if (typeof path == "undefined") {
        path = '';
    }
    mqtt = new Paho.MQTT.Client(
            host,
            port,
            path,
            "webView_" + parseInt(Math.random() * 1000000, 16)
            );
    var options = {
        timeout: 3,
        useSSL: useTLS,
        cleanSession: cleansession,
        onSuccess: onConnect,
        onFailure: function (message) {
            $('#status').val("Connection failed: " + message.errorMessage + "Retrying");
            setTimeout(MQTTconnect, reconnectTimeout);
        }
    };

    mqtt.onConnectionLost = onConnectionLost;
    mqtt.onMessageArrived = onMessageArrived;

    if (username != null) {
        options.userName = username;
        options.password = password;
    }
    console.log("Host=" + host + ", port=" + port + ", path=" + path + " TLS = " + useTLS + " username=" + username + " password=" + password);
    mqtt.connect(options);
}

function onConnect() {
    $('#status').val('Connected to ' + host + ':' + port + path);
    // Connection succeeded; subscribe to our topic
    mqtt.subscribe(baseTopic, {qos: 0});
    $('#topic').val(baseTopic);
}

function onConnectionLost(response) {
    setTimeout(MQTTconnect, reconnectTimeout);
    $('#status').val("connection lost: " + responseObject.errorMessage + ". Reconnecting");

}
;

function onMessageArrived(message) {

   // var topic = message.destinationName;
   // var payload = message.payloadString;
   //
   // $('#ws').prepend('<li>' + topic + ' = ' + payload + '</li>');
}
;


function sendText(topic,yaml) {
    console.log("to topic: " + baseTopic + " sending text: " + yaml);
    message = new Paho.MQTT.Message(yaml);
    message.destinationName = baseTopic + "/E/touched/"+topic+"/" + clientName;
    mqtt.send(message);
}


$(document).ready(function () {
    MQTTconnect();
});
