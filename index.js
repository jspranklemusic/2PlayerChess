const express = require("express")
const app = express()
const http = require('http').createServer(app);
const url = require("url")
const fs = require("fs")
const path = require("path")
const port = 8080
const io = require('socket.io')(http);

let userCount = 0
let firstPlayer=""
let rooms={}

app.use(express.static('views'))

app.get('/',(req,res)=>{
    res.sendFile(__dirname + "/views/chess.html")
})


io.on('connection', (socket) => {
  let moveCt=0
  socket.emit("this-user",socket.id)
  console.log("socket.id: ",socket.id)
  let gameRoomId
  userCount++
  console.log("users: ",userCount)
    socket.on('disconnect', ()=>{
      userCount--
      console.log("users: ",userCount)
    })

    /*
    socket.on('username',name=>{
      socket.name=name
      if(userCount<2){
        io.in(gameRoomId).emit('username',socket.name)
        firstPlayer=name
      }
      else if(userCount==2){
        socket.emit('username',firstPlayer)
        socket.emit('rotate')
        io.emit('username2',socket.name
        )}
      
    })
    */

    socket.on('newroom',(name)=>{
      let newRoom = Math.random().toString(36).substr(2, 10).toUpperCase()
      rooms[newRoom]={first:name,firstID:socket.id}
      gameRoomId=newRoom
      socket.room=gameRoomId
      socket.name=name
      socket.join(newRoom,()=>{
        console.log(`${socket.name} has joined ${newRoom}!`)
        console.log(io.sockets.adapter.rooms[gameRoomId])
      })
      io.in(gameRoomId).emit('username',name)
      io.in(gameRoomId).emit('newroom',newRoom)
      
    
    })

    socket.on('get-current-time',(minsB,minsW,secsB,secsW,zeroB,zeroW)=>{
      rooms[gameRoomId].time={
        minsB:minsB,
        minsW:minsW,
        secsB:secsB,
        secsW:secsW,
        zeroB:zeroB,
        zeroW:zeroW
      }
      console.log(rooms[gameRoomId].time)
      io.in(gameRoomId).emit("get-current-time",
      rooms[gameRoomId].time.minsB,
      rooms[gameRoomId].time.minsW,
      rooms[gameRoomId].time.secsB,
      rooms[gameRoomId].time.secsW,
      rooms[gameRoomId].time.zeroB,
      rooms[gameRoomId].time.zeroW
      )
    })

    socket.on("game-options",(radioVal,plus5Val,colorVal,rematch,id)=>{
      if(radioVal){
        rooms[gameRoomId].options=
        {
          playerOneIsWhite:colorVal,
          timeControls:radioVal,
          plus5secs:plus5Val
        }
      }
      rooms[gameRoomId].options.playerOneIsWhite
      rooms[gameRoomId].options.timeControls
      rooms[gameRoomId].options.plus5secs

      io.in(gameRoomId).emit("game-options",
      rooms[gameRoomId].options.timeControls,
      rooms[gameRoomId].options.plus5secs,
      rooms[gameRoomId].options.playerOneIsWhite,
      rooms[gameRoomId].firstID,
      rematch,
      id
      )
      console.log(rooms[gameRoomId])

    })

    socket.on('validate',val=>{
      let roomsKeys = Object.keys(rooms)
      
      let valIsTrue = roomsKeys.some((room)=>{
        return room==val
      })

      socket.emit("validate",valIsTrue)
    })

    socket.on("checkmate",()=>{
      io.in(gameRoomId).emit("checkmate")
    })

    socket.on("drawn-game",()=>{
      io.in(gameRoomId).emit("drawn-game")
    })

    socket.on("send-current-position",(moveObj,moveCount)=>{
      if(rooms[gameRoomId]){
          rooms[gameRoomId].moveObj=moveObj
          rooms[gameRoomId].moveCount=moveCount
          console.log(rooms[gameRoomId].moveObj,rooms[gameRoomId].moveCount)
      }
      
    })

    socket.on('join', (room,user,restart,moveCtClient,rematch)=>{
      

      let user1=""
      let opponent=""
      let rejoin=false
      if(!restart){
      moveCt=moveCtClient
      console.log(moveCt)
      if(rooms[room].firstID!=""){
        rooms[room].second=user
        rooms[room].secondID=socket.id
        socket.emit('this-user',rooms[room].secondID)
        user1=user
        opponent=rooms[room].first
      }else{
        rooms[room].first=user
        rooms[room].firstID=socket.id
        user1=user
        socket.emit('this-user',rooms[room].firstID)
        opponent=rooms[room].second
        rejoin=true
      }
      
      socket.name=user
      socket.room=room
      gameRoomId=room
      socket.join(room,()=>{
        console.log(`${socket.name} has joined ${room}!`)
        console.log(io.sockets.adapter.rooms[gameRoomId])
      })

      
    
        
      //currentPosition[currentPosition.length-1]

    }
  
      
      if(io.sockets.adapter.rooms[gameRoomId].length==2){
        io.in(gameRoomId).emit('username2',
        user1,
        opponent,
        room,
        false,
        rejoin,
        rooms[gameRoomId].moveObj,
        rooms[gameRoomId].moveCount.toString()
        )
      }

    })

 
  
    socket.on('chat-msg', (msg) => {
      io.in(gameRoomId).emit('chat-msg',msg,socket.name)
    });

    socket.on('offer-draw', ()=>{
      socket.to(gameRoomId).emit('offer-draw')
    })

    socket.on("decline-draw",()=>{
    socket.to(gameRoomId).emit("decline-draw")
    })

    socket.on('move',(piece,pos,color,simulation,atk,server,move,pawnPromote)=>{
    moveCt++
    socket.to(gameRoomId).emit('move',piece,pos,color,simulation,atk,true,move,pawnPromote)
  })

    socket.on('resign',()=>{
      console.log("RESIGNED")
      socket.to(gameRoomId).emit('resign')
    })

    socket.on("disable-chat",()=>{
        socket.to(gameRoomId).emit("disable-chat")
    })
    socket.on("enable-chat",()=>{
      socket.to(gameRoomId).emit("enable-chat")
    })
    socket.on('request-rematch',(thisUserID)=>{
      socket.to(gameRoomId).emit('request-rematch',thisUserID)
    })

    socket.on('rematch-response',(val,id)=>{
     socket.to(gameRoomId).emit("rematch-response",val,id)
    })
  

    //GAME FUNCTIONS
  socket.on('disconnect',()=>{
    
    console.log(`${socket.id} has disconnected!`)
    
    if(io.sockets.adapter.rooms[gameRoomId]==undefined){
        delete rooms[gameRoomId]
        console.log(rooms)
    }else{
      let firstPlayerGone = Boolean(rooms[gameRoomId].firstID==socket.id)
      if(firstPlayerGone){
        rooms[gameRoomId].firstID=""
        rooms[gameRoomId].first=""
      }
      socket.to(gameRoomId).emit("p-disconnected",socket.name,firstPlayerGone)
      
    }
  })
  });



http.listen(process.env.PORT | port, ()=>{
    console.log(`Listening on port: ${port}`)
})
