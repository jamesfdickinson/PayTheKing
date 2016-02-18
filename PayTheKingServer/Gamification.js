var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

Gamification = {
    Version: "1.0.0.0",
    BaseUrl: "https://www.jimmyinteractive.com/Gamification/",
    //BaseUrl: "http://localhost:54222/",
    GameId: 5

};

Gamification.format = function (format) {
    var args = Array.prototype.slice.call(arguments, 1);
    return format.replace(/{(\d+)}/g, function (match, number) {
        return typeof args[number] != 'undefined'
          ? args[number]
          : match
        ;
    });
};
Gamification.ReportRankedGame = function (gameId, matchId, level, userId, opponentId, score, duration, tag) {
    //if undefined reutrn string
    if (!gameId || gameId == 0) gameId = Gamification.GameId;
    if (!matchId || matchId == 0) matchId = "";
    if (!level || level == 0) level = 0;
    if (!userId || userId == 0) userId = "";
    if (!opponentId || opponentId == 0) opponentId = 0;
    if (!score || score == 0) score = "";
    if (!duration || duration == 0) duration = 0;
    if (!tag || tag == 0) tag = "";

    score = Math.round(score);
    duration = Math.round(duration);

    var url = Gamification.format("api/LeaderBoard?Id={0}&matchId={1}&level={2}&userId={3}&opponentId={4}&score={5}&duration={6}&tag={7}", gameId, matchId, level, userId, opponentId, score, duration, tag);
    //https://jimmyinteractive.com/Gamification/api/LeaderBoard?Id=3&matchId=3&level=3&userId=123&opponentId=123&score=1&duration=67&tag=html

    url = Gamification.BaseUrl + url;


    //send data
    var xmlHttp = null;


    //todo: should be post
    //http://www.w3schools.com/ajax/ajax_xmlhttprequest_send.asp
    try {
        xmlHttp = new XMLHttpRequest();
        xmlHttp.open("GET", url, true);
        xmlHttp.setRequestHeader("cache-control", "private");
        xmlHttp.send(null);
    } catch (ex) {
        //log error, but in this case we dont care
        var error = ex;
    }

};
Gamification.UpdateUser = function (id, name, deviceId, facebookId, avatar, email, callback) {
    //if undefined or 0 return string
    if (!id || id == 0) id = "";
    if (!name || name == 0) name = "";
    if (!deviceId || deviceId == 0) deviceId = "";
    if (!facebookId || facebookId == 0) facebookId = "";
    if (!avatar || avatar == 0) avatar = "";
    if (!email || email == 0) email = "";


    var url = Gamification.BaseUrl + "api/user";

    var postData = Gamification.format(" Id={0}&name={1}&deviceId={2}&facebookId={3}&avatar={4}&email={5}", id, name, deviceId, facebookId, avatar, email);

    //send data
    var xmlHttp = null;


    try {
        xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                var data = JSON.parse(xmlHttp.responseText);
                if (callback) callback(data);
            }
        }
        xmlHttp.open("POST", url, true);
        xmlHttp.setRequestHeader("cache-control", "private");
        xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        // xmlHttp.setRequestHeader("Content-type", "application/json");
        xmlHttp.send(postData);
    } catch (ex) {
        //log error, but in this case we dont care
        var error = ex;
    }

};
Gamification.GetUser = function (id, gameId, callback) {
    //if undefined reutrn string
    if (!id && id != 0) id = "";
    if (!gameId && gameId != 0) gameId = Gamification.GameId;

    var url = Gamification.format("api/User/{0}?gameId={1}", id, gameId);
    var url = Gamification.BaseUrl + url;

    //send data
    var xmlHttp = null;


    try {
        xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                var data = JSON.parse(xmlHttp.responseText);
                if (callback) callback(data);
            }
        }
        xmlHttp.open("GET", url, true);
        xmlHttp.setRequestHeader("cache-control", "private");
        xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xmlHttp.send();
    } catch (ex) {
        //log error, but in this case we dont care
        var error = ex;
    }

};
Gamification.GetLeaderBoard = function (id, gameId,league, callback) {
    //if undefined reutrn string
    if (!id && id != 0) id = "";
    if (!gameId && gameId != 0) gameId = Gamification.GameId;
    if (!league) league = "Bronze";
   
    var url = Gamification.format("api/LeaderBoard/{0}?league={1}&fetchcount=1000", gameId, league);
    var url = Gamification.BaseUrl + url;

    //send data
    var xmlHttp = null;


    try {
        xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                var data = JSON.parse(xmlHttp.responseText);
                if (callback) callback(data);
            }
        }
        xmlHttp.open("GET", url, true);
        xmlHttp.setRequestHeader("cache-control", "private");
        xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xmlHttp.send();
    } catch (ex) {
        //log error, but in this case we dont care
        var error = ex;
    }

};
module.exports = Gamification;


