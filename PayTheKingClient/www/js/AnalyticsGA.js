AnalyticsGA = {
    AppName: "NoName",
    Version: "0.0.0.0",
    Property: "UA-43146845-14"
};
// wrap in function call
AnalyticsGA.TrackStart = function (appName, version) {

    localStorage.appName = appName;
    localStorage.version = version;

   
};
AnalyticsGA.TrackPage = function (page, urlParameters) {
    var appName = localStorage.getItem("appName");
    var version = localStorage.getItem("version");

    //if offline, dont run
    if (navigator.connection && navigator.connection.type === "none") {
        console.log("AnalyticsGA: No connection: skipping");
        return;
    }

    //https://developers.google.com/analytics/devguides/collection/analyticsjs/screens
    //https://github.com/blast-analytics-marketing/phonegap-google-universal-analytics
    //https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference#appName
  
    //ie uses window.msCrypto
     window.crypto = window.crypto || window.msCrypto; // for IE 11

    (function (i, s, o, g, r, a, m) {
        i['GoogleAnalyticsObject'] = r; i[r] = i[r] || function () {
            (i[r].q = i[r].q || []).push(arguments)
        }, i[r].l = 1 * new Date(); a = s.createElement(o),
        m = s.getElementsByTagName(o)[0]; a.async = 1; a.src = g; m.parentNode.insertBefore(a, m)
    })(window, document, 'script', 'js/Analytics_Google.js', 'ga');



    //get device id
    var uuid = null;

   


    //if device id not exist create one and save it
    if (uuid === null) {
        uuid = localStorage.getItem("uuid");
        //try using cordova
        //bug: seems to change on app update
        //fix: only pull from device if not saved
        if (uuid === null && typeof device !== "undefined" && device.uuid !== "undefined") {
            uuid = device.uuid;
        }
        if (uuid === null) {
            uuid = Math.floor(Math.random() * (99999999 - 10000000 + 1)) + 10000000;//get random number:Math.floor(Math.random() * (max - min + 1)) + min;
            localStorage.uuid = uuid;
        }
    }

    //if (uuid === null) {
    //    ga('create', 'UA-43146845-10', 'auto');
    //}
    //else {
    //    ga('create', 'UA-43146845-10', { 'storage': 'none', 'clientId': uuid });
    //}

    ga('create', AnalyticsGA.Property, { 'storage': 'none', 'clientId': uuid });
    ga('set', 'checkProtocolTask', null);
    ga('set', 'checkStorageTask', null);
    ga('set', 'appVersion', version);
    ga('set', 'appName', appName);
    //ga('set', {
    //    'appName': 'Speed',
    //    'appId': 'com.jimmyinteractive.speed',
    //    'appVersion': '1.9',
    //    'appInstallerId': '',
    //    'checkProtocolTask': null,
    //    'checkStorageTask':null
    //});
    //ga('set', 'screenName', 'MainMenu2');
    ga('send', 'screenview', { 'screenName': page });
    //ga('send', 'screenview');//uses what is set above
    //ga('send', 'event', 'video', 'started2');

};