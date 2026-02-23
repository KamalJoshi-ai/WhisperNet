import {create} from 'zustand'
import {subscribeWithSelector} from 'zustand/middleware'

const useVideoCallStore = create(
  subscribeWithSelector((set, get) => ({
    //call state
    currentCall: null,
    incomingCall: null,
    isCallActive: false,
    callType: null,

    //mediaStream
    localStream: null,
    remoteStream: null,
    isVideoEnabled: false,
    isAudioEnabled: true,

    //webrtc

    peerConnection: null,
    iceCandidatesQueue: [],

    isCallModalOpen: false,
    callStatus: "idle", //idle,calling,ringing,connecting,connected,ended

    //Actions
    setCurrentCall: (call) => {
      set({ currentCall: call });
    },

    setIncomingCall: (call) => {
      set({ incomingCall: call });
    },
    setCallActive: (active) => {
      set({ isCallActive: active });
    },
    setLocalStream: (stream) => {
      set({ localStream: stream });
    },
    setRemoteStream: (stream) => {
      set({ remoteStream: stream });
    },
    setPeerConnection: (pc) => {
      set({ peerConnection: pc });
    },
    setCallModalOpen: (open) => {
      set({ isCallModalOpen: open });
    },
    addIceCandidate: (candidate) => {
      const { iceCandidateQueue } = get();
      set({ iceCandidatesQueue: [...iceCandidateQueue, candidate] });
    },
    setCallStatus: (status) => {
      set({ callStatus: status });
    },

    processQueuedIceCandidates: async () => {
      const { peerConnection, iceCandidateQueue } = get();
      if (
        peerConnection &&
        peerConnection.remoteDescription &&
        iceCandidateQueue.length > 0
      ) {
        // for (const candidate of iceCandidateQueue) {
        //   try {
        //     await peerConnection.addIceCandidate(
        //       new RTCIceCandidate(candidate)
        //     );
        //   } catch (error) {
        //     console.error("Ice Candidate error ", error);
        //   }
        // }

        await Promise.allSettled(
          iceCandidateQueue.map((c) =>
            peerConnection.addIceCandidate(new RTCIceCandidate(c))
          )
        );
        set({ iceCandidateQueue: [] });
      }
    },

    toggleVideo: () => {
      const { localStream, isVideoEnabled } = get();
      if (localStream) {
        const videoTrack = localStream.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.enabled = !isVideoEnabled;
          set({ isVideoEnabled: !isVideoEnabled });
        }
      }
    },

    toggleAudio: () => {
      const { localStream, isAudioEnabled } = get();
      if (localStream) {
        const audioTrack = localStream.getAudioTracks()[0];
        if (audioTrack) {
          audioTrack.enabled = !isAudioEnabled;
          set({ isAudioEnabled: !isAudioEnabled });
        }
      }
    },

    endCall: () => {
      const { localStream, peerConnection } = get();
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
      if (peerConnection) {
        peerConnection.close();
      }
      set({
        currentCall: null,
        incomingCall: null,
        isCallActive: false,
        callType: null,

        //mediaStream
        localStream: null,
        remoteStream: null,
        isVideoEnabled: false,
        isAudioEnabled: true,

        //webrtc

        peerConnection: null,
        iceCandidatesQueue: [],

        isCallModalOpen: false,
        callStatus: "idle",
      });
    },
    clearIncomingCall: () => {
      set({ incomingCall: null });
    },
  }))
);

export default useVideoCallStore