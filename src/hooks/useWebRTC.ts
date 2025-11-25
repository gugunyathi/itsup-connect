import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type CallType = "voice" | "video" | null;

export const useWebRTC = () => {
  const [callType, setCallType] = useState<CallType>(null);
  const [isInCall, setIsInCall] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [remoteUserId, setRemoteUserId] = useState<string | null>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);
  const remoteStream = useRef<MediaStream | null>(null);
  const channelRef = useRef<any>(null);
  const { user } = useAuth();

  const initializePeerConnection = () => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    });

    pc.onicecandidate = (event) => {
      if (event.candidate && channelRef.current) {
        channelRef.current.send({
          type: "broadcast",
          event: "ice-candidate",
          payload: {
            candidate: event.candidate,
            from: user?.id,
          },
        });
      }
    };

    pc.ontrack = (event) => {
      remoteStream.current = event.streams[0];
    };

    peerConnection.current = pc;
    return pc;
  };

  const startCall = async (type: "voice" | "video", targetUserId: string) => {
    try {
      setCallType(type);
      setIsCalling(true);
      setRemoteUserId(targetUserId);

      // Get local media
      const constraints = {
        audio: true,
        video: type === "video",
      };
      localStream.current = await navigator.mediaDevices.getUserMedia(constraints);

      // Initialize peer connection
      const pc = initializePeerConnection();
      localStream.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStream.current!);
      });

      // Create offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Send offer through signaling channel
      const channel = supabase.channel(`call:${targetUserId}`);
      channelRef.current = channel;

      channel.on("broadcast", { event: "answer" }, async ({ payload }) => {
        if (payload.to === user?.id) {
          await pc.setRemoteDescription(new RTCSessionDescription(payload.answer));
          setIsInCall(true);
          setIsCalling(false);
        }
      });

      channel.on("broadcast", { event: "ice-candidate" }, async ({ payload }) => {
        if (payload.to === user?.id && payload.candidate) {
          await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
        }
      });

      await channel.subscribe();

      channel.send({
        type: "broadcast",
        event: "offer",
        payload: {
          offer,
          from: user?.id,
          to: targetUserId,
          callType: type,
        },
      });
    } catch (error) {
      console.error("Error starting call:", error);
      endCall();
    }
  };

  const answerCall = async (offer: RTCSessionDescriptionInit, callerId: string) => {
    try {
      setRemoteUserId(callerId);

      // Get local media
      const constraints = {
        audio: true,
        video: callType === "video",
      };
      localStream.current = await navigator.mediaDevices.getUserMedia(constraints);

      // Initialize peer connection
      const pc = initializePeerConnection();
      localStream.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStream.current!);
      });

      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      // Send answer
      if (channelRef.current) {
        channelRef.current.send({
          type: "broadcast",
          event: "answer",
          payload: {
            answer,
            from: user?.id,
            to: callerId,
          },
        });
      }

      setIsInCall(true);
    } catch (error) {
      console.error("Error answering call:", error);
      endCall();
    }
  };

  const endCall = () => {
    // Stop all tracks
    localStream.current?.getTracks().forEach((track) => track.stop());
    remoteStream.current?.getTracks().forEach((track) => track.stop());

    // Close peer connection
    peerConnection.current?.close();

    // Clean up
    peerConnection.current = null;
    localStream.current = null;
    remoteStream.current = null;
    setIsInCall(false);
    setIsCalling(false);
    setCallType(null);
    setRemoteUserId(null);

    // Unsubscribe from channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  };

  useEffect(() => {
    if (!user) return;

    // Listen for incoming calls
    const channel = supabase.channel(`call:${user.id}`);
    channelRef.current = channel;

    channel.on("broadcast", { event: "offer" }, async ({ payload }) => {
      if (payload.to === user.id) {
        setCallType(payload.callType);
        setIsCalling(true);
        // Here you would show an incoming call UI
        // For now, auto-answer
        await answerCall(payload.offer, payload.from);
      }
    });

    channel.on("broadcast", { event: "ice-candidate" }, async ({ payload }) => {
      if (payload.to === user.id && peerConnection.current) {
        await peerConnection.current.addIceCandidate(
          new RTCIceCandidate(payload.candidate)
        );
      }
    });

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    startCall,
    endCall,
    isInCall,
    isCalling,
    callType,
    localStream: localStream.current,
    remoteStream: remoteStream.current,
  };
};
