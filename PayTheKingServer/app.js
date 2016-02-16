console.log("Starting");

var fs = require('fs');
var express = require('express');
var debug = require('debug')('app');
var ioServer = require('socket.io');
var Filter = require('bad-words');
var filter = new Filter();
var PayTheKingPlayer = require('./PayTheKingPlayer');
var PayTheKingPlayerComputer = require('./PayTheKingPlayerComputer');
var PayTheKingGame = require('./PayTheKingGame');

///////////////////
//game server
///////////////////
var app = express();

var port = process.env.PORT || 8001;
var version = "1.0.0";
var httpServer = require('http').createServer(app);

//http server routing
app.use(express.static(__dirname + '/public'));
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});
app.get('/', function (req, res) {
    res.send('Running');
});
app.get('/data', function (req, res) {
    var count = getUsers().length;
    res.send(JSON.stringify(count));
});


//start listening
httpServer.listen(port, function () { console.log('***Server(http) listening at port %d *** version %s', port, version); });


var io = new ioServer();
io.attach(httpServer);

io.on('connection', ioConnection);


var users = [];
var rooms = [];


function ioConnection(socket) {
    
    
    var newUser = {
        socketid: socket.id, 
        name: "NoName",
        useragent: socket.request.headers['user-agent']
    };
    users.push(newUser);
    
    
    //console.log("user-agent: " + socket.request.headers['user-agent']);
    socket.emit('message', "Hello " + socket.id);
    //socket.room = 'lobby';
    // socket.join('lobby');
    joinRoom(socket, 'lost');
    
    socket.on("login", function (data) {
        
        
        //could get this from server, but for now get it from client
        var user = getUser(socket);
        user.socketid = socket.id;
        user.id = data.id || 123;
        user.name = filter.clean(data.name) || "NoName";
        user.avatar = data.avatar || "http://s3.amazonaws.com/37assets/svn/765-default-avatar.png";
        user.rank = data.rank || "Bronze";
        user.rating = data.rating || 1000;
        user.os = data.os || "?";
        user.version = data.version || "?";
        socket.emit('login', user);
        joinRoom(socket, 'lobby');//could send user to non match making room first;
        
        //todo: send message that users info updated?
        
        ////get time stamp
        //var date = new Date();
        //var n = date.toDateString();
        //var time = date.toLocaleTimeString();
        //var timeStampString = n + ' ' + time;
        
        
        
        //console.log(timeStampString);
        //console.log("login");
        //console.log(user);
      

    });
    socket.on('pay', function (playerId, amount) {
        //find room
        var user = getUser(socket);
        var room = rooms[user.room];
        if (room) {
            room.pay(playerId, amount);
        }
        
    });
    socket.on('message', function (data) {
        var user = getUser(socket);//todo: find room using socket? so i dont have to look it up in the user list reach time.
        
        debug(data);
        //emit to all in room only
        if (user.room) {
            socket.to(user.room).emit('message', data); //to all but self
            //io.sockets.to(user.room).emit('message', data); //to all in room 
        }
    });
    socket.on('ping', function (data) {
        socket.emit('pong', data);
    });
    socket.on("joinRoom", function (roomName) {
        joinRoom(socket, roomName);   
    });
    socket.on("getUsers", function (roomName) {
        var users = getUsers(roomName);
        socket.emit("getUsers", users);
    });
    socket.on("getRooms", function () {
        var rooms = getRooms(socket);
        socket.emit("getRooms", rooms);
    });
    socket.on("getRoom", function (room) {
        var rooms = getRoom(socket, room);
        socket.emit("getRoom", rooms);
    });
    socket.on("disconnect", function () {
        var user = getUser(socket);

        //leave room
        if (user) {
            var room = rooms[user.room];
            if (room) room.leave(socket, user);
        }
        removeAllEmptyRooms();

        //note: socket may already be null, join room will handle that
        joinRoom(socket, "theVoid");//go to a room as to leave the current room he is in to trigger left room.
        
        //remove user
        //todo: bug Unaught exception: TypeError: Cannot read property 'name' of undefined
        //cause: multithreaded? or deleting when there are 2 or more and the "I" count gets messed up after splice
        //issue?: splice in forloop
        //maybe have a global garbge collector
        //or no list at all
        //or re use list item that are null
        
      
        if (user) {
            io.sockets.emit("userDisconnected", { id: socket.id, name: user.name, sender: "system" });
            io.sockets.emit("message", user.name + " userDisconnected");
            var i = users.indexOf(user);
            users.splice(i, 1);

            var room = rooms[user.room];
            if (room)
                room.leave(socket, user);
           
        }


    });
   
}

var getUser = function (socket) {
    if (!socket) return null;
    
    for (var i = 0; i < users.length; ++i) {
        
        if (users[i].socketid === socket.id) {
            return users[i];
        }
    }
}
var getUsers = function (room) {
    var userList = [];
    for (var i = 0; i < users.length; ++i) {
        var user = users[i];
        if (user.room === room || !room) {
            debug(user);
            userList.push(user);
        }
    }
    return userList;
}
var getRooms = function (socket) {
    var roomList = [];
    
    for (var i = 0; i < users.length; ++i) {
        var user = users[i];
        var searchTerm = user.room;
        if (roomList.indexOf(searchTerm) == -1) {
            roomList.push(user.room);
        }
    }
    return roomList;
}

//todo: user not have room setting, pull it out of user? or set in room.users and user.room?


//todo: get room data
//var roomData = { name: roomName, users: usersInRoom };
//todo: add state to room?
//todo: add room state changed, such as new user or state changed
var getRoom = function (socket, roomName) {
    var user = getUser(socket);
    
    if (!roomName) roomName = user.room;
    var usersInRoom = getUsers(roomName);
    var roomData = { name: roomName.toString(), users: usersInRoom };
    // if (roomName == 'lobby')        roomData.users = [];
    return roomData;
}

//todo: simplify
//maybe send left/entered msg only and let the client pull the room list
var joinRoom = function (socket, roomName) {
    var user = getUser(socket);
    
    //todo:bug Unaught exception: TypeError: Cannot read property 'room' of undefined
    if (typeof user == 'undefined') return;
    
    var oldRoom = user.room;
    if (oldRoom === roomName) {
        socket.emit("message", "You are already in " + roomName);
        return;
    }
    
    //leave old rooms
    if (oldRoom) {
        //socket.emit('message', socket.id + " leave Room (self) " + oldRoom);
        socket.leave(oldRoom);

        //leave old room
        if (rooms[oldRoom]) {
            rooms[oldRoom].leave(socket, user);    
        }
    }
 
    user.room = roomName;
    user.roomEnterTimeStamp = new Date();
    
    socket.join(roomName);
      
    //log to console
    console.log("joinRoom: " + user.name + " " + user.room);
    
    //if matchmaking room, try match
    if (roomName == 'lobby')
        findOpenRoom(socket, user);

    removeAllEmptyRooms();
};
var removeAllEmptyRooms = function() {
    // remove all empty rooms
    for (var i in rooms) {
        var room = rooms[i];
        if (room.length == 0) {
            room.dispose();
            var j = rooms.indexOf(room);
            rooms.splice(j, 1);
        }
    }
}
var findOpenRoom = function (socket, user) {
    //find empty room to join
    for (var i in rooms) {
        var room = rooms[i];
        if (!room.isClosed) {
            room.join(socket, user);
            return;
        }
    }
    //if none, create it
    var newRoom = Math.floor(Math.random() * (2147483640 - 0 + 1) + 0);
    rooms[newRoom] = new Room(newRoom);
    //join room
    rooms[newRoom].join(socket, user);
}
function Room(name) {
    var _this = this;
    this.name = name;
    this.users = [];
    this.isClosed = false;

    this.join = function (socket, user) {
        //leave old room - socket
        socket.leave(user.room);
        //join room - socket
        socket.join(_this.name);
        user.room = _this.name;

        //join room - game
        this.users.push(user);
        
        //create game player
        var player = new PayTheKingPlayer(user.name);
        player.id = user.id;
        player.avatar = user.avatar;
        this.payTheKingGame.join(player);
    }
    this.leave = function (socket,user) {
        //leave socket room 
        socket.leave(user.room);

        //leave game room 
        if (user) {
            user.room = null;
            var i = this.users.indexOf(user);
            this.users.splice(i, 1);
        }

        //note: for now leave the player there so there are stil players when someone wins even if they left
        var player = this.payTheKingGame.getPlayer(user.id);
        if (player) {
            this.payTheKingGame.leave(player);
        }
    }
    this.pay = function (playerId, amount) {
        //find player
        for (var i in _this.payTheKingGame.players) {
            var player = _this.payTheKingGame.players[i];
            if (player.id == playerId) {
                //pay
                _this.payTheKingGame.pay(player, amount);
            }
        }
    }
    this.gameEvent = function (event) {
        var eventName = event.event;
        
        if (eventName == 'start')
            _this.isClosed = true;
        
        if (io.sockets) {
            //console.log('payTheKingGame event:' + event.event);

            //note: could be optimized and send what has changed
            var stateData = {
                kingState: _this.payTheKingGame.kingState,
                players: _this.payTheKingGame.players,
                state: _this.payTheKingGame.state,
                messageDetails: _this.payTheKingGame.messageDetails,
                messageTitle: _this.payTheKingGame.messageTitle,
                winner: _this.payTheKingGame.winner,
                roundDuration: _this.payTheKingGame.roundDuration,
                roundTimeElapsed: _this.payTheKingGame.roundTimeElapsed
            }
            if (eventName == 'join' || eventName == 'leave' || eventName == 'start' || eventName == 'startRound' || eventName == 'endRound' || eventName == 'endGame')
                io.sockets.to(_this.name).emit('sync', eventName, stateData);
            if (event.event == 'roundTimeElapsed')
                io.sockets.to(_this.name).emit('sync', eventName, {
                    roundDuration: _this.payTheKingGame.roundDuration,
                    roundTimeElapsed: _this.payTheKingGame.roundTimeElapsed
                });
            if (event.event == 'offer')
                io.sockets.to(_this.name).emit('message', event.player.name + ' offered: ' + event.value);
        }
    }
    this.dispose = function (){
        _this.users = [];
        _this.payTheKingGame.onEvent = null;
        //this.payTheKingGame.dispose();
    }
    this.payTheKingGame = new PayTheKingGame(this.name);
    this.payTheKingGame.onEvent = this.gameEvent;
}


