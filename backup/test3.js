import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import axios from "axios";

export default function FaceRegister({ apiBase = "/" }) {
  const videoRef = useRef(null);
  const [status, setStatus] = useState("Memuat model...");
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [runningChallenge, setRunningChallenge] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [passed, setPassed] = useState(false);

  // threshold liveness
  const EAR_BLINK_THRESHOLD = 0.22;
  const EAR_CONSEC_FRAMES = 2;
  const HEAD_TURN_THRESHOLD = 0.035;
  const CHALLENGE_TIMEOUT_MS = 8000;

  useEffect(() => {
    let mounted = true;

    async function loadModelsAndCamera() {
      try {
        const MODEL_URL = "/models";
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL);

        if (!mounted) return;
        setModelsLoaded(true);
        setStatus("Mengaktifkan kamera...");

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240, facingMode: "user" },
        });
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setStatus("Siap — tekan Start Enrollment");
      } catch (err) {
        console.error(err);
        setStatus("Gagal load model atau kamera");
      }
    }

    loadModelsAndCamera();
    return () => {
      mounted = false;
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // util EAR
  function eyeAspectRatio(eye) {
    function dist(a, b) {
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      return Math.hypot(dx, dy);
    }
    const A = dist(eye[1], eye[5]);
    const B = dist(eye[2], eye[4]);
    const C = dist(eye[0], eye[3]);
    if (C === 0) return 0;
    return (A + B) / (2.0 * C);
  }

  // util head turn
  function noseOffsetNormalized(landmarks) {
    const leftEye = landmarks.getLeftEye();
    const rightEye = landmarks.getRightEye();
    const nose = landmarks.getNose();
    const leftCenter = leftEye.reduce((a, p) => ({ x: a.x + p.x, y: a.y + p.y }), { x: 0, y: 0 });
    leftCenter.x /= leftEye.length;
    leftCenter.y /= leftEye.length;
    const rightCenter = rightEye.reduce((a, p) => ({ x: a.x + p.x, y: a.y + p.y }), { x: 0, y: 0 });
    rightCenter.x /= rightEye.length;
    rightCenter.y /= rightEye.length;
    const eyesMidX = (leftCenter.x + rightCenter.x) / 2;
    const noseTip = nose[Math.floor(nose.length / 2)];
    const eyeDist = Math.hypot(rightCenter.x - leftCenter.x, rightCenter.y - leftCenter.y);
    if (eyeDist === 0) return 0;
    return (noseTip.x - eyesMidX) / eyeDist;
  }

  // run challenge
  async function runChallenge(challenge) {
    setCurrentChallenge(challenge);
    setStatus(`Challenge: ${challenge} — ikuti instruksi`);
    const video = videoRef.current;
    if (!video) return false;

    const startTime = Date.now();
    let blinkFrames = 0;
    let processing = false;
    let samples = [];

    return new Promise((resolve) => {
      async function loop() {
        if (Date.now() - startTime > CHALLENGE_TIMEOUT_MS) {
          setStatus(`Challenge "${challenge}" timeout`);
          setCurrentChallenge(null);
          resolve(false);
          return;
        }

        if (!processing) {
          processing = true;
          const detection = await faceapi
            .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks(true);

          if (detection) {
            const lm = detection.landmarks;

            if (challenge === "blink") {
              const leftEAR = eyeAspectRatio(lm.getLeftEye());
              const rightEAR = eyeAspectRatio(lm.getRightEye());
              const ear = (leftEAR + rightEAR) / 2;
              if (ear < EAR_BLINK_THRESHOLD) {
                blinkFrames++;
              } else {
                if (blinkFrames >= EAR_CONSEC_FRAMES) {
                  setStatus("Blink terdeteksi ✓");
                  setCurrentChallenge(null);
                  resolve(true);
                  return;
                }
                blinkFrames = 0;
              }
            } else if (challenge === "turn_left" || challenge === "turn_right") {
              const offset = noseOffsetNormalized(lm);
              samples.push(offset);
              if (samples.length > 5) samples.shift();
              const avg = samples.reduce((a, b) => a + b, 0) / samples.length;
              if (challenge === "turn_left" && avg < -HEAD_TURN_THRESHOLD) {
                setStatus("Kepala belok kiri ✓");
                setCurrentChallenge(null);
                resolve(true);
                return;
              }
              if (challenge === "turn_right" && avg > HEAD_TURN_THRESHOLD) {
                setStatus("Kepala belok kanan ✓");
                setCurrentChallenge(null);
                resolve(true);
                return;
              }
              setStatus(`Arahkan kepala ke ${challenge === "turn_left" ? "kiri" : "kanan"}...`);
            }
          } else {
            setStatus("Wajah tidak terdeteksi — hadapkan wajah ke kamera");
          }
          processing = false;
        }
        requestAnimationFrame(loop);
      }
      requestAnimationFrame(loop);
    });
  }

  // start enrollment
  async function startEnrollment() {
    if (!modelsLoaded) {
      setStatus("Model belum siap");
      return;
    }
    if (runningChallenge) {
      setStatus("Sedang berjalan...");
      return;
    }

    setRunningChallenge(true);
    setPassed(false);
    setChallengeIndex(0);

    const pool = ["blink", "turn_left", "turn_right"];
    const seq = Array.from({ length: 2 + Math.floor(Math.random() * 2) }, () =>
      pool[Math.floor(Math.random() * pool.length)]
    );

    setStatus("Mulai enrollment — ikuti instruksi...");
    for (let i = 0; i < seq.length; i++) {
      setChallengeIndex(i + 1);
      const ok = await runChallenge(seq[i]);
      if (!ok) {
        setStatus("Liveness check gagal. Coba lagi.");
        setRunningChallenge(false);
        setCurrentChallenge(null);
        return;
      }
    }

    if (!faceapi.nets.faceRecognitionNet.isLoaded) {
      setStatus("Memuat model pengenalan wajah...");
      await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
    }

    setStatus("Semua challenge lulus — mengambil descriptor...");
    const detection = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks(true)
      .withFaceDescriptor();

    if (!detection) {
      setStatus("Wajah tidak ditemukan saat capture descriptor");
      setRunningChallenge(false);
      return;
    }

    const descriptor = Array.from(detection.descriptor);
    const name = prompt("Masukkan nama untuk register:");
    if (!name) {
      setStatus("Dibatalkan pengguna");
      setRunningChallenge(false);
      return;
    }

    try {
      setStatus("Mengirim ke server...");
      const res = await axios.post(`${apiBase}api/register`, { name, descriptor });
      if (res.data?.ok) {
        setStatus("Registrasi berhasil ✓");
        setPassed(true);
      } else {
        setStatus("Gagal registrasi di server");
      }
    } catch (e) {
      console.error(e);
      setStatus("Error saat kirim ke server");
    } finally {
      setRunningChallenge(false);
      setCurrentChallenge(null);
    }
  }

  return (
    <div style={{ maxWidth: 380 }}>
      <h3>Register (dengan liveness)</h3>
      <div style={{ position: "relative" }}>
        <video
          ref={videoRef}
          width="320"
          height="240"
          style={{ borderRadius: 12, background: "black" }}
        />
        {currentChallenge && (
          <div
            style={{
              position: "absolute",
              left: 8,
              top: 8,
              background: "rgba(0,0,0,0.6)",
              color: "white",
              padding: "6px 10px",
              borderRadius: 8,
            }}
          >
            <strong>{currentChallenge}</strong>
          </div>
        )}
      </div>

      <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
        <button
          onClick={startEnrollment}
          disabled={!modelsLoaded || runningChallenge}
          style={{
            background: runningChallenge ? "#94a3b8" : "#0f172a",
            color: "white",
            flex: 1,
            padding: "10px 12px",
            borderRadius: 10,
          }}
        >
          {runningChallenge ? `Running (${challengeIndex})...` : "Start Enrollment"}
        </button>
      </div>

      <p style={{ marginTop: 8, color: passed ? "#059669" : "#0f172a" }}>{status}</p>

      <div style={{ marginTop: 6, fontSize: 12, color: "#475569" }}>
        <p>
          Info: sistem akan meminta beberapa challenge acak (blink / belok kiri / belok kanan).
          Sesuaikan jarak kamera dan pencahayaan untuk hasil terbaik.
        </p>
      </div>
    </div>
  );
}
