function PayTheKingPlayerLocal(name) {
    var _this = this;

    this.id = Math.floor((Math.random() * 1000000) + 1);
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
