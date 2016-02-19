function PayTheKingGameClient(id) {
    //private var
    var _this = this;
    this.id = id;
    this.state = "PreGame";
    this.round = 0;
    this.messageTitle = "Wating for Players...";
    this.messageDetails = "";
    this.players = [];
    this.isHost = true;
    this.kingState = 'neutral';
    this.roundDuration = 10000;
    this.eventLog = [];
    this.startTime = Date.now();
    this.roundStartTime = 0;
    this.roundTimeLeft = 0;
    this.roundTimeElapsed = 0;
    this.debug = true;
    this.onEvent = function (event, value) { };

    //log on to server
   // var serverUrl = 'http://localhost:8001/';
    var serverUrl = 'https://paythekingserver.azurewebsitesxxxx.net/';
    //if (Config && Config.SocketIOUrl) serverUrl = Config.SocketIOUrl;
    var os = 'unknown';
   // if (Config && Config.OS) os = Config.OS;
    var version = 'unknown';
    //if (Config && Config.Version) version = Config.Version;

    var socket = io(serverUrl, { 'forceNew': true });
    socket.on("connect", function () {
        _this.ping();
    });
    socket.on('connect_error', function () {
        console.log('Failed to connect to server');
        _this.sendEvent('NetworkError');
    });
    socket.on('pong', function (data) {
        var latency = Date.now() - data;
        logMessage("<-- pong", latency);
    });
    socket.on('message', function (data) {
        logMessage("<-- message", data);
    });
    var logMessage = function (event, data) {
        console.log(data);
    }
    this.dispose = function () {
        //clearTimeout(_this.joinTimer);
        clearTimeout(_this.roundTimer);
        this.onEvent = null;
        if(socket)socket.disconnect();
    }
    this.pay = function (playerId, amount) {
        //update local for faster feedback
        var player;
        for (var i in _this.players) {
            if (_this.players[i].id == playerId) {
                player = _this.players[i];
            }
        }
        if (player) {
            if (player.gold < player.offer + amount) {
                _this.sendEvent("offerFailed:Not Enough Gold", 0, player);
                return;
            }
            player.offer += amount;
        }
        _this.sendEvent('paidLocally');

        //update server
        socket.emit('pay', playerId, amount);
    }
    this.ping = function () {
        socket.emit('ping', Date.now());
    }
    this.sendEvent = function (event, value, player) {
        var getElaspedTime = ((Date.now() - this.startTime) / 1000);
        //console log event
        if (console.log != undefined && this.debug == true)
            console.log(event + " : " + value + " : " + player + " : " + getElaspedTime);

        //add to event log
        _this.eventLog.push({ 'event': event, 'value': value, 'player': player, timestamp: getElaspedTime });

        //send event to UI (is that a player)
        _this.onEvent({ 'event': event, 'value': value, 'player': player, timestamp: getElaspedTime });

        //send event to all players
        for (var i in _this.players) {
            if (_this.players[i].onEvent)
                _this.players[i].onEvent(event);
        }
    }


    //input
    this.join = function (player) {
        if (player) {
            var user = {
                id: player.id,
                name: player.name || "NoName",
                avatar: player.avatar || "images/default-avatar.png",
                level: player.level || "1",
                rank: player.rank || "Bronze",
                rating: player.rating || 1000,
                os: os,
                version: version
            }
            socket.emit('login', user);
        }
    }
    socket.on('sync', function (event,data) {
        logMessage('<-- sync:' + event, data);
       
        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                console.log(data[key]);
                _this[key] = data[key];
            }
        }
        _this.sendEvent('sync', data);
      
    });
   
  
}
