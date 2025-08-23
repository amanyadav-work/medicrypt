import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

const SingleFaceDetector = ({ startDetection, targetDescriptor, onMatch }) => {
  const videoRef = useRef(null);
  const intervalRef = useRef(null);   // To store interval ID for cleanup
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);

  // Load face-api.js models
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = "https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@0.22.2/weights";
        await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
        setModelsLoaded(true);
        console.log("Face-api models loaded");
      } catch (err) {
        console.error("Model loading failed:", err);
      }
    };

    loadModels();
  }, []);

  // Watch for trigger to start or stop detection
  useEffect(() => {
    if (startDetection && modelsLoaded && !cameraOn) {
      startCameraAndDetect();
    }

    // Cleanup on stop detection or unmount
    if (!startDetection && cameraOn) {
      stopCamera();
    }

    return () => {
      // Cleanup on unmount
      stopCamera();
    };
  }, [startDetection, modelsLoaded]);

  // Start webcam and detection
  const startCameraAndDetect = async () => {
    const video = videoRef.current;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = stream;
      setCameraOn(true);

      video.onloadedmetadata = () => {
        video.play();
        detectFace();
      };
    } catch (err) {
      console.error("Error accessing webcam:", err);
    }
  };

  // Perform detection
  const detectFace = async () => {
    const video = videoRef.current;
    const faceMatcher = new faceapi.FaceMatcher(
      new faceapi.LabeledFaceDescriptors("target", [new Float32Array(targetDescriptor)]),
      0.6
    );

    let consecutiveMatches = 0;
    const REQUIRED_MATCHES = 3;

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(async () => {
      if (video.paused || video.ended) return;

      const detection = await faceapi
        .detectSingleFace(video)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detection && detection.detection.score > 0.8) {
        const match = faceMatcher.findBestMatch(detection.descriptor);
        if (match.label === "target") {
          consecutiveMatches++;
          console.log("match")
          if (consecutiveMatches >= REQUIRED_MATCHES) {
            stopCamera();
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            onMatch?.();
          }
        } else {
          consecutiveMatches = 0;
        }
      } else {
        consecutiveMatches = 0;
      }
    }, 500);
  };

  // Stop camera and clear interval
  const stopCamera = () => {
    const video = videoRef.current;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    const stream = video?.srcObject;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      video.srcObject = null;
    }
    setCameraOn(false);
  };

  return (
    <div className="w-full flex justify-center items-center">
      {startDetection && <video ref={videoRef} autoPlay muted width="640" height="480" />}
    </div>
  );
};

export default SingleFaceDetector;
