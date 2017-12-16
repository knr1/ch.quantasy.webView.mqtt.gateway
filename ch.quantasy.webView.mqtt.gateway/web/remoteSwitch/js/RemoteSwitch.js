$(window).on("load", function () {
//$(document).ready(function () {
    //alert("Document loaded, including graphics and embedded documents (like SVG)");
    var remoteSwitch = document.getElementById("remoteSwitch");
    var svgDoc = remoteSwitch.contentDocument; //get the inner DOM of RemoteSwitch.svg

    var tabs = svgDoc.getElementsByClassName('tab');
    var blinds = svgDoc.getElementsByClassName('blinds');
    var switchersSocketB = svgDoc.getElementsByClassName('switchSocketB');
    var dimmersSocketB = svgDoc.getElementsByClassName('dimSocketB');


    for (var i = 0; i < tabs.length; i++) {
        var tab = tabs[i];
        tab.setAttribute("visibility", "hidden");
    }

for (var i = 0; i < blinds.length; i++) {
        var blind = blinds[i];
        $(blind).click(function (event) {
            var svgElement = event.target;
            var blindsParameter = {
                "timestamp": Math.floor((new Date).getTime() / 1000),
                "id": svgElement.getAttribute("blindsId"),
                "direction": svgElement.getAttribute("direction")
            };
            var yaml = json2yaml([blindsParameter]);
            yaml = "---\n" + yaml;
            sendText("blinds",yaml);
            if (svgElement.getAttribute("timerInMilliSeconds")) {
                setTimeout(function (event) {
                    blindsParameter["direction"] = "stop";
                    var yaml = json2yaml([blindsParameter]);
                    yaml = "---\n" + yaml;
                    sendText("blinds",yaml);
                }, parseInt(svgElement.getAttribute("timerInMilliSeconds")));
            }
        });
    }

    for (var i = 0; i < switchersSocketB.length; i++) {
        var switcher = switchersSocketB[i];
        $(switcher).click(function (event) {
            var svgElement = event.target;
            var switchingParameter = {
                "timestamp": Math.floor((new Date).getTime() / 1000),
                "type": "switchSocketB",
                "floor": svgElement.getAttribute("floor"),
                "address": parseInt(svgElement.getAttribute("address")),
                "unit": parseInt(svgElement.getAttribute("unit")),
                "switchingValue": (svgElement.getAttribute("switchingValue") === 'true' ? "switchOn" : "switchOff").toString()
            };
            var yaml = json2yaml([switchingParameter]);
            yaml = "---\n" + yaml;
            sendText("remoteSwitch",yaml);
            if (svgElement.getAttribute("timerInMilliSeconds")) {
                setTimeout(function (event) {
                    switchingParameter["switchingValue"] = (switchingParameter["switchingValue"] === "switchOn" ? "switchOff" : "switchOn");
                    var yaml = json2yaml([switchingParameter]);
                    yaml = "---\n" + yaml;
                    sendText("remoteSwitch",yaml);
                }, parseInt(svgElement.getAttribute("timerInMilliSeconds")));
            }
        });
    }

    for (var i = 0; i < dimmersSocketB.length; i++) {
        var dimmer = dimmersSocketB[i];
        $(dimmer).click(function (event) {
            var evtX = event.clientX;
            var evtY = event.clientY;
            var svgElement = event.target;
            var svgDocument = svgElement.ownerDocument;
            var svgRoot = svgDocument.documentElement;
            var svgEvtPoint = svgRoot.createSVGPoint();
            svgEvtPoint.x = evtX;
            svgEvtPoint.y = evtY;
            var a = svgElement.getScreenCTM();
            var b = a.inverse();
            var svgElementEvtPoint = svgEvtPoint.matrixTransform(b);
            var svgElementPoint = svgRoot.createSVGPoint();
            svgElementPoint.x = svgElement.getBoundingClientRect().left;
            svgElementPoint.y = svgElement.getBoundingClientRect().top;
            svgElementPoint = svgElementPoint.matrixTransform(b);
            svgElementEvtPoint.x -= svgElementPoint.x; //in die Matrix hinein?
            svgElementEvtPoint.y -= svgElementPoint.y; //in die Matrix hinein?

            var bBoxWidth = svgElement.getBBox().width;
            var bBoxHeight = svgElement.getBBox().height;
            var relativeEvtPointX = 1.0 / bBoxWidth * svgElementEvtPoint.x;
            var relativeEvtPointY = 1.0 / bBoxHeight * svgElementEvtPoint.y;
            var dimValue = Math.floor((1.0 - relativeEvtPointY) * 16);
            var yaml = json2yaml([{
                    "timestamp": Math.floor((new Date).getTime() / 1000),
                    "type": "dimSocketB",
                    "floor": svgElement.getAttribute("floor"),
                    "address": parseInt(svgElement.getAttribute("address")),
                    "unit": parseInt(svgElement.getAttribute("unit")),
                    "dimValue": dimValue,
                }]);
            yaml = "---\n" + yaml;
            sendText("remoteSwitch",yaml);
        });
    }
});
