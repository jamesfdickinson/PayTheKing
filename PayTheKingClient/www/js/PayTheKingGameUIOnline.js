function PayTheKingGameUI() {
    var _this = this;
    this.localPlayer;

    this.game;
    this.uiTimer;
    var logDiv = document.getElementById("log");

    var btnPay1Gold = document.getElementById("btnPay1Gold");
    if (btnPay1Gold) btnPay1Gold.addEventListener("click", function () { _this.pay(1); });

    var btnPay5Gold = document.getElementById("btnPay5Gold");
    if (btnPay5Gold) btnPay5Gold.addEventListener("click", function () { _this.pay(5); });

    var btnPay10Gold = document.getElementById("btnPay10Gold")
    if (btnPay10Gold) btnPay10Gold.addEventListener("click", function () { _this.pay(10); });

    var btnNewGame1 = document.getElementById("btnNewGame1")
    if (btnNewGame1) btnNewGame1.addEventListener("click", function () { location.href = 'index.html'; });

    var btnPlayAgain = document.getElementById("btnPlayAgain")
    if (btnPlayAgain) btnPlayAgain.addEventListener("click", function () { location.reload(); });

    var btnBack = document.getElementById("btnBack")
    if (btnBack) btnBack.addEventListener("click", function () { location.href = 'index.html'; });




    this.start = function () {

        //setup game
        this.game = new PayTheKingGameClient();
        this.game.onEvent = this.onEvent;

        //setup players
        this.localPlayer = new PayTheKingPlayerLocal();

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

        this.game.join(this.localPlayer);


    }
    this.pay = function (amount) {
        var playerId = _this.localPlayer.id;
        //pay
        _this.game.pay(playerId, amount);
    }
    this.onEvent = function (event) {
        //check if connected to the internet, if not play locally. dispose and start local mode
        //note: could this be done in the core? merge the two cores
        if (event.event == 'NetworkError') {
            _this.game.dispose();
            _this.game = new PayTheKingGame();
            _this.game.autoComputerJoinWaitTime = 3000;
            _this.game.onEvent = _this.onEvent;
            _this.game.join(_this.localPlayer);
            return;
        }
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

                divPlayer.innerHTML = '';
                divPlayer.innerHTML += "<img class='playerImg' src='" + player.avatar + "' />";
                divPlayer.innerHTML += "<div class='playerOffer'></div>";
                divPlayer.innerHTML += "<div class='playerName'></div>";
                divPlayer.innerHTML += "<div class='playerGold'></div>";
                playersDiv.appendChild(divPlayer);

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

        var kingprogress = document.querySelector("#kingprogress");
        kingprogress.value = 100 - ((_this.game.roundTimeElapsed / _this.game.roundDuration) * 100);

        var king = document.querySelector(".king");
        king.className = "king " + _this.game.kingState;


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