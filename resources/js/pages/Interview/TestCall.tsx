import { useEffect, useRef } from 'react';

type TestCallProps = {
    roomId: string;
};

export default function TestCall({ roomId }: TestCallProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const jitsiUrl = `https://meet.jit.si/${encodeURIComponent(roomId)}`;

    useEffect(() => {
        const start = async () => {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        };

        start();
    }, []);

    return (
        <div>
            <h1>Interview Room: {roomId}</h1>

            <video ref={videoRef} autoPlay muted playsInline />

            <p>Camera working (WebRTC next step)</p>

            <a href={jitsiUrl} target="_blank" rel="noreferrer">
                Join Jitsi meeting
            </a>
        </div>
    );
}
