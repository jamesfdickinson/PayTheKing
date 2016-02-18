
Analytics = {
    AppName: "NoName",
    Version: "0.0.0.0"
};

Analytics.TrackStart = function (appName, version, os) {
    if (!os) os = Analytics.GetOS();
    localStorage.appName = appName + os;
    localStorage.version = version;

    this.Track("Start");
};
Analytics.TrackPage = function (page, urlParameters) {
    this.Track("PageView", page, urlParameters);
};

Analytics.Track = function (Event, parameter1, parameter2) {
    var appName = localStorage.getItem("appName");
    var version = localStorage.getItem("version");

    //get device id 
    var uuid = null;

    //try using cordova
    if (typeof device !== "undefined" && device.uuid !== "undefined") {
        uuid = device.uuid;
    }

    //if device id not exist create one and save it
    if (uuid === null) {
        uuid = localStorage.getItem("uuid");
        if (uuid === null) {
            uuid = Math.floor(Math.random() * (99999999 - 10000000 + 1)) + 10000000;//get random number:Math.floor(Math.random() * (max - min + 1)) + min;
            localStorage.uuid= uuid;
        }
    }

    //get session id
    var sessionid = null;
    sessionid = sessionStorage.getItem("sessionid");
    if (sessionid === null) {
        sessionid = Math.floor(Math.random() * (99999999 - 10000000 + 1)) + 10000000;//get random number:Math.floor(Math.random() * (max - min + 1)) + min;
        sessionStorage.sessionid= sessionid;
    }
    //get CurrentCulture
    var CurrentCulture = window.navigator.userLanguage || window.navigator.language;//works IE/SAFARI/CHROME/FF


    this.SendData(appName, version, Event, parameter1, parameter2, CurrentCulture, sessionid, uuid);
};
Analytics.GetOS = function () {
    var os = "Other";
    var ua = navigator.userAgent;
    var isKindle = /Kindle/i.test(ua) || /Silk/i.test(ua) || /Amazon/i.test(ua) || /KFTT/i.test(ua) || /KFOT/i.test(ua) || /KFJWA/i.test(ua) || /KFJWI/i.test(ua) || /KFSOWI/i.test(ua) || /KFTHWA/i.test(ua) || /KFTHWI/i.test(ua) || /KFAPWA/i.test(ua) || /KFAPWI/i.test(ua);

    if (/(android)/i.test(navigator.userAgent) && isKindle) {
        os = "Amazon";
    }
    else if (/(android)/i.test(navigator.userAgent) && !isKindle) {
        os = "Android";
    }
    else if (/(ipod|iphone|ipad)/i.test(navigator.userAgent)) {
        os = "iOS";
    }
    else if (/(windows phone)/i.test(navigator.userAgent)) {
        os = "WindowsPhone";
    }
    else if (/(windows)/i.test(navigator.userAgent)) {
        os = "Windows";
    }
    else {
    }
    return os;
}

Analytics.SendData = function (AppName, Version, Event, parameter1, parameter2, CurrentCulture, SessionID, DeviceUniqueID, LiveAnonymousID, Platform) {

    //send data
    var xmlHttp = null;
    var theUrl = "https://www.jimmyinteractive.com/WP7/Service.svc/LogEvent?";

    if (window.location.protocol == "http:")
        theUrl = "http://www.jimmyinteractive.com/WP7/Service.svc/LogEvent?";

    //if undefined return string
    if (!CurrentCulture) CurrentCulture = "";
    if (!DeviceUniqueID) DeviceUniqueID = "";
    if (!SessionID) SessionID = "";
    if (!Version) Version = "";
    if (!parameter1) parameter1 = "";
    if (!parameter2) parameter2 = "";
    if (!LiveAnonymousID) LiveAnonymousID = "";
    if (!Platform) Platform = "";

    CurrentCulture = encodeURIComponent(CurrentCulture);
    DeviceUniqueID = encodeURIComponent(DeviceUniqueID);
    SessionID = encodeURIComponent(SessionID);
    Version = encodeURIComponent(Version);
    parameter1 = encodeURIComponent(parameter1);
    parameter2 = encodeURIComponent(parameter2);
    Platform = encodeURIComponent(Platform);


    var theUrl = theUrl + "AppName=" + AppName
                   + "&Event=" + Event
                   + "&Culture=" + CurrentCulture
                   + "&DeviceUniqueID=" + DeviceUniqueID
                   + "&SessionID=" + SessionID
                   + "&Version=" + Version
                   + "&Parameter1=" + parameter1
                   + "&Parameter2=" + parameter2
                   + "&LiveAnonymousID=" + LiveAnonymousID
                   + "&Platform=" + Platform
                   + "&Random=" + Math.floor(Math.random() * 1000000);

    try {
        xmlHttp = new XMLHttpRequest();
        xmlHttp.open("GET", theUrl , true);
        xmlHttp.send(null);
    } catch (ex) {
        //log error, but in this case we dont care
        var error = ex;
    }

};


