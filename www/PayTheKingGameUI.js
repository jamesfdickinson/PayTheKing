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
        this.game = new PayTheKingGame();
        this.game.onEvent = this.onEvent;

        //setup players
        this.localPlayer = new PayTheKingPlayerLocal("Jimmy");
        this.localPlayer.avatar = 'https://graph.facebook.com/560706963/picture?type=normal';
        this.game.join(this.localPlayer);

        ////todo: setup with computer or network players
        //for (var i = 1; i < 7; i++) {
        //    var player = new PayTheKingPlayerComputer();
        //    //player.name = "name" + (i + 1);
        //    //player.gold = 100;
        //    this.game.join(player);
        //}


        //clear 
        var playersDiv = document.getElementById("players");
        playersDiv.innerHTML = '';
        var log = document.querySelector("#log");
        log.innerHTML = '';


       // this.game.start();

        clearInterval(this.uiTimer);
        this.uiTimer = setInterval(_this.UpdateUI, 200);


        this.computerCount = 6;
        clearInterval(this.joinTimer);
        this.joinTimer = setInterval(_this.addPlayer, 1000);
    }
    this.pay = function (amount) {
        _this.localPlayer.pay(amount);
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
        //create all missing
        for (var i in _this.game.players) {
            var player = _this.game.players[i];
            if (document.querySelector("#player" + i) == null) {

                var divPlayer = document.createElement('div');
                divPlayer.id = "player" + i;
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
        //populate all
        for (var i in _this.game.players) {
            var player = _this.game.players[i];
            var divPlayer = document.querySelector("#player" + i);
            if (player.isBooted) divPlayer.classList.add('isBooted');
            if (!player.isBooted) divPlayer.classList.remove('isBooted');
            var divName = document.querySelector("#player" + i + " .playerName");
            divName.innerHTML = player.name;
            var divGold = document.querySelector("#player" + i + " .playerGold");
            divGold.innerHTML = player.gold;
            var divOffer = document.querySelector("#player" + i + " .playerOffer");
            divOffer.innerHTML = player.offer;


            var localPlayerDashboard = document.querySelector("#localPlayerDashboard");
            if (_this.localPlayer.isBooted) localPlayerDashboard.classList.add('isBooted');
            if (!_this.localPlayer.isBooted) localPlayerDashboard.classList.remove('isBooted');

            var localOffer = document.querySelector("#localOffer");
            localOffer.innerHTML = _this.localPlayer.offer;

            var localGold = document.querySelector("#localGold");
            localGold.innerHTML = _this.localPlayer.gold;
        }

        var roundElaspedTime = Date.now() - _this.game.roundStartTime;
       // var timeLeftInSeconds = Math.floor((_this.game.roundDuration - roundElaspedTime) / 1000);
        var timeLeftInSeconds = (_this.game.roundDuration - roundElaspedTime) / 1000;
        if (timeLeftInSeconds < 0) timeLeftInSeconds = 0;

        //var countDown = document.querySelector("#countDown");
        //countDown.innerHTML = timeLeftInSeconds;

        var kingprogress = document.querySelector("#kingprogress");
        kingprogress.value = (timeLeftInSeconds *1000 / _this.game.roundDuration)*100;
        
        var king = document.querySelector(".king");
        king.className = "king "+_this.game.kingState;


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