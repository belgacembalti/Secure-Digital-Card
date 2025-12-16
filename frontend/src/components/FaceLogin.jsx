import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, X } from 'lucide-react';

export default function FaceLogin({ onLogin, onCancel, buttonText = 'Login' }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [captured, setCaptured] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        startCamera();
        return () => {
            stopCamera();
        };
    }, []);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setError('');
        } catch (err) {
            console.error("Error accessing camera:", err);
            setError("Could not access camera. Please allow camera permissions.");
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const capture = () => {
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            // Set canvas dimensions to match video
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;

            context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
            const dataUrl = canvasRef.current.toDataURL('image/jpeg');
            onLogin(dataUrl);
        }
    };

    return (
        <div className="flex flex-col items-center space-y-4">
            <div className="relative w-full max-w-sm bg-black rounded-lg overflow-hidden aspect-video">
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />

                {error && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-red-500 p-4 text-center">
                        {error}
                    </div>
                )}
            </div>

            <div className="flex gap-4">
                <button
                    onClick={onCancel}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center gap-2"
                >
                    <X className="w-4 h-4" /> Cancel
                </button>
                {!error && (
                    <button
                        onClick={capture}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center gap-2"
                    >
                        <Camera className="w-4 h-4" /> {buttonText}
                    </button>
                )}
            </div>
        </div>
    );
}
