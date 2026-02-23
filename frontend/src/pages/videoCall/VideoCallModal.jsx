import React, { useCallback, useEffect, useMemo } from "react";
import useVideoCallStore from "../../store/videoCallStore";
// import videoCallModal from "./videoCallModal";
import useUserStore from "../../store/useUserStore";
import useThemeStore from '../../store/themeStore'
import {FaPhoneSlash,FaMicrophone,FaMicrophoneSlash,FaVideo} from 'react-icons/fa'
import { useRef } from "react";
const VideoCallModal = ({ socket }) => {
  const {
    currentCall,
    incomingCall,
    isCallActive,
    setPeerConnection,
    setCallModalOpen,
    setLocalStream,
    setRemoteStream,
    callType,
    localStream,
    remoteStream,
    setIncomingCall,
    addIceCandidate,
    iceCandidatesQueue,
    isVideoEnabled,
    toggleVideo,
    setCallActive,
    peerConnection,
    toggleAudio,
    clearIncomingCall,
    isCallModalOpen,
    processQueuedIceCandidates,
    callStatus,
    isAudioEnabled,
    setCurrentCall,
    setCallType,
    setCallStatus,
    endCall,
  } = useVideoCallStore();
  const { user } = useUserStore();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const {theme }=useThemeStore();

  const rtcConfig = {
    iceServers: [
      {
        urls: "stun:stun.1.google.com:19302",
      },
      {
        urls: "stun:stun.2.google.com:19302",
      },
      {
        urls: "stun:stun.3.google.com:19302",
      },
    ],
  };

  const displayInfo = useMemo(()=>{
    if(incomingCall && !isCallActive){
return{
  name:incomingCall.callerName,
avatar:incomingCall.callerAvatar
}
    }

    else if(currentCall){
      return {
        name:currentCall.participantName,
        avatar:currentCall.participantAvatar
      }
    }

    return null ;

  },[isCallActive,incomingCall,currentCall]);

//connection detection 
  useEffect(()=>{
    if(peerConnection && remoteStream){
      console.log("both peer connection and remote stream is available")
setCallStatus("connected")
setCallActive("true")
    }
  },[setCallActive,setCallStatus,peerConnection,remoteStream])

//setUp local video stream and localstream 
useEffect(()=>{
  if(!localStream && localVideoRef.current){
    localVideoRef.current.srcObject=localStream;
  }
},[localStream])

//setup remote video stream when remote stream changes
useEffect(() => {
  if (!remoteStream && remoteVideoRef.current) {
    remoteVideoRef.current.srcObject = localStream;
  }
}, [remoteStream]);

//initialize media stream 
const initializeMedia = async(video=true)=>{
  try{
const stream = await navigator.mediaDevices.getUserMedia({
  video:video?{width:640 , height:480}:false,
  audio:true,
})
console.log("Local media Streams ",stream,getTracks())
setLocalStream(stream)
return stream;
  }
  catch(error){
console.error("Media error  ",error)
throw error
  }
}

//create peer connection 
const createPeerConnection = (stream,role)=>{
  const pc =  new RTCPeerConnection(rtcConfig)
  //add local tracks immediately 
  if(stream){
    stream.getTracks().forEach((track)=>{
      console.log(`${role} adding ${track.kind} track `,track.id.slice(0,8))
    })
  }


//handle ice candidate 
pc.onicecandidate =(event)=>{
  if(event.candidate && socket){
    const participantId = currentCall?.participantId || incomingCall?.callerId;
    const callId = currentCall?.callId || incomingCall?.callId;
    if(participantId && callId){
      socket.emit("webrtc_ice_candidate",{
        candidate:event.candidate,
        receiverId:participantId,
        callId:callId
      })
    }
  }
}

//handle remote stream 





pc.ontrack =(event)=>{
  if(event.streams && stream.events[0]){
    setRemoteStream(event.streams[0])
  }
  else{
    const stream = new MediaStream([event.track])
    setRemoteStream(stream)
  }
}

pc.onconnectionstatechange=()=>{
  console.log(`role ${role} :connection state`,pc.onconnectionState)
  if(pc,onconnectionState === 'failed'){
    setCallStatus("failed")
    setTimeout(handleEndCall,2000)
  }
}



pc.oniceconnectionstatechange=()=>{
  console.log(`${role} :Ice State `,pc.iceConnectionState)
}

pc.onsignalingstatechange=()=>{
  console.log(`${role}: Signaling State `,pc.signalingState)
}
setPeerConnection(pc)
return pc;
}




//initialize call after acceptance 

const initializeCallerCall=async()=>{
  try {
    setCallStatus("connecting")
    const stream = await initializeMedia(callType==='video')
    //create peer connection with offer 
    const pc = createPeerConnection(stream,"CALLER")
    const offer = await pc.createOffer({
      offerToReceiveAudio:true,
      offerToReceiveVideo:callType==='video'
    })
    await pc.setLocalDescription(offer);
    socket.emit("webrtc_offer",{
      offer,
      receiverId:currentCall?.participantId,
      callId:currentCall?.callId
    })
  } catch (error) {
    console.error("CALLER ERRROR ",error)
    setCallStatus("failed")
    setTimeout(handleEndCall, 2000);
  }
}

//receiver
const handleAnswerCall=async()=>{
  try {
    setCallStatus("connecting");
    const stream = await initializeMedia(callType === "video");
    //create peer connection with offer
   createPeerConnection(stream, "RECEIVER");
    socket.emit("accept_call", {
      callerId: incomingCall?.callerId,
      callId: incomingCall?.callId,
      receiverinfo: {
        username: user?.username,
        ProfilePicture: user?.ProfilePicture,
      },
    });

    setCurrentCall({
      callId:incomingCall?.callId,
      participantId:incomingCall?.callerId,
      participantName:incomingCall?.callerName,
      participantAvatar:incomingCall?.callerAvatar
    })
    clearIncomingCall()
  } catch (error) {
    console.error("Receive error ",error)
    handleEndCall()
  }
}

const handleRejectCall = ()=>{
  if(incomingCall){
    socket.emit("reject_call",{
      callerId:incomingCall?.callerId,
      callId:incomingCall?.callId,
    })
  }
  endCall()
}
const handleEndCall = () => {
  const participantId = currentCall?.participantId || incomingCall?.callerId;
  const callId = currentCall?.callId || incomingCall?.callId;
  if (participantId && callId) {
    socket.emit("end_call", {
      callId: callId,
      participantId: participantId,
    });
  }
  endCall();
};
//socket event listener 
useEffect(()=>{
  if (!socket) return;
  //call accepted caller flow
  const handleCallAccepted = ({ receiverName }) => {
    if (currentCall) {
      setTimeout(() => {
        initializeCallerCall;
      }, 5000);
    }
  };

  const handleCallRejected = () => {
    setCallStatus("rejected");
    setTimeout(endCall, 2000);
  };
  const handleCallEnded = () => {
    endCall();
  };

  const handleWebRTCOffer = async ({ offer, senderId, callId }) => {
    if (!peerConnection) return;

    try {
      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(offer)
      );
      //process queued ICE candidate
      await processQueuedIceCandidates();
      // create answer
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      socket.emit("webrtc_answer", {
        answer,
        receiverId: senderId,
        callId,
      });

      console.log("Answer send waiting for ice candidates");
    } catch (error) {
      console.error("Receiver offer error ", error);
    }
  };

  //receiver answer caller
  const handleWebRTCAnswer = async ({ answer, senderId, callId }) => {
    if (!peerConnection) return;
    if (peerConnection.signalingState === "closed") {
      console.log("Caller: Peer connection is closed");
      return;
    }

    try {
      //current caller signing
      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
      //process queued the ICEcandidate
      await processQueuedIceCandidates();
      //check receiver
      const receivers = peerConnection.getReceivers();
      console.log("Receiver ", receivers);
    } catch (error) {
      console.error("caller answer error ", error);
    }
  };
  const handleWebRTCIceCandidates = async ({ candidate, senderId }) => {
    if (peerConnection && peerConnection.signalingState !== "closed") {
      if (peerConnection.remoteDescription) {
        try {
          await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
          console.log("ice candidate added ");
        } catch (error) {
          console.error("ice candidate error ", error);
        }
      } else {
        console.log("Queueing ice candidates");
        addIceCandidate(candidate);
      }
    }
  };
  //register all events
  socket.on("call_accepted", handleCallAccepted);
  socket.on("call_rejected", handleCallRejected);
  socket.on("call_ended", handleCallEnded);
  socket.on("webrtc_offer", handleWebRTCOffer);
  socket.on("webrtc_answer", handleWebRTCAnswer);
  socket.on("webrtc_ice_candidate", handleWebRTCIceCandidates);

  console.log("socket listeners registered")
  return ()=>{
     socket.off("call_accepted", handleCallAccepted);
     socket.off("call_rejected", handleCallRejected);
     socket.off("call_ended", handleCallEnded);
     socket.off("webrtc_offer", handleWebRTCOffer);
     socket.off("webrtc_answer", handleWebRTCAnswer);
     socket.off("webrtc_ice_candidate", handleWebRTCIceCandidates);
  }
},[socket,peerConnection,currentCall,incomingCall,user])

if (!isCallModalOpen && incomingCall)return null;

const shouldShowActiveCall = isCallActive|| callStatus==='calling' || callStatus ==='connecting'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-45">
      <div
        className={`relative w-full  h-full max-w-4xl max-h-3xl rounded-lg overflow-hidden ${
          theme === "dark" ? "bg-gray-900" : "bg-white"
        }`}
      >
        {/* incomingCall ui */}
        {incomingCall && !isCallActive && (
          <div className="flex flex-col items-center justify-center h-full p-8 ">
            <div className="text-center mb-8">
              <div className="w-32 h-32 rounded-full bg-gray-300 mx-auto mb-4 overflow-hidden">
                <img
                  src={displayInfo?.avatar}
                  alt={displayInfo?.name}
                  className="w-full h-full object-cover"
                  onError={(e)=>{
                    e.target.src='/placeholder.svg'
                  }}
                />
              </div>
              <h2
                className={`text-2xl font-semibold mb-2 ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                {displayInfo?.name}
              </h2>
              <p
                className={`text-lg ${
                  theme === "dark" ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Incoming {callType} call...
              </p>
            </div>

            <div className="flex space-x-6 ">
              <button
                className="w-16 h-16  bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors"
                onClick={handleRejectCall}
              >
                <FaPhoneSlash className="w-6 h-6" />
              </button>

              <button
                className="w-16 h-16 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center text-white transition-colors"
                onClick={handleAnswerCall}
              >
                <FaVideo className="w-6 h-6 " />
              </button>
            </div>
          </div>
        )}

        {/* Active Call Ui */}
        {shouldShowActiveCall && (
          <div className="relative w-full h-full">
            {callType === "video" && (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className={`w-full h-full object-cover bg-gray-800 ${
                  remoteStream ? "block" : "hidden"
                }`}
                src=""
              ></video>
            )}

            {/* Avatar and status display
             */}

            {!remoteStream && callType !== "video" && (
              <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-32 h-32 rounded-full bg-gray-600 mx-auto mb-4 overflow-hidden">
                    <img
                      src={displayInfo?.avatar}
                      alt={displayInfo?.name}
                      className="w-full h-full object-cover "
                    />
                  </div>
                  <p className="text-white text-xl ">
                    {callStatus === "calling"
                      ? `Calling ${displayInfo?.name}...`
                      : callStatus === "connecting"
                      ? "connecting..."
                      : callStatus === "connected"
                      ? displayInfo?.name
                      : callStatus === "failed"
                      ? "Connection failed"
                      : displayInfo?.name}
                  </p>
                </div>
              </div>
            )}

            {/* local video (picture in picture) */}
            {callType === "video" && localStream && (
              <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg border-2 overflow-hidden border-white">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                ></video>
              </div>
            )}

            {/* call status */}
            <div className="absolute top-4 left-4">
              <div
                className={`px-4 py-2 rounded-full ${
                  theme === "dark" ? "bg-gray-800" : "bg-white"
                } bg-opacity-75`}
              >
                <p
                  className={`text-sm ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  {callStatus === "connected" ? "Connected" : callStatus}
                </p>
              </div>
            </div>

            {/* call controls */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 ">
              <div className="flex space-x-4">
                {callType === "video" && (
                  <button
                  onClick={toggleVideo}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                      isVideoEnabled
                        ? "bg-gray-600 hover:bg-gray-700 text-white"
                        : "bg-red-500 hover:bg-red-600 text-white"
                    }`}
                  >
                    {isVideoEnabled ? (
                      <FaVideo className="w-5 h-5" />
                    ) : (
                      <FaVideoSlash className="w-5 h-5" />
                    )}
                  </button>
                )}
                <button
                onClick={toggleAudio}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                    isAudioEnabled
                      ? "bg-gray-600 hover:bg-gray-700 text-white"
                      : "bg-red-500 hover:bg-red-600 text-white"
                  }`}
                >
                  {isAudioEnabled ? (
                    <FaMicrophone className="w-5 h-5" />
                  ) : (
                    <FaMicrophoneSlash className="w-5 h-5" />
                  )}
                </button>

                <button
                  className="w-16 h-16  bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors"
                  onClick={handleEndCall}
                >
                  <FaPhoneSlash className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        )}

        {callStatus === "calling" && (
          <button
            className="absolute top-4 right-4 w-8 h-8  bg-gray-600 hover:bg-gray-700 rounded-full flex items-center justify-center text-white transition-colors"
            onClick={handleEndCall}
          >
            <FaPhoneSlash className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );





};

export default VideoCallModal;

