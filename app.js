// 모듈 불러오기
const express = require('express');
const socket = require('socket.io');
const http = require('http');
const fs = require('fs');

// express 객체 생성
const app = express();

// express http 서버 생성
const server = http.createServer(app);

let users = [];

// 서버를 8080 포트로 listen
server.listen(8080, function() {
  console.log('서버 실행 중..');
});

// 생성된 서버를 socket.io에 바인딩
const io = socket(server);

// static 폴더 내 파일을 html에서 사용 가능하게 하는 코드
app.use('/css', express.static('./static/css'));
app.use('/js', express.static('./static/js'));

// 경로에 접속 시 index.html 전송
app.get('/', function(request, response) {
  response.sendFile(__dirname + '/static/index.html');
});

// 유저가 웹소켓 연결 시 실행
io.sockets.on('connection', function(socket) {

  // 새로운 유저 접속 시 다른 소켓에게도 알려줌 
  socket.on('newUser', function(name) {
    console.log(name + ' 님이 접속하였습니다.');

    // 소켓에 이름 저장
    socket.name = name;
    users.push({ id: socket.id, name: name });
    io.emit('updateUserList', users.map(user => user.name));

    // 모든 소켓에 전송 
    io.sockets.emit('update', {type: 'connect', name: 'SERVER', message: name + '님이 접속하였습니다.'});
  });

  // 전송한 메시지 받기
  socket.on('message', function(data) {
    // 받은 데이터에 누가 보냈는지 이름을 추가
    data.name = socket.name;
    
    console.log(data);

    // 보낸 사람을 제외한 나머지 유저에게 메시지 전송
    socket.broadcast.emit('update', data);
  });

  // 접속 종료
  socket.on('disconnect', function() {
    const user = users.find(user => user.id === socket.id);
    if (user) {
      console.log(user.name + '님이 나가셨습니다.');
      users = users.filter(user => user.id !== socket.id);
      io.emit('updateUserList', users.map(user => user.name));

      // 나가는 사람을 제외한 나머지 유저에게 메시지 전송
      socket.broadcast.emit('update', {type: 'disconnect', name: 'SERVER', message: user.name + '님이 나가셨습니다.'});
    }
  });
});
