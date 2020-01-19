let peer = require('simple-peer')
let socket = io()
const video = document.querySelector('video')
let client = {}

navigator.mediaDevices.getUserMedia({video:true, audio:true})
.then(stream =>{
      socket.emit("NewClient")
      video.srcObject = stream
      video.play()

      function InitPeer(type){
       let peer = new peer({initiator:(type == 'init')?true:false, stream: stream, trickle:false}) 
       peer.on('stream', function(stream){
           Createvideo(stream)
       })  
        peer.on('close',function(){
            document.getElementById("peervideo").remove();
            peer.destroy()
        })
        return peer
    }
      
     function MakePeer(){
         client.gotAnswer = false
         let peer = InitPeer('init')
         peer.on('signal', function(data){
             if (!client.gotAnswer){
                 socket.emit('offer',data)
             }
         })
         client.peer = peer
     }
     
     function FrontAnswer(offer){
         let peer = InitPeer('notInit')
         peer.on('signal',(data) =>{
             socket.emit('Answer',data)
         })
         peer.signal(offer)
     }
 
        function SignalAnswer(answer){
            client.gotAnswer = true
            let peer = client.peer
            peer.signal(answer)
        }

        function CreateVideo(stream){
            let video = documnent.createElement('video')
            video.id ='peervideo'
            video.srcObject = stream
            video.class = 'embed-responsive-item'
            document.querySelector('#peerDiv').appendChild(video)
            video.play()
        }

        function SessionActive(){
            document.write("Session Active :) Please Comeback later")
        }

        socket.on('BackOffer', FrontAnswer)
        socket.on('BackAnswer', SignalAnswer)
        socket.on('SessionActive', SessionActive)
        socket.on('CreatePeer', MakePeer)
})

.catch(err => document.write(err))

 