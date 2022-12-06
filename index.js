'use strict';
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const cookieParser = require('cookie-parser');
const io = require('socket.io')(http);
const mymodule = require('./my-module.js');
let que = [];

//För att kunna köras i iframe?
app.set('trust proxy', 1);

app.use(cookieParser());
app.use(express.urlencoded({extended: true}));

let server = http.listen(process.env.PORT || 5000, () => {
    console.log('server is running on port ' + server.address().port);
});

app.get('/', function(req,res) {

    let cookie = req.cookies.nickName;
	let cookie2 = req.cookies.nickName2;

    if(cookie==null && cookie2==null) {
        res.sendFile(__dirname + '/loggain.html');
    }
    else if(cookie==='secretAdmin' || cookie2==='secretAdmin') {
        res.sendFile(__dirname + '/secretAdmin.html');
        
    }
    else {
        res.sendFile(__dirname + '/index.html');
        
    }


}); 

app.post('/', function (req,res) {
    let cookie = req.cookies.nickName;
	let cookie2 = req.cookies.nickName2;

    if(cookie==null && cookie2==null) {
        res.cookie('nickName', req.body.nickname, { maxAge: 1000*60*60*12, httpOnly: false, secure: true, sameSite: "none"});
		res.cookie('nickName2', req.body.nickname, { maxAge: 1000*60*60*12, httpOnly: false});
    }

    res.redirect('/');

});

app.get('/favicon.ico', function(req,res) {
    res.sendFile(__dirname + '/favicon.ico');
});

//Socketfunktioner....
io.on('connection', function(socket) {

    console.log('användare med id=' + socket.id + ' anslöt');

    let cookieString = socket.handshake.headers.cookie;
    let cookielist = mymodule.parseCookies(cookieString);

    if(cookielist.nickName!=null) {
        socket.nickName = cookielist.nickName;        
    }
	if(cookielist.nickName2!=null) {
        socket.nickName = cookielist.nickName2;        
    }

    io.emit('updateList', que);

    socket.on('addGroup', function(data) {
        //let time = mymodule.getTimeStamp();
        //io.emit('changeBackground', {"imageid" : data.backgroundId, "time": time, "name": socket.nickName});

        //Kolla om redan i kö... annars
        let pos = { grupp: socket.nickName, msg: data.msg};    
        que.push(pos);

        io.emit('updateList', que);
      
    });

    socket.on('deleteGroup', function (data) {

        //Ta bort ur kö och uppdatera

        for(let i=0; i<que.length; i++) {
            if(que[i].grupp === data.grupp) {
                que.splice(i,1);
            }
        }

        io.emit('updateList', que);

    });

    socket.on('disconnect', ()=> {
        console.log(socket.nickName + ' disconnected');
    });


});

app.use('/public', express.static(__dirname + '/public'));

app.use(function(req,res) {
    res.status(404);
    res.send('<h1>404 Page not found</h1><p>Dumkopf</p>');
});