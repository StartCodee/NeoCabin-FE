import React, { useEffect, useRef, useState, useCallback } from "react";
import * as faceapi from "face-api.js";

export default function FaceRegister({
  apiBase = "/",
  detectorType = "ssd",
  minConfidence = 0.6,
  requiredSamples = 5,
  verifyMode = "server",
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const streamRef = useRef(null);
  const instructionRef = useRef(null);
  const livenessTimerRef = useRef(null);

  const [status, setStatus] = useState("Initializing...");
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [confidenceScore, setConfidenceScore] = useState(0);
  const [username, setUsername] = useState("");
  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [samples, setSamples] = useState([]);
  const [knownFaces, setKnownFaces] = useState([]);
  const [livenessPassed, setLivenessPassed] = useState(false);
  const [blinkHistory, setBlinkHistory] = useState([]);
  const [livenessStep, setLivenessStep] = useState(0); // 0: idle, 1: positioning, 2: blink detection
  const [livenessProgress, setLivenessProgress] = useState(0);
  const [livenessChallenge, setLivenessChallenge] = useState([]);

  // Settings
  const MODEL_URL = "/models";
  const VIDEO_WIDTH = 640;
  const VIDEO_HEIGHT = 480;
  const DISPLAY_WIDTH = 320;
  const DISPLAY_HEIGHT = 240;
  const MATCH_THRESHOLD = 0.45;
  const BLINK_EAR_THRESHOLD = 0.2;
  const BLINK_REQUIRED = 1;

  // Audio elements (using external audio files)
  const successSound = useRef(null);
  const errorSound = useRef(null);
  const instructionSound = useRef(null);

  // Load audio files
  useEffect(() => {
    successSound.current = new Audio("/audio/success.mp3"); // local file in public/audio
    errorSound.current = new Audio("/audio/wrong.mp3"); // local file in public/audio
    instructionSound.current = new Audio("/audio/instruction.mp3"); // local file in public/audio

    // Preload audio
    successSound.current.preload = "auto";
    errorSound.current.preload = "auto";
    instructionSound.current.preload = "auto";
  }, []);

  // Utility functions
  const descriptorToArray = (desc) => Array.from(desc || []);
  const arrayToDescriptor = (arr) => new Float32Array(arr || []);

  // Load models
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setStatus("📦 Loading face-api.js models...");
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        if (!mounted) return;
        setModelsLoaded(true);
        setStatus("🎥 Models loaded — initializing camera...");
        await startCamera();
      } catch (err) {
        console.error("Model load failed", err);
        setStatus(
          "❌ Failed loading models. Put models under /models and ensure they are accessible."
        );
      }
    };

    load();
    return () => {
      mounted = false;
      stop();
    };
  }, []);

  // Start camera
  const startCamera = async () => {
    try {
      const constraints = {
        video: {
          facingMode: "user",
          width: { ideal: VIDEO_WIDTH },
          height: { ideal: VIDEO_HEIGHT },
        },
        audio: false,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.width = DISPLAY_WIDTH;
        videoRef.current.height = DISPLAY_HEIGHT;
        videoRef.current.play();

        videoRef.current.onloadedmetadata = () => {
          setCameraReady(true);
          setStatus("✅ Camera ready — position your face in the box");
          onPlay();
        };
      }
    } catch (err) {
      console.error("Camera error", err);
      setStatus(
        "❌ Camera access denied or unavailable. Please allow camera permission."
      );
    }
  };

  // Stop everything
  const stop = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (livenessTimerRef.current) clearTimeout(livenessTimerRef.current);
  };

  // Play audio functions
  const playSuccessSound = () => {
    if (successSound.current) {
      successSound.current.currentTime = 0;
      successSound.current
        .play()
        .catch((e) => console.log("Audio play failed:", e));
    }
  };

  const playErrorSound = () => {
    if (errorSound.current) {
      errorSound.current.currentTime = 0;
      errorSound.current
        .play()
        .catch((e) => console.log("Audio play failed:", e));
    }
  };

  const playInstructionSound = () => {
    if (instructionSound.current) {
      instructionSound.current.currentTime = 0;
      instructionSound.current
        .play()
        .catch((e) => console.log("Audio play failed:", e));
    }
  };

  // Interactive liveness check
  const [headPoseHistory, setHeadPoseHistory] = useState([]);
  const [smileHistory, setSmileHistory] = useState([]);

  // Interactive liveness check dengan deteksi sesungguhnya
  const startLivenessCheck = () => {
    if (!faceDetected) {
      setStatus("❌ Please position your face in the frame");
      playErrorSound();
      return;
    }

    setLivenessStep(1);
    setLivenessProgress(0);
    setLivenessChallenge([]);
    setHeadPoseHistory([]);
    setSmileHistory([]);
    setStatus("👤 Keep your face in the frame");

    // Start liveness check process
    playInstructionSound();



    
    // Challenges dengan deteksi sesungguhnya
    const challenges = [
      {
        action: "Blink slowly",
        key: "blink",
        duration: 5000,
        validator: () => {
          console.log("Blink history:", blinkHistory);
          // Cek apakah ada kedipan dalam history
          const recentBlinks = blinkHistory.slice(-10);
          return (
            recentBlinks.filter((ear) => ear < BLINK_EAR_THRESHOLD).length > 0
          );
        },
      },
      {
        action: "Turn head slightly left",
        key: "left",
        duration: 4000,
        validator: () => {
          // Cek apakah kepala menghadap kiri
          if (headPoseHistory.length < 5) return false;

          const recentPoses = headPoseHistory.slice(-5);
          const leftTurns = recentPoses.filter((pose) => pose.x < -0.1);
          return leftTurns.length >= 3;
        },
      },
      {
        action: "Turn head slightly right",
        key: "right",
        duration: 4000,
        validator: () => {
          // Cek apakah kepala menghadap kanan
          if (headPoseHistory.length < 5) return false;

          const recentPoses = headPoseHistory.slice(-5);
          const rightTurns = recentPoses.filter((pose) => pose.x > 0.1);
          return rightTurns.length >= 3;
        },
      },
      {
        action: "Smile",
        key: "smile",
        duration: 4000,
        validator: () => {
          // Cek apakah tersenyum
          if (smileHistory.length < 5) return false;

          const recentSmiles = smileHistory.slice(-5);
          const smiling = recentSmiles.filter((smile) => smile > 0.5);
          return smiling.length >= 3;
        },
      },
    ];

    let currentChallenge = 0;
    let challengeStartTime = Date.now();
    let validationInterval = null;

    const executeNextChallenge = () => {
      if (currentChallenge >= challenges.length) {
        // All challenges completed
        clearInterval(validationInterval);
        setLivenessPassed(true);
        setLivenessStep(0);
        setStatus("✅ Liveness check passed!");
        playSuccessSound();
        return;
      }

      const challenge = challenges[currentChallenge];
      setStatus(`🔍 ${challenge.action}`);
      setLivenessChallenge(challenge);
      challengeStartTime = Date.now();

      // Update progress
      setLivenessProgress((currentChallenge / challenges.length) * 100);

      // Set up validation interval untuk memeriksa aksi pengguna
      clearInterval(validationInterval);
      validationInterval = setInterval(() => {
        if (challenge.validator()) {
          // Aksi terdeteksi, lanjut ke challenge berikutnya
          clearInterval(validationInterval);
          setStatus(`✅ ${challenge.action} detected!`);
          playSuccessSound();
          currentChallenge++;
          executeNextChallenge();
        } else if (Date.now() - challengeStartTime > challenge.duration) {
          // Waktu habis, gagal
          clearInterval(validationInterval);
          setStatus(`❌ Failed to ${challenge.action.toLowerCase()}`);
          playErrorSound();
          setLivenessStep(0);
        }
      }, 100); // Periksa setiap 100ms
    };

    executeNextChallenge();
  };

  // Main loop: detect face, landmarks, descriptor
  const onPlay = async () => {
    if (
      !videoRef.current ||
      videoRef.current.paused ||
      videoRef.current.ended
    ) {
      rafRef.current = requestAnimationFrame(onPlay);
      return;
    }

    try {
      const options =
        detectorType === "tiny"
          ? new faceapi.TinyFaceDetectorOptions({
              inputSize: 416,
              scoreThreshold: minConfidence,
            })
          : new faceapi.SsdMobilenetv1Options({ minConfidence });

      // Detect single face with landmarks and descriptor
      const result = await faceapi
        .detectSingleFace(videoRef.current, options)
        .withFaceLandmarks()
        .withFaceDescriptor();

      const canvas = canvasRef.current;
      if (canvas) {
        faceapi.matchDimensions(canvas, {
          width: DISPLAY_WIDTH,
          height: DISPLAY_HEIGHT,
        });
      }

      if (result) {
        const resized = faceapi.resizeResults(result, {
          width: DISPLAY_WIDTH,
          height: DISPLAY_HEIGHT,
        });
        drawOverlay(resized, livenessStep);

        setFaceDetected(true);
        setConfidenceScore(Math.round(result.detection.score * 100));

        // Liveness: blink detection using eye aspect ratio
        const leftEye = resized.landmarks.getLeftEye();
        const rightEye = resized.landmarks.getRightEye();
        const ear = (eyeEAR(leftEye) + eyeEAR(rightEye)) / 2;

        setBlinkHistory((prev) => {
          const h = [...prev, ear].slice(-20); // Simpan 20 frame terakhir
          return h;
        });

        // Deteksi pose kepala (menggunakan posisi hidung relatif terhadap mata)
        const nose = resized.landmarks.getNose();
        const leftEyeCenter = getCenterPoint(leftEye);
        const rightEyeCenter = getCenterPoint(rightEye);
        const eyesCenter = {
          x: (leftEyeCenter.x + rightEyeCenter.x) / 2,
          y: (leftEyeCenter.y + rightEyeCenter.y) / 2,
        };

        const noseRelativePos = {
          x: (nose[3].x - eyesCenter.x) / (rightEyeCenter.x - leftEyeCenter.x),
          y: (nose[3].y - eyesCenter.y) / (rightEyeCenter.y - leftEyeCenter.y),
        };

        setHeadPoseHistory((prev) => {
          const h = [...prev, noseRelativePos].slice(-20); // Simpan 20 frame terakhir
          return h;
        });

        // Deteksi senyum (menggunakan rasio lebar mulut)
        const mouth = resized.landmarks.getMouth();
        const mouthWidth = Math.abs(mouth[0].x - mouth[6].x);
        const mouthHeight = Math.abs(mouth[3].y - mouth[9].y);
        const smileRatio = mouthWidth / (mouthHeight + 1); // +1 untuk menghindari pembagian dengan 0

        setSmileHistory((prev) => {
          const h = [...prev, smileRatio].slice(-20); // Simpan 20 frame terakhir
          return h;
        });

        // If registering, collect descriptors
        if (registering && samples.length < requiredSamples) {
          setSamples((prev) => [...prev, Array.from(result.descriptor)]);
        }
      } else {
        setFaceDetected(false);
        setConfidenceScore(0);
        // clear canvas
        if (canvas) {
          const ctx = canvas.getContext("2d");
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
    } catch (err) {
      console.error("Detection error", err);
    }

    rafRef.current = requestAnimationFrame(onPlay);
  };

  // Helper function untuk mendapatkan titik tengah dari array points
  const getCenterPoint = (points) => {
    const sum = points.reduce(
      (acc, point) => {
        return { x: acc.x + point.x, y: acc.y + point.y };
      },
      { x: 0, y: 0 }
    );

    return {
      x: sum.x / points.length,
      y: sum.y / points.length,
    };
  };

  // Draw overlay box & landmarks with liveness indicators
  const drawOverlay = (detection, step) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw guidance circle for face positioning
    if (step > 0) {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(canvas.width, canvas.height) * 0.35;

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = step === 1 ? "#4CAF50" : "#FF9800";
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // bounding box
    const box = detection.detection.box;
    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(0,180,120,0.95)";
    roundRect(ctx, box.x, box.y, box.width, box.height, 8);
    ctx.stroke();

    // landmarks small dots
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    detection.landmarks.positions.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
      ctx.fill();
    });

    // confidence
    ctx.font = "bold 12px Arial";
    ctx.fillStyle = "#00ff99";
    ctx.fillText(
      `${Math.round(detection.detection.score * 100)}%`,
      box.x + 6,
      box.y - 8
    );

    // Liveness progress indicator
    if (step > 0) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.fillRect(10, canvas.height - 25, canvas.width - 20, 15);

      ctx.fillStyle = "#4CAF50";
      ctx.fillRect(
        10,
        canvas.height - 25,
        (livenessProgress / 100) * (canvas.width - 20),
        15
      );

      ctx.font = "10px Arial";
      ctx.fillStyle = "white";
      ctx.fillText(
        `Liveness Check: ${Math.round(livenessProgress)}%`,
        15,
        canvas.height - 12
      );
    }
  };

  // Utility: rounded rect
  const roundRect = (ctx, x, y, w, h, r) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  };

  // Eye Aspect Ratio (EAR) computation
  const eyeEAR = (eyePoints) => {
    const p = eyePoints;
    const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
    const A = dist(p[1], p[5]);
    const B = dist(p[2], p[4]);
    const C = dist(p[0], p[3]);
    return (A + B) / (2.0 * C);
  };

  // Registration: average descriptors and send to server
  const submitRegistration = async () => {
    if (!username) {
      setStatus("❗ Enter a username before registering");
      playErrorSound();
      return;
    }
    if (!faceDetected) {
      setStatus("❗ No face detected");
      playErrorSound();
      return;
    }
    if (!livenessPassed) {
      setStatus("❗ Please complete liveness check first");
      playErrorSound();
      return;
    }
    if (samples.length < requiredSamples) {
      setStatus(
        `❗ Need ${requiredSamples} samples — collected ${samples.length}`
      );
      playErrorSound();
      return;
    }

    setStatus("🔒 Creating descriptor and sending to server...");
    setRegistering(true);

    try {
      // average descriptors
      const avg = averageDescriptors(
        samples.map((arr) => new Float32Array(arr))
      );
      const payload = {
        username,
        descriptor: descriptorToArray(avg),
      };

      const res = await fetch(`${apiBase}api/register-face`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setRegistered(true);
        setStatus("✅ Registered successfully");
        playSuccessSound();
        // refresh known faces if client-side verify
        if (verifyMode === "client") await loadKnownFaces();
      } else {
        setStatus(json.message || "❌ Registration failed");
        playErrorSound();
      }
    } catch (err) {
      console.error(err);
      setStatus(`❌ Registration error: ${err.message}`);
      playErrorSound();
    } finally {
      setRegistering(false);
    }
  };

  // Average multiple Float32Array descriptors
  const averageDescriptors = (arrs) => {
    if (!arrs || arrs.length === 0) return new Float32Array(128);
    const out = new Float32Array(arrs[0].length);
    arrs.forEach((a) => {
      for (let i = 0; i < a.length; i++) out[i] += a[i];
    });
    for (let i = 0; i < out.length; i++) out[i] /= arrs.length;
    return out;
  };

  // Load known faces for client-side matching
  const loadKnownFaces = async () => {
    try {
      const res = await fetch(`${apiBase}api/known-faces`);
      if (!res.ok) throw new Error("Failed to load known faces");
      const json = await res.json();
      setKnownFaces(
        json.map((k) => ({
          username: k.username,
          descriptor: arrayToDescriptor(k.descriptor),
        }))
      );
      setStatus("🗂 Known faces loaded");
    } catch (err) {
      console.error(err);
      setStatus("⚠️ Could not load known faces");
    }
  };

  // Verify locally by comparing descriptor distance
  const clientVerify = (descriptor) => {
    if (!knownFaces || knownFaces.length === 0) return { match: false };
    let best = { label: null, distance: Infinity };
    for (const k of knownFaces) {
      const d = euclideanDistance(k.descriptor, descriptor);
      if (d < best.distance) best = { label: k.username, distance: d };
    }
    const matched = best.distance < MATCH_THRESHOLD;
    return { match: matched, label: best.label, distance: best.distance };
  };

  // Euclidean distance
  const euclideanDistance = (a, b) => {
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
      const diff = a[i] - b[i];
      sum += diff * diff;
    }
    return Math.sqrt(sum);
  };

  // Verify server-side: send descriptor to API
  const serverVerify = async (descriptor) => {
    try {
      const res = await fetch(`${apiBase}api/verify-face`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descriptor: descriptorToArray(descriptor) }),
      });
      const json = await res.json();
      return json; // { success, username?, distance? }
    } catch (err) {
      console.error(err);
      return { success: false };
    }
  };

  // Quick verify action: capture current descriptor and verify
  const handleVerifyNow = async () => {
    if (!faceDetected) {
      setStatus("❗ No face detected");
      playErrorSound();
      return;
    }
    setStatus("🔎 Verifying...");
    try {
      // get current detection with descriptor using one-off detect
      const options =
        detectorType === "tiny"
          ? new faceapi.TinyFaceDetectorOptions({
              inputSize: 416,
              scoreThreshold: minConfidence,
            })
          : new faceapi.SsdMobilenetv1Options({ minConfidence });

      const result = await faceapi
        .detectSingleFace(videoRef.current, options)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!result) {
        setStatus("❌ Failed to compute descriptor");
        playErrorSound();
        return;
      }
      const desc = result.descriptor;

      if (verifyMode === "server") {
        const json = await serverVerify(desc);
        if (json.success) {
          setStatus(
            `✅ Verified as ${json.username} (distance ${json.distance?.toFixed(
              3
            )})`
          );
          playSuccessSound();
        } else {
          setStatus("❌ Not recognized");
          playErrorSound();
        }
      } else {
        // client mode
        if (knownFaces.length === 0) await loadKnownFaces();
        const { match, label, distance } = clientVerify(desc);
        if (match) {
          setStatus(`✅ Verified as ${label} (d=${distance.toFixed(3)})`);
          playSuccessSound();
        } else {
          setStatus("❌ Not recognized");
          playErrorSound();
        }
      }
    } catch (err) {
      console.error(err);
      setStatus("❌ Verification failed");
      playErrorSound();
    }
  };

  // UI helpers
  const resetRegistration = () => {
    setSamples([]);
    setRegistering(false);
    setRegistered(false);
    setLivenessPassed(false);
    setBlinkHistory([]);
    setLivenessStep(0);
    setStatus("Ready");
  };

  return (
    <div
      style={{
        maxWidth: 820,
        margin: 12,
        fontFamily: "Inter, Arial, sans-serif",
      }}
    >
      <h2>Face Enrollment & Verification (Production-ready)</h2>
      <p style={{ color: "#444" }}>{status}</p>

      <div style={{ display: "flex", gap: 16 }}>
        <div>
          <div
            style={{
              position: "relative",
              width: DISPLAY_WIDTH,
              height: DISPLAY_HEIGHT,
              background: "#000",
            }}
          >
            <video
              ref={videoRef}
              width={DISPLAY_WIDTH}
              height={DISPLAY_HEIGHT}
              style={{ position: "absolute", left: 0, top: 0 }}
              muted
              playsInline
            />
            <canvas
              ref={canvasRef}
              width={DISPLAY_WIDTH}
              height={DISPLAY_HEIGHT}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                pointerEvents: "none",
              }}
            />
          </div>

          <div
            style={{
              marginTop: 8,
              display: "flex",
              gap: 8,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <input
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                padding: "6px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
            <button
              onClick={() => {
                setRegistering(true);
                setStatus("📸 Collecting samples...");
              }}
              disabled={!cameraReady || registering || registered}
              style={{
                padding: "6px 12px",
                borderRadius: "4px",
                border: "none",
                background: "#4CAF50",
                color: "white",
              }}
            >
              Start Capture
            </button>
            <button
              onClick={startLivenessCheck}
              disabled={!cameraReady || !faceDetected}
              style={{
                padding: "6px 12px",
                borderRadius: "4px",
                border: "none",
                background: "#2196F3",
                color: "white",
              }}
            >
              Liveness Check
            </button>
            <button
              onClick={submitRegistration}
              disabled={
                !registering ||
                samples.length < requiredSamples ||
                !livenessPassed
              }
              style={{
                padding: "6px 12px",
                borderRadius: "4px",
                border: "none",
                background: "#FF9800",
                color: "white",
              }}
            >
              {registering
                ? `Submit (${samples.length}/${requiredSamples})`
                : "Submit Registration"}
            </button>
            <button
              onClick={resetRegistration}
              style={{
                padding: "6px 12px",
                borderRadius: "4px",
                border: "none",
                background: "#f44336",
                color: "white",
              }}
            >
              Reset
            </button>
          </div>

          <div style={{ marginTop: 10 }}>
            <div>
              Face detected: <strong>{faceDetected ? "Yes" : "No"}</strong>
            </div>
            <div>
              Confidence: <strong>{confidenceScore}%</strong>
            </div>
            <div>
              Liveness:{" "}
              <strong>{livenessPassed ? "✅ Passed" : "❌ Not passed"}</strong>
            </div>
            <div>
              Samples collected: <strong>{samples.length}</strong> /{" "}
              {requiredSamples}
            </div>
          </div>

          {livenessStep > 0 && (
            <div
              style={{
                marginTop: 12,
                padding: "8px",
                background: "#e3f2fd",
                borderRadius: "4px",
              }}
            >
              <h4>Liveness Check In Progress</h4>
              <div>
                Current instruction:{" "}
                <strong>
                  {livenessChallenge.action || "Position your face"}
                </strong>
              </div>
              <div
                style={{
                  height: "10px",
                  background: "#ddd",
                  borderRadius: "5px",
                  marginTop: "5px",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${livenessProgress}%`,
                    background: "#4CAF50",
                    borderRadius: "5px",
                  }}
                ></div>
              </div>
            </div>
          )}

          <div style={{ marginTop: 12 }}>
            <button
              onClick={handleVerifyNow}
              disabled={!cameraReady}
              style={{
                padding: "8px 16px",
                borderRadius: "4px",
                border: "none",
                background: "#9c27b0",
                color: "white",
              }}
            >
              Verify Now
            </button>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <h4>Settings & Info</h4>
          <div>
            Detector:{" "}
            {detectorType === "tiny"
              ? "TinyFaceDetector (fast)"
              : "SSD MobileNet v1 (accurate)"}
          </div>
          <div>Verify mode: {verifyMode}</div>
          <div style={{ marginTop: 8 }}>
            <small>
              Production advice: Use HTTPS, store descriptors securely on the
              server (not raw images), and rate-limit verification attempts. For
              higher security, combine face verification with a second factor
              (OTP, passkey).
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}
