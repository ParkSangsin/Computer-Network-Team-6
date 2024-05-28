// socket 선언
let socket = io()

// 접속 (자동 수신)
socket.on('connect', function() {
  // 이름 입력
  let name = prompt('반갑습니다!', '')

  // 이름이 빈칸인 경우
  if(!name) {
    name = '익명'
  }

  // 서버에 새로운 유저 알림 
  socket.emit('newUser', name)
})

// 서버로부터 데이터 받은 경우 (갱신)
socket.on('update', function(data) {
  // html 문서에서 id가 'chat'인 요소를 찾아 chat 변수에 저장
  let chat = document.getElementById('chat')

  // 새로운 div를 생성하여 메세지 표시 준비 (요소를 동적으로 생성)
  let message = document.createElement('div')

  // 서버로 받은 데이터를 텍스트 노드로 생성
  let node = document.createTextNode(`${data.name}: ${data.message}`)

  let className = ''

  // 타입에 따라 적용할 클래스를 다르게 지정
  switch(data.type) {
    case 'message':
      className = 'other'
      break

    // 새로운 유저 연결 시
    case 'connect':
      className = 'connect'
      break

    case 'disconnect':
      className = 'disconnect'
      break
  }

  // 클래스 이름 추가
  message.classList.add(className)

  // 새로운 메세지 추가
  message.appendChild(node)
  chat.appendChild(message)
})

// 'Enter'키를 통해 메세지 전송
document.addEventListener("DOMContentLoaded", function() { // 이벤트 리스너 추가
  var input = document.getElementById("input_message");

  input.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
      send();
    }
  });
});

// 메시지 전송 함수
function send() {
  // 입력되어있는 데이터 가져오기
  let message = document.getElementById('input_message').value
  
  // 가져왔으니 빈칸으로 변경
  document.getElementById('input_message').value = ''

  // 내가 전송할 메시지 클라이언트에게 표시
  let chat = document.getElementById('chat')
  let msg = document.createElement('div')
  let node = document.createTextNode(message)
  msg.classList.add('me')
  msg.appendChild(node)
  chat.appendChild(msg)

  // 서버로 데이터와 함께 message 이벤트 전달 
  socket.emit('message', {type: 'message', message: message})
}


socket.on('updateUserList', function (users) {
    const userList = document.getElementById('userList')
    userList.innerHTML = ''
    users.forEach(function (user) {
        const li = document.createElement('li')
        li.textContent = user
        userList.appendChild(li)
    })
})