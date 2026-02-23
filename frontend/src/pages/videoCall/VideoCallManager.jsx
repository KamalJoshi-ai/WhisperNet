 import React, { useCallback, useEffect } from 'react'
import useVideoCallStore from '../../store/videoCallStore'
import videoCallModal from './VideoCallModal'
 import useUserStore from '../../store/useUserStore'
 const VideoCallManager = (socket) => {
    const {
      setCallModalOpen,
      setIncomingCall,
      setCurrentCall,
      setCallType,
      setCallStatus,
      endCall
    } = useVideoCallStore();
    const {user}=useUserStore();

    useEffect(()=>{
        const handleIncomingCall =({callerId,callerName,callerAvatar,callType,callId})=>{
              setIncomingCall({
                callerId,
                callerName,
                callerAvatar,
                callId
              })
              setCallType(callType)
              setCallModalOpen(true)
              setCallStatus('ringing')
        }

        const handleCallEnded = ({reason})=>{
            setCallStatus("failed")
            setTimeout(()=>{
               endCall();
            },2000)
        }
        socket.on("incoming_call",handleIncomingCall)
        socket.on("call_failed",handleCallEnded)
        return()=>{
             socket.off("incoming_call", handleIncomingCall);
             socket.off("call_failed", handleCallEnded);
        }
        
    },[socket,setIncomingCall,setCallModalOpen,endCall,setCallStatus,setCallType])

    //memoized function to initiate call
     const initiateCall=useCallback((receiverId,receiverName,receiverAvatar,callType='video')=>{
        const callId =`${user?._id}-${receiverId}-${Date.now()}` 

        const callData= {
            callId,
            participantId:receiverId,
            participantName:receiverName,
            participantAvatar:receiverAvatar,
        }

        setCurrentCall(callData)
        setCallType(callType)
        setCallStatus("calling")
        setCallModalOpen(true)
    //emit the call initiate
        socket.emit("initiate_call",{
            callerId:user?._id,
            receiverId,
            callerInfo:{
                username:user?._username,
                ProfilePicture:user?._ProfilePicture
            },
            callId
        })

         },[
            user,socket,setCurrentCall,setCallType,setCallModalOpen,setCallStatus
         ])
//expose the intiate call function to store
useEffect(()=>{
useVideoCallStore.getState().initiateCall=initiateCall
},[initiateCall])         


   return (
     <videoCallModal socket={socket}/>
   )
 }
 
 export default VideoCallManager