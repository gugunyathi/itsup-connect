import { useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CallDialogProps {
  open: boolean;
  onClose: () => void;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isVideo: boolean;
  isCalling: boolean;
  contactName: string;
  contactAvatar?: string;
}

export const CallDialog = ({
  open,
  onClose,
  localStream,
  remoteStream,
  isVideo,
  isCalling,
  contactName,
  contactAvatar,
}: CallDialogProps) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localAudioRef = useRef<HTMLAudioElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (localStream) {
      if (isVideo && localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
      } else if (localAudioRef.current) {
        localAudioRef.current.srcObject = localStream;
      }
    }
  }, [localStream, isVideo]);

  useEffect(() => {
    if (remoteStream) {
      if (isVideo && remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      } else if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = remoteStream;
      }
    }
  }, [remoteStream, isVideo]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <div className="flex flex-col h-full">
          <div className="flex-1 relative bg-muted rounded-lg overflow-hidden">
            {isVideo ? (
              <>
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="absolute bottom-4 right-4 w-48 h-36 object-cover rounded-lg border-2 border-border"
                />
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-4">
                  <Avatar className="w-32 h-32 mx-auto">
                    <AvatarImage src={contactAvatar} />
                    <AvatarFallback className="text-4xl bg-primary text-primary-foreground">
                      {contactName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-2xl font-semibold">{contactName}</h3>
                    <p className="text-muted-foreground">
                      {isCalling ? "Calling..." : "In call"}
                    </p>
                  </div>
                </div>
              </div>
            )}
            <audio ref={localAudioRef} autoPlay muted />
            <audio ref={remoteAudioRef} autoPlay />
          </div>

          <div className="flex items-center justify-center gap-4 mt-4">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full w-12 h-12"
            >
              <Mic className="h-5 w-5" />
            </Button>
            {isVideo && (
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full w-12 h-12"
              >
                <Video className="h-5 w-5" />
              </Button>
            )}
            <Button
              variant="destructive"
              size="icon"
              className="rounded-full w-12 h-12"
              onClick={onClose}
            >
              <PhoneOff className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
