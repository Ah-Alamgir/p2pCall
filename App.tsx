
import React, { useState, useEffect, useCallback } from 'react';
import { CallControls } from './components/CallControls';
import { VideoPlayer } from './components/VideoPlayer';
import { CopyIcon, PhoneIcon } from './components/Icons';

// PeerJS is loaded from CDN, so we declare it globally
declare const Peer: any;
type MediaConnection = any;

const App: React.FC = () => {
    const [peer, setPeer] = useState<any>(null);
    const [myId, setMyId] = useState<string>('');
    const [remoteId, setRemoteId] = useState<string>('');
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [call, setCall] = useState<MediaConnection | null>(null);
    const [inCall, setInCall] = useState<boolean>(false);
    const [isMuted, setIsMuted] = useState<boolean>(false);
    const [isVideoEnabled, setIsVideoEnabled] = useState<boolean>(true);
    const [isIdCopied, setIsIdCopied] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [connecting, setConnecting] = useState<boolean>(false);

    useEffect(() => {
        const initialize = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                setLocalStream(stream);

                const peerInstance = new (window as any).Peer();
                setPeer(peerInstance);

                peerInstance.on('open', (id: string) => {
                    setMyId(id);
                });

                peerInstance.on('call', (incomingCall: MediaConnection) => {
                    setConnecting(true);
                    incomingCall.answer(stream);
                    setCall(incomingCall);
                    setInCall(true);
                    incomingCall.on('stream', (remoteStream: MediaStream) => {
                        setRemoteStream(remoteStream);
                    });
                    incomingCall.on('close', () => {
                        handleEndCall();
                    });
                    setConnecting(false);
                });

                peerInstance.on('error', (err: any) => {
                    setError(`PeerJS Error: ${err.message}`);
                    console.error('PeerJS error:', err);
                });

            } catch (err) {
                console.error('Failed to get local stream', err);
                setError('Could not access camera and microphone. Please check permissions.');
            }
        };

        initialize();

        return () => {
            if (peer) {
                peer.destroy();
            }
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleMakeCall = useCallback(() => {
        if (!peer || !localStream || !remoteId) {
            setError("Cannot make a call. Ensure your ID is generated and you've entered a remote ID.");
            return;
        }
        setConnecting(true);
        const outgoingCall = peer.call(remoteId, localStream);

        if(!outgoingCall){
            setError("Failed to initiate call. The remote ID might be invalid.");
            setConnecting(false);
            return;
        }

        setCall(outgoingCall);
        

        outgoingCall.on('stream', (stream: MediaStream) => {
            setRemoteStream(stream);
            setInCall(true);
            setConnecting(false);
        });

        outgoingCall.on('close', () => {
            handleEndCall();
        });
        
        outgoingCall.on('error', (err: any) => {
            setError(`Call error: ${err.message}`);
            console.error("Call error:", err);
            setConnecting(false);
        });

    }, [peer, localStream, remoteId]);

    const handleEndCall = useCallback(() => {
        if (call) {
            call.close();
        }
        setCall(null);
        setRemoteStream(null);
        setInCall(false);
        setConnecting(false);
    }, [call]);

    const handleToggleMute = useCallback(() => {
        if (localStream) {
            localStream.getAudioTracks()[0].enabled = !localStream.getAudioTracks()[0].enabled;
            setIsMuted(!localStream.getAudioTracks()[0].enabled);
        }
    }, [localStream]);

    const handleToggleVideo = useCallback(() => {
        if (localStream) {
            localStream.getVideoTracks()[0].enabled = !localStream.getVideoTracks()[0].enabled;
            setIsVideoEnabled(!localStream.getVideoTracks()[0].enabled);
        }
    }, [localStream]);

    const handleCopyId = useCallback(() => {
        if (myId) {
            navigator.clipboard.writeText(myId);
            setIsIdCopied(true);
            setTimeout(() => setIsIdCopied(false), 2000);
        }
    }, [myId]);

    const renderPreCallUI = () => (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <div className="w-full max-w-md bg-dark-surface rounded-xl shadow-2xl p-8 space-y-6">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-dark-text">PeerConnect</h1>
                    <p className="text-dark-subtle mt-2">High-quality video calls, peer-to-peer.</p>
                </div>

                {error && <div className="bg-red-500/20 text-red-300 p-3 rounded-lg text-center text-sm">{error}</div>}

                <div className="space-y-2">
                    <label htmlFor="myId" className="text-sm font-medium text-dark-subtle">Your ID</label>
                    <div className="flex items-center bg-gray-900/50 rounded-lg">
                        <input id="myId" type="text" readOnly value={myId || 'Generating...'} className="flex-1 bg-transparent p-3 text-dark-text focus:outline-none"/>
                        <button onClick={handleCopyId} className="p-3 text-dark-subtle hover:text-brand-accent transition-colors duration-200">
                           {isIdCopied ? <span className="text-xs text-green-400">Copied!</span> : <CopyIcon />}
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <label htmlFor="remoteId" className="text-sm font-medium text-dark-subtle">Friend's ID</label>
                    <input 
                        id="remoteId" 
                        type="text" 
                        value={remoteId} 
                        onChange={(e) => setRemoteId(e.target.value)} 
                        placeholder="Enter friend's ID to call"
                        className="w-full bg-gray-900/50 p-3 rounded-lg text-dark-text focus:outline-none focus:ring-2 focus:ring-brand-accent"
                    />
                </div>

                <button 
                    onClick={handleMakeCall} 
                    disabled={!myId || !remoteId || connecting}
                    className="w-full bg-brand-secondary hover:bg-brand-primary disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 transform hover:scale-105"
                >
                    {connecting ? 'Connecting...' : <><PhoneIcon /> Call</>}
                </button>
            </div>
            <div className="mt-8 w-full max-w-md">
                 <h2 className="text-center text-dark-subtle mb-2">Your Preview</h2>
                 <div className="bg-dark-surface rounded-lg overflow-hidden aspect-video">
                     {localStream && <VideoPlayer stream={localStream} isMuted={true} isLocal={true} />}
                 </div>
            </div>
        </div>
    );

    const renderInCallUI = () => (
        <div className="relative w-screen h-screen">
            <div className="absolute inset-0 bg-black">
                {remoteStream ? (
                    <VideoPlayer stream={remoteStream} isMuted={false} isLocal={false} />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <p className="text-dark-subtle text-xl">Connecting...</p>
                    </div>
                )}
            </div>
            
            <div className="absolute bottom-16 right-4 sm:bottom-6 sm:right-6 w-48 h-auto aspect-video rounded-lg overflow-hidden shadow-2xl border-2 border-dark-surface z-20">
                 {localStream && <VideoPlayer stream={localStream} isMuted={true} isLocal={true} />}
            </div>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30">
                <CallControls 
                    isMuted={isMuted} 
                    isVideoEnabled={isVideoEnabled} 
                    onToggleMute={handleToggleMute} 
                    onToggleVideo={handleToggleVideo} 
                    onEndCall={handleEndCall} 
                />
            </div>
        </div>
    );
    
    return inCall ? renderInCallUI() : renderPreCallUI();
};

export default App;
