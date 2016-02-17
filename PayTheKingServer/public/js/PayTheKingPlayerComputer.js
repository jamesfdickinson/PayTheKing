function PayTheKingPlayerComputer(name) {
    var _this = this;

    this.id = Math.floor((Math.random() * 1000000) + 1);
    this.name = name;
    this.avatar = 'images/Avatars/user_256.png';

    this.gold = 100;
    this.offer = 0;
    this.isBooted = false;
    this.game;

    this.pay = function (amount) {
        _this.offer += amount;
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
    this.getRandomProfile = function () {
        var profiles = [{
            name: 'InsaneMonkey',
            avatar: 'images/Avatars/InsaneMonkey.png'
        }, {
            name: 'Spy',
            avatar: 'images/Avatars/spyware_256.png'
        }, {
            name: 'CrazyNinja',
            avatar: 'images/Avatars/CrazyNinja.png'
        }, {
            name: 'king',
            avatar: 'images/Avatars/king_256.png'
        }, {
            name: 'Lib',
            avatar: 'images/Avatars/librarian_256.png'
        }, {
            name: 'Joey',
            avatar: 'images/Avatars/user_256.png'
        }, {
            name: 'Arrrr',
            avatar: 'images/Avatars/piracy_256.png'
        } , {
            id: '-113',
            name: 'Spot',
            avatar: 'images/Avatars/user_256.png'
        }, {
            id: '-112',
            name: 'Lucy',
            avatar: 'https://graph.facebook.com/1604906436/picture?type=normal'
        }, {
            id: '-111',
            name: 'Andy',
            avatar: 'https://graph.facebook.com/1150278906/picture?type=normal'
        }, {
            id: '-110',
            name: 'Luke',
            avatar: 'https://graph.facebook.com/1091700854/picture?type=normal'
        }, {
            id: '-109',
            name: 'Heidi',
            avatar: 'https://graph.facebook.com/530277850/picture?type=normal'
        }, {
            id: '-108',
            name: 'Mark',
            avatar: 'https://graph.facebook.com/193305342/picture?type=normal'
        }, {
            id: '-107',
            name: 'Tammy',
            avatar: 'images/Avatars/user_256.png'
        }, {
            id: '-106',
            name: 'Sherry',
            avatar: 'images/Avatars/user_256.png'
        }, {
            id: '-105',
            name: 'John',
            avatar: 'https://graph.facebook.com/520488622/picture?type=normal'
        }, {
            id: '-104',
            name: 'Jimmy',
            avatar: 'https://graph.facebook.com/560706963/picture?type=normal'
        }, {
            id: '-103',
            name: 'Peter',
            avatar: 'https://graph.facebook.com/1455379376/picture?type=normal'
        }, {
            id: '-102',
            name: 'Paul',
            avatar: 'https://graph.facebook.com/1132887120/picture?type=normal'
        }, {
            id: '-101',
            name: 'David',
            avatar: 'images/Avatars/user_256.png'
        }, {
            id: '-100',
            name: 'Larry',
            avatar: 'https://graph.facebook.com/1260310195/picture?type=normal'
        }
        ];
        var profile = profiles[Math.floor(Math.random() * profiles.length)];
        return profile;
    }
    var profile = this.getRandomProfile();
    this.name = profile.name;
    this.avatar = profile.avatar;
    if (profile.id) this.id = profile.id;
}
PayTheKingPlayerComputer.prototype.toString = function localToString() {
    return this.name;
}