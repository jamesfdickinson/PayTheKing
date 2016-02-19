function PayTheKingGame() {
    //private var
    var _this = this;
    this.state = "PreGame";
    this.round = 0;
    this.messageTitle = "Wating for Players...";
    this.messageDetails = "";
    this.players = [];
    this.isHost = true;
    this.kingState = 'neutral';
    this.countToAutoStart = 7;
    this.roundTimer;
    this.roundDuration = 10000;
    this.eventLog = [];
    this.startTime = Date.now();
    this.roundStartTime = 0;
    this.roundTimeElapsed = 0;
    this.debug = true;
    this.onEvent = function (event, value) { };
    this.sendEvent = function (event, value,player) {
        //console log event
        if (console.log != undefined && this.debug == true)
            console.log(event + " : " + value + " : " + player + " : " + this.getElaspedTime());

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

    this.join = function (player) {
        //todo: check for max player
        //todo: (host) auto start game if full 
        player.game = _this;
        _this.players.push(player);

        //todo: only if not network, network will trigger start?
        if (_this.players.length >= _this.countToAutoStart) {
            _this.start();
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

        _this.state = "Playing";
        _this.startTime = Date.now();
        _this.sendEvent("start");
        _this.startRound();
    }
    this.startRound = function () {
        //start timer for round
        _this.round += 1;
        _this.roundStartTime = Date.now();
        clearTimeout(_this.roundTimer);
        _this.roundTimer = setTimeout(_this.endRound, _this.roundDuration );
       
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
        _this.winner = "No One";
        for (var i in _this.players) {
            var player = _this.players[i];
            if (!player.isBooted)
                _this.winner = player.name;
        }
       
        _this.messageTitle = _this.winner + " wins!";
        _this.messageDetails = "Game Over";
        _this.sendEvent("winner", _this.winner);

        _this.state = "GameOver";
        _this.kingState = 'happy';
        clearTimeout(_this.roundTimer);
        _this.sendEvent("endGame");
    }
}