import React, { useState, useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from '@vladmandic/face-api';
import { useUser } from '@clerk/clerk-react';

const VerificationGate = ({ onVerificationSuccess }) => {
    const { user } = useUser();
    const [status, setStatus] = useState("loading"); // loading, first_time_setup, ready_to_verify, verifying, failed, uploading
    const [errorMsg, setErrorMsg] = useState('');
    const [referencePhotoUrl, setReferencePhotoUrl] = useState(null);
    const webcamRef = useRef(null);

    useEffect(() => {
        if (user?.primaryEmailAddress?.emailAddress) {
            checkUserSetup(user.primaryEmailAddress.emailAddress);
        }
    }, [user]);

    const loadModels = async () => {
        try {
            await Promise.all([
                faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
                faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
                faceapi.nets.faceRecognitionNet.loadFromUri('/models')
            ]);
        } catch (err) {
            console.error("Error loading face-api models", err);
            setErrorMsg("Failed to load facial recognition models.");
        }
    };

    const checkUserSetup = async (email) => {
        try {
            const res = await fetch(`http://localhost:5000/api/user/${email}`);
            const data = await res.json();

            if (data && data.referencePhotoUrl) {
                setReferencePhotoUrl(data.referencePhotoUrl);
                await loadModels();
                setStatus("ready_to_verify");
            } else {
                setStatus("first_time_setup");
            }
        } catch (err) {
            console.error(err);
            setErrorMsg("Error checking user profile.");
            setStatus("failed");
        }
    };

    const handleFirstTimeCapture = async () => {
        if (!webcamRef.current) return;
        setStatus("uploading");

        const imageSrc = webcamRef.current.getScreenshot();

        // Convert base64 to blob
        const fetchRes = await fetch(imageSrc);
        const blob = await fetchRes.blob();

        const formData = new FormData();
        formData.append('photo', blob, 'reference.jpg');
        formData.append('email', user.primaryEmailAddress.emailAddress);
        formData.append('name', user.fullName || "User");

        try {
            const res = await fetch('http://localhost:5000/api/upload-reference', {
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                setReferencePhotoUrl(data.user.referencePhotoUrl);
                await loadModels();
                setStatus("ready_to_verify");
            } else {
                setErrorMsg("Failed to upload reference photo.");
                setStatus("failed");
            }
        } catch (error) {
            console.error("Upload failed", error);
            setErrorMsg("Upload failed.");
            setStatus("failed");
        }
    };

    const handleVerification = async () => {
        if (!webcamRef.current || !referencePhotoUrl) return;
        setStatus("verifying");

        try {
            // Get Live Image Snapshot
            const liveImageSrc = webcamRef.current.getScreenshot();
            const liveImg = await faceapi.fetchImage(liveImageSrc);

            // Detect face in Live Image
            const liveDetection = await faceapi.detectSingleFace(liveImg).withFaceLandmarks().withFaceDescriptor();
            if (!liveDetection) {
                setErrorMsg("No face detected in live camera. Please try again.");
                setStatus("ready_to_verify");
                return;
            }

            // Fetch Reference Image securely without CORS issues by bouncing through proxy if needed, 
            // Cloudinary usually allows anonymous cross-origin.
            const refImgElem = new Image();
            refImgElem.crossOrigin = 'Anonymous';
            refImgElem.src = referencePhotoUrl;

            await new Promise((resolve, reject) => {
                refImgElem.onload = () => resolve();
                refImgElem.onerror = (e) => reject(e);
            });

            // Detect face in Reference Image
            const refDetection = await faceapi.detectSingleFace(refImgElem).withFaceLandmarks().withFaceDescriptor();
            if (!refDetection) {
                setErrorMsg("Could not detect a clear face in your reference photo. Please contact Admin.");
                setStatus("failed");
                return;
            }

            // Compare
            const distance = faceapi.euclideanDistance(liveDetection.descriptor, refDetection.descriptor);

            // usually a distance < 0.6 is a match.
            if (distance < 0.6) {
                onVerificationSuccess();
            } else {
                setErrorMsg("Identity Verification Failed! Face does not match registered profile.");
                setStatus("failed");
            }

        } catch (error) {
            console.error("Verification error", error);
            setErrorMsg("An error occurred during verification.");
            setStatus("ready_to_verify");
        }
    };

    if (status === "loading") {
        return (
            <div className="flex justify-center items-center h-screen bg-slate-950 text-slate-400">
                <p className="text-lg">Loading profile...</p>
            </div>
        );
    }

    if (status === "first_time_setup") {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-slate-950 text-slate-200 px-6">

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 max-w-lg w-full text-center">

                    <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                        First Time Setup
                    </h2>

                    <p className="mb-6 text-slate-400">
                        Capture your face for secure identity verification during quizzes.
                    </p>

                    <div className="rounded-xl overflow-hidden border border-slate-800 mb-6 bg-black">
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            width={400}
                            height={300}
                        />
                    </div>

                    <button
                        onClick={handleFirstTimeCapture}
                        className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-emerald-400 to-cyan-400 text-black font-semibold hover:scale-[1.02] transition"
                    >
                        Capture & Save Photo
                    </button>

                </div>

            </div>
        );
    }

    if (status === "uploading") {
        return (
            <div className="flex justify-center items-center h-screen bg-slate-950 text-slate-400">
                <p className="text-lg">Uploading your secure reference photo...</p>
            </div>
        );
    }

    if (status === "ready_to_verify" || status === "verifying") {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-slate-950 text-slate-200 px-6">

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 max-w-lg w-full text-center">

                    <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                        Identity Verification
                    </h2>

                    <p className="mb-6 text-slate-400">
                        Look directly at the camera to verify your identity.
                    </p>

                    <div className="rounded-xl overflow-hidden border border-slate-800 mb-6 bg-black">
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            width={400}
                            height={300}
                        />
                    </div>

                    {errorMsg && (
                        <p className="text-red-400 mb-4 text-sm">{errorMsg}</p>
                    )}

                    <button
                        onClick={handleVerification}
                        disabled={status === "verifying"}
                        className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-emerald-400 to-cyan-400 text-black font-semibold disabled:opacity-50 hover:scale-[1.02] transition"
                    >
                        {status === "verifying" ? "Verifying..." : "Verify Me"}
                    </button>

                </div>

            </div>
        );
    }

    if (status === "failed") {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-slate-950 text-slate-200 px-6">

                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 max-w-lg text-center">

                    <h2 className="text-2xl font-bold text-red-400 mb-2">
                        Verification Failed
                    </h2>

                    <p className="text-red-300">{errorMsg}</p>

                </div>

            </div>
        );
    }

    return null;
};

export default VerificationGate;
