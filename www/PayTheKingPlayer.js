function PayTheKingPlayerLocal(name) {
    var _this = this;

    this.id = 0;
    this.name = name;
    this.avatar = 'images/Avatars/clown_256.png';
    this.gold = 100;
    this.offer = 0;
    this.isBooted = false;
    this.game;
    this.isLocal = true;

    this.pay = function (amount) {
        _this.game.pay(_this, amount);
    }
    this.onEvent = function () {

    }
}
PayTheKingPlayerLocal.prototype.toString = function localToString() {
    return this.name;
}

function PayTheKingPlayerComputer(name) {
    var _this = this;

    this.id = 0;
    this.name = name;
    this.avatar = 'images/Avatars/user_256.png';
    
    this.gold = 100;
    this.offer = 0;
    this.isBooted = false;
    this.game;
    
    this.pay = function (amount) {
        _this.game.pay(_this, amount);
    }
    this.onEvent = function (event) {
        if (event == "startRound") {
            //computer#1
            //offer randomly 10-50 gold
            var min = 1;
            var max = 50;
            var offerAmount = Math.floor(Math.random() * (max - min)) + min;
            this.pay(Math.min(offerAmount, this.gold));

            //computer#2
            //offer goldleft/number of players +/- guess range

            //computer#3
            //offer smart, watch what others offered and offer theirGoldleft/number of players +/- guess range
        }
    }
    this.getRandomAvatar = function () {
        var avatars = ['images/Avatars/InsaneMonkey.png', 'images/Avatars/spyware_256.png', 'images/Avatars/CrazyNinja.png', 'images/Avatars/king_256.png', 'images/Avatars/librarian_256.png', 'images/Avatars/user_256.png', 'images/Avatars/piracy_256.png', 'images/Avatars/guide_256.png','https://scontent-sea1-1.xx.fbcdn.net/hprofile-xtp1/v/t1.0-1/p160x160/12643037_10153596404827851_3879131164774100033_n.jpg?oh=af0d3ce5cc8bf82b894b826843658f73&oe=576765B9'];
        var avatar = avatars[Math.floor(Math.random() * avatars.length)];
        return avatar;
    }
    this.getRandomName = function () {
        var names = ['Jimmy', 'Larry', 'david', 'paul', 'PETER', 'John', 'Sherry', 'Tammy', 'Mark'];
        var name = names[Math.floor(Math.random() * names.length)];
        return name;
    }
    this.avatar = this.getRandomAvatar();
    this.name = this.getRandomName();
}
PayTheKingPlayerComputer.prototype.toString = function localToString() {
    return this.name;
}