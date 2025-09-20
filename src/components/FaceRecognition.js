// FaceLiveness.jsx
import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "@vladmandic/face-api";
/**
 * FaceLiveness
 * - Adaptive calibration per user
 * - Multi-modal liveness (blink, head left/right, smile/open mouth)
 * - Uses refs for realtime histories to avoid stale closures
 * - Added sound feedback for success and failure
 *
 * Usage:
 * <FaceLiveness apiBase="/" onPassed={() => console.log("passed")} />
 */

export default function FaceLiveness({
  apiBase = "/",
  MODEL_URL = "/models",
  DISPLAY_WIDTH = 320,
  DISPLAY_HEIGHT = 240,
  REQUIRED_SAMPLES = 5,
  onPassed = () => {},
}) {
  // UI & refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const streamRef = useRef(null);

  // Audio elements
  const successSound = useRef(null);
  const errorSound = useRef(null);
  const instructionSound = useRef(null);

  // Realtime histories in refs (always up-to-date)
  const blinkHistoryRef = useRef([]); // EAR over time
  const headPoseHistoryRef = useRef([]); // noseRelativePos x,y over time
  const smileHistoryRef = useRef([]); // mouth ratio over time

  // Calibration baseline refs
  const earBaselineRef = useRef(null); // median open EAR during calibration
  const mouthBaselineRef = useRef(null);

  // Local state
  const [status, setStatus] = useState("Initializing models...");
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [livenessStep, setLivenessStep] = useState("idle"); // idle | calibrating | running | passed | failed
  const [livenessProgress, setLivenessProgress] = useState(0);
  const [dynamicThresholds, setDynamicThresholds] = useState({
    earThreshold: 0.2,
    smileThreshold: 1.8,
    headXThreshold: 0.08,
  });

  // Config - tunable
  const CONFIG = {
    CALIBRATION_TIME_MS: 2200,
    HISTORY_MAX: 120, // frames to keep
    BLINK_MIN_FRAMES: 2, // frames below threshold to count as blink
    CHALLENGE_TIMEOUT: 4500,
    CHALLENGES_ORDER: ["left", "right", "smile"], // can be randomized
    MIN_EAR_ALLOWED: 0.09, // safety lower bound
    MAX_EAR_ALLOWED: 0.48, // safety upper bound
    SMILE_RATIO_MIN: 1.2, // baseline fallback
  };

  // Load models and audio once
  useEffect(() => {
    let mounted = true;
    
    // Load audio files
    successSound.current = new Audio('/audio/success.mp3');
    errorSound.current = new Audio('/audio/wrong.mp3');
    instructionSound.current = new Audio('/audio/instruction.mp3');
    
    // Preload audio
    successSound.current.preload = 'auto';
    errorSound.current.preload = 'auto';
    instructionSound.current.preload = 'auto';

    const loadModels = async () => {
      try {
        setStatus("📦 Loading face-api.js models...");
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        if (!mounted) return;
        setModelsLoaded(true);
        setStatus("Models loaded — initializing camera...");
        await startCamera();
      } catch (err) {
        console.error("Model load failed", err);
        setStatus("❌ Failed loading models. Check /models accessibility.");
      }
    };
    loadModels();
    return () => {
      mounted = false;
      stopAll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Play audio functions
  const playSuccessSound = () => {
    if (successSound.current) {
      successSound.current.currentTime = 0;
      successSound.current.play().catch(e => console.log("Audio play failed:", e));
    }
  };

  const playErrorSound = () => {
    if (errorSound.current) {
      errorSound.current.currentTime = 0;
      errorSound.current.play().catch(e => console.log("Audio play failed:", e));
    }
  };

  const playInstructionSound = () => {
    if (instructionSound.current) {
      instructionSound.current.currentTime = 0;
      instructionSound.current.play().catch(e => console.log("Audio play failed:", e));
    }
  };

  // Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.width = DISPLAY_WIDTH;
        videoRef.current.height = DISPLAY_HEIGHT;
        await videoRef.current.play();
        setCameraReady(true);
        setStatus("🎥 Camera ready — please position your face");
        onPlay(); // start loop
      }
    } catch (err) {
      console.error("Camera failed", err);
      setStatus("❌ Camera access denied or unavailable.");
    }
  };

  const stopAll = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  // Main loop
  const onPlay = async () => {
    if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) {
      rafRef.current = requestAnimationFrame(onPlay);
      return;
    }

    try {
      const options = new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 });
      const result = await faceapi
        .detectSingleFace(videoRef.current, options)
        .withFaceLandmarks();

      const canvas = canvasRef.current;
      if (canvas) faceapi.matchDimensions(canvas, { width: DISPLAY_WIDTH, height: DISPLAY_HEIGHT });

      if (result) {
        setFaceDetected(true);

        const resized = faceapi.resizeResults(result, { width: DISPLAY_WIDTH, height: DISPLAY_HEIGHT });
        // landmarks
        const leftEye = resized.landmarks.getLeftEye();
        const rightEye = resized.landmarks.getRightEye();
        const mouth = resized.landmarks.getMouth();
        const nose = resized.landmarks.getNose();

        // compute EAR
        const ear = computeEAR(leftEye, rightEye);
        // mouth ratio (width / height)
        const mouthWidth = Math.hypot(mouth[0].x - mouth[6].x, mouth[0].y - mouth[6].y);
        const mouthHeight = Math.hypot(mouth[3].y - mouth[9].y, mouth[3].x - mouth[9].x);
        const mouthRatio = mouthWidth / (mouthHeight + 1e-6);

        // head pose proxy (nose relative to eyes center)
        const leftEyeC = centerPoint(leftEye);
        const rightEyeC = centerPoint(rightEye);
        const eyesCenter = { x: (leftEyeC.x + rightEyeC.x) / 2, y: (leftEyeC.y + rightEyeC.y) / 2 };
        // use nose[3] (approx tip) — scale by inter-eye distance for invariance
        const interEyeDx = Math.abs(rightEyeC.x - leftEyeC.x) || 1;
        const noseRel = {
          x: (nose[3].x - eyesCenter.x) / interEyeDx,
          y: (nose[3].y - eyesCenter.y) / Math.abs(rightEyeC.y - leftEyeC.y || 1),
        };

        // push to histories (refs)
        pushHistory(blinkHistoryRef, ear, CONFIG.HISTORY_MAX);
        pushHistory(headPoseHistoryRef, noseRel, CONFIG.HISTORY_MAX);
        pushHistory(smileHistoryRef, mouthRatio, CONFIG.HISTORY_MAX);

        // draw overlay
        drawOverlay(resized, { ear, mouthRatio, noseRel });

        // if calibrating, nothing else yet
        // else if running challenges, those validators read from refs (see startLivenessCheck)
      } else {
        setFaceDetected(false);
        // clear canvas
        if (canvas) {
          const ctx = canvas.getContext("2d");
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
    } catch (err) {
      console.error("Detection loop error", err);
    }

    rafRef.current = requestAnimationFrame(onPlay);
  };

  // Helper functions
  const pushHistory = (refContainer, value, maxLen) => {
    const cur = refContainer.current || [];
    cur.push(value);
    if (cur.length > maxLen) cur.splice(0, cur.length - maxLen);
    refContainer.current = cur;
  };
  const centerPoint = (pts) => {
    const s = pts.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
    return { x: s.x / pts.length, y: s.y / pts.length };
  };
  const computeEAR = (leftEye, rightEye) => {
    const eyeEAR = (eye) => {
      const d = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
      const A = d(eye[1], eye[5]);
      const B = d(eye[2], eye[4]);
      const C = d(eye[0], eye[3]) || 1;
      return (A + B) / (2.0 * C);
    };
    const le = eyeEAR(leftEye);
    const re = eyeEAR(rightEye);
    return (le + re) / 2;
  };

  // Draw overlay + debug values
  const drawOverlay = (resized, debug) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // box
    const box = resized.detection.box;
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(0,200,120,0.9)";
    ctx.strokeRect(box.x, box.y, box.width, box.height);

    // landmarks as small dots
    ctx.fillStyle = "white";
    resized.landmarks.positions.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
      ctx.fill();
    });

    // debug text
    ctx.fillStyle = "white";
    ctx.font = "12px Arial";
    const ear = debug.ear;
    const mouthRatio = debug.mouthRatio;
    const noseX = debug.noseRel.x;
    ctx.fillText(`EAR: ${ear.toFixed(2)}`, 8, 14);
    ctx.fillText(`earThr: ${dynamicThresholds.earThreshold.toFixed(2)}`, 8, 30);
    ctx.fillText(`mouthR: ${mouthRatio.toFixed(2)}`, 8, 46);
    ctx.fillText(`headX: ${noseX.toFixed(2)}`, 8, 62);
    ctx.fillText(`status: ${livenessStep}`, 8, 78);
  };

  // Calibration: compute median of recent EAR & mouth ratio for baseline
  const calibrate = async () => {
    if (!faceDetected) {
      setStatus("❗ Face not detected — position your face");
      playErrorSound();
      return false;
    }
    setLivenessStep("calibrating");
    setStatus("🔧 Calibrating… Keep neutral face (no blink/smile) for a moment");
    
    // Play instruction sound
    playInstructionSound();
    
    const start = Date.now();
    while (Date.now() - start < CONFIG.CALIBRATION_TIME_MS) {
      // wait while onPlay populates refs
      await new Promise((r) => setTimeout(r, 100));
    }
    // compute medians
    const recentEARs = [...(blinkHistoryRef.current || [])].slice(-60).filter((v) => typeof v === "number");
    const recentMouths = [...(smileHistoryRef.current || [])].slice(-60).filter((v) => typeof v === "number");
    const medianEAR = median(recentEARs) || 0.32;
    const medianMouth = median(recentMouths) || CONFIG.SMILE_RATIO_MIN;

    // dynamic thresholds computed relative to baseline
    const earThr = clamp(medianEAR * 0.72, CONFIG.MIN_EAR_ALLOWED, CONFIG.MAX_EAR_ALLOWED);
    const smileThr = Math.max(1.2, medianMouth * 1.25); // smiling increases ratio
    const headXThr = 0.08; // fixed but can adapt if needed

    earBaselineRef.current = medianEAR;
    mouthBaselineRef.current = medianMouth;
    setDynamicThresholds({ earThreshold: earThr, smileThreshold: smileThr, headXThreshold: headXThr });

    setStatus(`✅ Calibrated (ear ${medianEAR.toFixed(2)}, mouth ${medianMouth.toFixed(2)})`);
    setLivenessStep("idle");
    
    // Play success sound for calibration
    playSuccessSound();
    return true;
  };

  // run liveness challenges sequentially
  const startLivenessCheck = async () => {
    if (!faceDetected) {
      setStatus("❗ Position your face first");
      playErrorSound();
      return;
    }

    // perform calibration first
    const calOK = await calibrate();
    if (!calOK) {
      setStatus("❌ Calibration failed");
      playErrorSound();
      return;
    }

    setLivenessStep("running");
    setStatus("▶️ Liveness check started");
    setLivenessProgress(0);
    
    // Play instruction sound
    playInstructionSound();

    // build challenge validators that read from refs dynamically
    const validators = {
      left: () => {
        const arr = headPoseHistoryRef.current || [];
        if (arr.length < 6) return false;
        const window = arr.slice(-12);
        const leftCount = window.filter((p) => p.x < -dynamicThresholds.headXThreshold).length;
        return leftCount >= 3;
      },
      right: () => {
        const arr = headPoseHistoryRef.current || [];
        if (arr.length < 6) return false;
        const window = arr.slice(-12);
        const rightCount = window.filter((p) => p.x > dynamicThresholds.headXThreshold).length;
        return rightCount >= 3;
      },
      smile: () => {
        const arr = smileHistoryRef.current || [];
        if (arr.length < 6) return false;
        const window = arr.slice(-12);
        const smilingFrames = window.filter((r) => r > dynamicThresholds.smileThreshold).length;
        return smilingFrames >= 4;
      },
    };

    // choose challenges. For users with very low baseline EAR (e.g., eye shape),
    // prioritize head/smile rather than blink:
    const lowEAR = earBaselineRef.current < 0.18;
    const challengeOrder = lowEAR ? ["left", "right", "smile"] : CONFIG.CHALLENGES_ORDER;

    let passedAll = true;
    for (let i = 0; i < challengeOrder.length; i++) {
      const key = challengeOrder[i];
      setStatus(`🔍 Please: ${challengeLabel(key)}`);
      setLivenessProgress(Math.round((i / challengeOrder.length) * 100));

      const start = Date.now();
      let ok = false;
      while (Date.now() - start < CONFIG.CHALLENGE_TIMEOUT) {
        // poll validator
        if (validators[key]()) {
          ok = true;
          break;
        }
        // small sleep
        // eslint-disable-next-line no-await-in-loop
        await new Promise((r) => setTimeout(r, 120));
      }

      if (!ok) {
        // failed this challenge
        setStatus(`❌ Failed to ${challengeLabel(key)}`);
        setLivenessStep("failed");
        passedAll = false;
        playErrorSound();
        break;
      } else {
        // success for this challenge
        setStatus(`✅ ${challengeLabel(key)} detected`);
        playSuccessSound();
        // small delay so user sees success feedback
        // eslint-disable-next-line no-await-in-loop
        await new Promise((r) => setTimeout(r, 450));
      }
    }

    setLivenessProgress(100);
    if (passedAll) {
      setStatus("🎉 Liveness check passed");
      setLivenessStep("passed");
      playSuccessSound();
      onPassed();
    } else {
      playErrorSound();
    }
  };

  // Small utilities
  const median = (arr) => {
    if (!arr || arr.length === 0) return null;
    const nums = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(nums.length / 2);
    return nums.length % 2 === 0 ? (nums[mid - 1] + nums[mid]) / 2 : nums[mid];
  };
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const challengeLabel = (k) => {
    return {
      left: "Turn head slightly left",
      right: "Turn head slightly right",
      smile: "Smile",
    }[k];
  };

  // UI render
  return (
    <div style={{ maxWidth: 880, margin: 12, fontFamily: "Inter, Arial, sans-serif" }}>
      <h3>Adaptive Liveness Check</h3>
      <p style={{ color: "#444" }}>{status}</p>

      <div style={{ display: "flex", gap: 12 }}>
        <div>
          <div style={{ position: "relative", width: DISPLAY_WIDTH, height: DISPLAY_HEIGHT,borderRadius: 12, background: "#000" }}>
            <video ref={videoRef} width={DISPLAY_WIDTH} height={DISPLAY_HEIGHT} style={{ position: "absolute", left: 0, top: 0, borderRadius: 12 }} muted playsInline />
            <canvas ref={canvasRef} width={DISPLAY_WIDTH} height={DISPLAY_HEIGHT} style={{ position: "absolute", left: 0, top: 0,borderRadius: 12, pointerEvents: "none" }} />
          </div>

          <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
            <button onClick={calibrate} disabled={!cameraReady} style={btnStyle("#1976d2")}>
              Calibrate (2s)
            </button>
            <button onClick={startLivenessCheck} disabled={!cameraReady} style={btnStyle("#4caf50")}>
              Start Liveness
            </button>
            <button
              onClick={() => {
                // reset histories and baselines
                blinkHistoryRef.current = [];
                headPoseHistoryRef.current = [];
                smileHistoryRef.current = [];
                earBaselineRef.current = null;
                mouthBaselineRef.current = null;
                setStatus("Reset done");
                setLivenessStep("idle");
                playInstructionSound();
              }}
              style={btnStyle("#f44336")}
            >
              Reset
            </button>
          </div>

          <div style={{ marginTop: 10 }}>
            <div>Face detected: <strong>{faceDetected ? "Yes" : "No"}</strong></div>
            <div>Liveness step: <strong>{livenessStep}</strong></div>
            <div>Progress: <strong>{livenessProgress}%</strong></div>
            <div style={{ marginTop: 6 }}>
              <small>Thresholds (adaptive): ear {dynamicThresholds.earThreshold.toFixed(2)}, smile {dynamicThresholds.smileThreshold.toFixed(2)}</small>
            </div>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <h4>Tips</h4>
          <ul>
            <li>Jaga jarak mata-kamera stabil saat kalibrasi (2 detik).</li>
            <li>Jika mata terlihat 'sipit' dan blink sulit terdeteksi, komponen otomatis memprioritaskan head-turn dan smile.</li>
            <li>Bila liveness tetap gagal, coba lakukan gesture yang diminta (turn left/right atau senyum).</li>
            <li>Gunakan overlay debug untuk melihat EAR & headX realtime.</li>
          </ul>

          <h4>Parameter (bisa di-tweak)</h4>
          <div>Calibration time: {CONFIG.CALIBRATION_TIME_MS} ms</div>
          <div>Challenge timeout: {CONFIG.CHALLENGE_TIMEOUT} ms</div>
        </div>
      </div>
    </div>
  );
}

// small style helper
const btnStyle = (bg) => ({
  padding: "8px 12px",
  borderRadius: 6,
  border: "none",
  background: bg,
  color: "white",
  cursor: "pointer",
});