function PayTheKingGame(id) {
    //private var
    var _this = this;
    this.id = Math.floor((Math.random() * 1000000) + 1);
    if(id) this.id = id;
    this.state = "PreGame";
    this.round = 0;
    this.messageTitle = "Wating for Players...";
    this.messageDetails = "";
    this.players = [];
    this.isHost = true;
    this.kingState = 'neutral';
    this.countToAutoStart = 5;
    this.roundTimer;
    this.roundDuration = 10000;
    this.roundTimeElapsed = 0;
    this.eventLog = [];
    this.startTime = Date.now();
    this.roundStartTime = 0;
    this.joinTimer;
    this.autoComputerJoinWaitTime = 5000;
    this.debug = true;
    this.onEvent = function (event, value) { };
    this.dispose = function () {
        clearTimeout(_this.joinTimer);
        clearTimeout(_this.roundTimer);
        this.onEvent = null;
    }
    this.sendEvent = function (event, value, player) {
        //console log event
        if (console.log != undefined && this.debug == true)
            console.log(this.id + " : "+ event + " : " + value + " : " + player + " : " + this.getElaspedTime());
        
        //add to event log
        _this.eventLog.push({ 'event': event, 'value': value, 'player': player, timestamp: this.getElaspedTime() });
        
        //send event to UI (is that a player)
        _this.onEvent({ 'event': event, 'value': value, 'player': player, timestamp: this.getElaspedTime() });
        
        //send event to all players
        for (var i in _this.players) {
            _this.players[i].onEvent(event);
        }
    }
    this.getElaspedTime = function () {
        return (Date.now() - this.startTime) / 1000;
    }

    this.addComputerPlayer = function () {
        var player = new PayTheKingPlayerComputer();
        _this.join(player);
    }
    this.join = function (player) {
        //add player
        _this.players.push(player);
        _this.sendEvent("join", player);
        
        //auto start when enough players?
        if (_this.players.length >= _this.countToAutoStart) {
            _this.start();
        }

        //stop computer join timer
        clearTimeout(_this.joinTimer);
        //start computer join timer
        if (_this.state == "PreGame" && _this.autoComputerJoinWaitTime != 0) {
            _this.joinTimer = setTimeout(_this.addComputerPlayer, _this.autoComputerJoinWaitTime);
        }

    }
    this.getPlayer = function (playerId) {
        for (var i in _this.players) {
            if (_this.players[i].id == playerId)
                return _this.players[i];
        }
        return null;
    }
    this.leave = function (player) {
        //todo: computer take over if game started?

        //note: for now leave the player there so there are stil players when someone wins even if they left, unless game has not started
        if (_this.state == "PreGame") {
            var i = _this.players.indexOf(player);
            _this.players.splice(i, 1);
            _this.sendEvent("leave", player);
        }
    }
    this.start = function () {
        //start round 1
        _this.round = 0;
        for (var i in _this.players) {
            var player = _this.players[i];
            player.gold = 100;
            player.offer = 0;
            player.isBooted = false;
        }
        
        clearTimeout(_this.roundTimer);
        
        _this.state = "RoundInProgress";
        _this.startTime = Date.now();
        _this.sendEvent("start");
        _this.startRound();
    }
    this.startRound = function () {
        //start timer for round
        _this.round += 1;
        _this.roundStartTime = Date.now();
        clearTimeout(_this.roundTimer);
        _this.roundTimer = setTimeout(_this.endRound, _this.roundDuration);
        
        //clear old offers
        for (var i in _this.players) {
            var player = _this.players[i];
            player.offer = 0;
        }
        
        
        _this.messageTitle = "Pay the King!";
        _this.messageDetails = "Round " + _this.round + ": Select your offering.";
        _this.messageDetails = "Select your offering.";
        _this.state = "RoundInProgress";
        _this.kingState = 'happy';
        _this.sendEvent("startRound");
        
        
        
        _this.midRound();
    }
    this.midRound = function () {
        var roundTimeElapsed = Date.now() - _this.roundStartTime;
        _this.roundTimeElapsed = roundTimeElapsed;
        _this.sendEvent("roundTimeElapsed", roundTimeElapsed);
        if (_this.roundTimeElapsed < _this.roundDuration) {
            clearTimeout(_this.roundTimer);
            _this.roundTimer = setTimeout(_this.midRound, 500);
        } else { 
            _this.endRound();
        }
    }
    this.pay = function (player, amount) {
        if (player.gold < player.offer + amount) {
            _this.sendEvent("offerFailed:Not Enough Gold", 0, player);
            return;
        }
        player.offer += amount;
        
        _this.sendEvent("offer", amount, player);
    }
    this.endRound = function () {
        _this.messageTitle = "Times up....";
        _this.messageDetails = "";
        
        //get lowest offer
        var lowestOffer = null;
        for (var i in _this.players) {
            var player = _this.players[i];
            if (player.isBooted) continue;
            if (lowestOffer == null)
                lowestOffer = player.offer;
            if (player.offer < lowestOffer)
                lowestOffer = player.offer;
        }
        //boot lowest paying player
        var playersBooted = [];
        for (var i in _this.players) {
            var player = _this.players[i];
            if (player.isBooted) continue;
            //remove gold /give gold to king
            player.gold -= player.offer;
            if (player.offer <= lowestOffer) {
                player.isBooted = true;
                player.gold = 0;
                playersBooted.push(player.name);
                
            }
           
        }
        
        _this.messageDetails = playersBooted.join() + " paid the least! You're out!";
        
        
        
        //??start start of round or let it play out
        //???boot all with out money ??? but you can win without money
        _this.state = "RoundEnd";
        _this.kingState = 'mad';
        _this.sendEvent("endRound");
        
        //check for end game
        var playerStillIn = 0;
        for (var i in _this.players) {
            var player = _this.players[i];
            if (!player.isBooted)
                playerStillIn++;
        }
        //check for win 
        //check for tie game(all lose)
        if (playerStillIn == 1 || playerStillIn == 0) {
            _this.roundTimer = setTimeout(_this.endGame, 5000);
            return;
        }
        
        
        //delay starting next round to see who was cut
        _this.roundTimer = setTimeout(_this.startRound, 5000);
        //startRound();
    }
    this.endGame = function () {
        clearTimeout(_this.roundTimer);
        
       
        for (var i in _this.players) {
            var player = _this.players[i];
            if (!player.isBooted) {
                _this.winner = player;
            }
        }
        if (_this.winner == null)
            _this.messageTitle =  "No One  wins!";
        if (_this.winner != null)
            _this.messageTitle = _this.winner.name + " wins!";

        _this.messageDetails = "Game Over";
        
        _this.state = "GameOver";
        _this.kingState = 'happy';

        if (_this.winner == null) _this.kingState = 'mad';
      
        _this.sendEvent("endGame");

        var elaspedTime = (Date.now() - _this.startTime) / 1000;
        _this.reportScoresToServer(_this.id, _this.players,_this.winner, elaspedTime);
    }
    this.reportScoresToServer = function (matchId, players, winner, elaspedTime) {
        //avg win amount = 10?
        // var loseAmount = -1 * Math.max(1,Math.round(10/ players.length));
        var loseAmount = -1 ;
        var minWinAmount = players.length;
        var gameId = 5;
        for (var i=0; i < players.length; i++) {
            var player = players[i];
            if (winner == player) {
                Gamification.ReportRankedGame(gameId, matchId, 0, player.id, 0,Math.max( player.gold, minWinAmount), elaspedTime, '');
            }
            else {
                Gamification.ReportRankedGame(gameId, matchId, 0, player.id, 0, loseAmount, elaspedTime, '');
            }
        }
    }

}