function PayTheKingGameUI() {
    var _this = this;
    this.localPlayer;

    this.game;
    this.uiTimer;
    var logDiv = document.getElementById("log");
    document.getElementById("btnPay1Gold").addEventListener("click", function () { _this.pay(1); });
    document.getElementById("btnPay5Gold").addEventListener("click", function () { _this.pay(5); });
    document.getElementById("btnPay10Gold").addEventListener("click", function () { _this.pay(10); });
    // document.getElementById("btnNewGame").addEventListener("click", function () { location.href = 'index.html'; });
    document.getElementById("btnNewGame1").addEventListener("click", function () { location.href = 'index.html'; });
    document.getElementById("btnNewGame3").addEventListener("click", function () { location.href = 'index.html'; });
    //document.getElementById("btnStart").addEventListener("click", function () { _this.game.start(); });

    this.computerCount = 6;
    this.joinTimer;


    this.addPlayer = function () {
        _this.computerCount -= 1;
        var player = new PayTheKingPlayerComputer();
        _this.game.join(player);
        if (_this.computerCount == 0) {
            clearInterval(_this.joinTimer);
        }
    }
    this.start = function () {

        //setup game
        this.game = new PayTheKingGameClient();
        this.game.onEvent = this.onEvent;

        

        //setup players
        this.localPlayer = new PayTheKingPlayerLocal("Jimmy");
        this.localPlayer.avatar = 'https://graph.facebook.com/560706963/picture?type=normal';

        //get user settings
        if (typeof Settings != 'undefined') {
            var settings = new Settings();
            this.localPlayer.id = settings.settings.id;
            this.localPlayer.name = settings.settings.name;
            this.localPlayer.avatar = settings.settings.avatar;
            this.localPlayer.rank = settings.settings.rank;
            this.localPlayer.rating = settings.settings.rating;
            this.localPlayer.level = settings.settings.level;
        }

        //todo: get the rest of users stats
        this.game.join(this.localPlayer);

      


        //clear 
        var playersDiv = document.getElementById("players");
        playersDiv.innerHTML = '';
        var log = document.querySelector("#log");
        log.innerHTML = '';


        // this.game.start();

        //clearInterval(this.uiTimer);
        //this.uiTimer = setInterval(_this.UpdateUI, 200);


        //this.computerCount = 6;
        //clearInterval(this.joinTimer);
        //this.joinTimer = setInterval(_this.addPlayer, 1000);
    }
    this.pay = function (amount) {
        // _this.localPlayer.pay(amount);

        _this.game.pay(_this.localPlayer.id, amount);
    }
    this.onEvent = function (event) {
        //var newNode = document.createElement('div');
        //newNode.innerHTML = event.event + " : " + event.value + " : " + event.player + " : " + event.timestamp;
        //logDiv.appendChild(newNode);

        _this.UpdateUI();
    }
    this.UpdateUI = function () {
        var wrapper = document.querySelector("#wrapper");
        wrapper.className = _this.game.state;
        var playersDiv = document.getElementById("players");

        //todo:clear when needed, like new game
        //playersDiv.innerHTML = '';

        //create all missing
        for (var i in _this.game.players) {
            var player = _this.game.players[i];
            if (document.querySelector("#player" + player.id) == null) {

                var divPlayer = document.createElement('div');
                divPlayer.id = "player" + player.id;
                divPlayer.className = "player";
                if (player.isLocal) divPlayer.className += " localPlayer";

                //divPlayer.innerHTML =  " <img class='playerImg' src='"+player.avatar+"'  /><div class='playerName'></div><div class='playerGold'></div><div class='playerOffer'></div></div>";
                divPlayer.innerHTML = '';
                divPlayer.innerHTML += "<img class='playerImg' src='" + player.avatar + "' />";
                divPlayer.innerHTML += "<div class='playerOffer'></div>";
                divPlayer.innerHTML += "<div class='playerName'></div>";
                divPlayer.innerHTML += "<div class='playerGold'></div>";
                playersDiv.appendChild(divPlayer);

                //var divName = document.createElement('div');
                //divName.className = 'playerName';
                //divPlayer.appendChild(divName);

                //var divGold = document.createElement('div');
                //divGold.className = 'playerGold';
                //divPlayer.appendChild(divGold);

                //var divOffer = document.createElement('div');
                //divOffer.className = 'playerOffer';
                //divPlayer.appendChild(divOffer);

                //_this.playerUIs[i] = divPlayer;
            }
        }
        //remove all missing
        var playerUIs = document.querySelectorAll(".player");
        for (i = 0; i < playerUIs.length; ++i) {
            var playerUI = playerUIs[i];
            var playerId = playerUI.id.replace('player', '');
            //get player by id
            var found = false;
            for (j = 0; j < _this.game.players.length; ++j) {
                var player = _this.game.players[j];
                if (player.id == playerId) {
                    found = true;
                }
            }
            if (!found) {
                playersDiv.removeChild(playerUI);
            }

        }
        //populate all
        for (i = 0; i < _this.game.players.length; ++i) {
            var player = _this.game.players[i];
            var divPlayer = document.querySelector("#player" + player.id);
            if (player.isBooted) divPlayer.classList.add('isBooted');
            if (!player.isBooted) divPlayer.classList.remove('isBooted');
            var divName = document.querySelector("#player" + player.id + " .playerName");
            divName.innerHTML = player.name;
            var divGold = document.querySelector("#player" + player.id + " .playerGold");
            divGold.innerHTML = player.gold;
            var divOffer = document.querySelector("#player" + player.id + " .playerOffer");
            divOffer.innerHTML = player.offer;
        }
        //find local player
        var localPlayer;
        for (var i in _this.game.players) {
            if (_this.game.players[i].id == _this.localPlayer.id) {
                localPlayer = _this.game.players[i];
            }
        }
        if (localPlayer) {
            var localOffer = document.querySelector("#localOffer");
            localOffer.innerHTML = localPlayer.offer;

            var localGold = document.querySelector("#localGold");
            localGold.innerHTML = localPlayer.gold;

            var localPlayerDashboard = document.querySelector("#localPlayerDashboard");
            if (localPlayer.isBooted) localPlayerDashboard.classList.add('isBooted');
            if (!localPlayer.isBooted) localPlayerDashboard.classList.remove('isBooted');

        }


        //var roundElaspedTime = Date.now() - _this.game.roundStartTime;
        //// var timeLeftInSeconds = Math.floor((_this.game.roundDuration - roundElaspedTime) / 1000);
        //var timeLeftInSeconds = (_this.game.roundDuration - roundElaspedTime) / 1000;
        //if (timeLeftInSeconds < 0) timeLeftInSeconds = 0;

        ////var countDown = document.querySelector("#countDown");
        ////countDown.innerHTML = timeLeftInSeconds;

        //var kingprogress = document.querySelector("#kingprogress");
        //kingprogress.value = (timeLeftInSeconds * 1000 / _this.game.roundDuration) * 100;


        var kingprogress = document.querySelector("#kingprogress");
        kingprogress.value = 100 - ((_this.game.roundTimeElapsed / _this.game.roundDuration) * 100);

        var king = document.querySelector(".king");
        king.className = "king " + _this.game.kingState;


        //if (_this.game.state == "PreGame" || _this.game.state == "Playing") {
        //    var endGame = document.querySelector("#endGame");
        //    endGame.style.display = 'none';
        //}
        //if (_this.game.state == "GameOver") {
        //    var endGame = document.querySelector("#endGame");
        //    endGame.style.display = 'block';
        //    var winner = document.querySelector("#winner");
        //    winner.innerHTML = _this.game.winner + " wins!";
        //}

        var messageTitle = document.querySelector("#messageTitle");
        messageTitle.innerHTML = _this.game.messageTitle;
        var messageDetails = document.querySelector("#messageDetails");
        messageDetails.innerHTML = _this.game.messageDetails;
    }


}
window.addEventListener("load", function () {
    //start game
    var payTheKingGameUI = new PayTheKingGameUI();
    payTheKingGameUI.start();
});