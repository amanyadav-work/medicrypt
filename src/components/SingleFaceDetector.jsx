import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

const SingleFaceDetector = ({ startDetection, targetDescriptor, onMatch }) => {
  const videoRef = useRef(null);
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

  // Watch for trigger
  useEffect(() => {
    if (startDetection && modelsLoaded && !cameraOn) {
      startCameraAndDetect();
    }
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
    const displaySize = { width: video.width || 640, height: video.height || 480 };
    faceapi.matchDimensions(video, displaySize);

    const faceMatcher = new faceapi.FaceMatcher(
      new faceapi.LabeledFaceDescriptors("target", [new Float32Array(targetDescriptor)]),
      0.6
    );

    const interval = setInterval(async () => {
      if (video.paused || video.ended) return;

      const detection = await faceapi
        .detectSingleFace(video)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detection) {
        const match = faceMatcher.findBestMatch(detection.descriptor);
        console.log("Match result:", match);
        if (match.label === "target") {
          stopCamera();
          clearInterval(interval);
          onMatch?.(); // Notify parent
        }
      }
    }, 500);
  };

  // Stop camera
  const stopCamera = () => {
    const video = videoRef.current;
    const stream = video?.srcObject;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
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
