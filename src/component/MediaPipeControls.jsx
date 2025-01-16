import React, { useEffect, useRef, useState } from 'react';
import * as Hands from '@mediapipe/hands';
import * as Camera from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';

const MediaPipeControls = ({ onPlayPause, onNext, onPrevious, isPlaying, hasPlayedInitially, setHasPlayedInitially }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [camera, setCamera] = useState(null);
  const [gestureDetected, setGestureDetected] = useState('');
  const lastGestureTime = useRef(0);
  const gestureTimeout = 1000; // Cooldown period in milliseconds

  useEffect(() => {
    const hands = new Hands.Hands({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      }
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    if (videoRef.current) {
      const camera = new Camera.Camera(videoRef.current, {
        onFrame: async () => {
          await hands.send({ image: videoRef.current });
        },
        width: 640,
        height: 480
      });
      setCamera(camera);
      camera.start();
    }

    function calculateFingerState(landmarks) {
      // Get y-coordinates of fingertips and their corresponding MCP joints
      const fingerTips = [8, 12, 16, 20]; // Index, Middle, Ring, Pinky fingertips
      const fingerBases = [5, 9, 13, 17]; // Corresponding MCP joints
      const thumbTip = landmarks[4];
      const thumbBase = landmarks[2];

      // Check if fingers are extended (true if fingertip is above base)
      const extendedFingers = fingerTips.map((tip, index) => 
        landmarks[tip].y < landmarks[fingerBases[index]].y
      );

      // Check thumb state (extended if tip is to the side of base)
      const thumbExtended = Math.abs(thumbTip.x - thumbBase.x) > 0.1;

      return {
        thumb: thumbExtended,
        fingers: extendedFingers
      };
    }

    function detectGesture(landmarks) {
      const currentTime = Date.now();
      if (currentTime - lastGestureTime.current < gestureTimeout) {
        return; // Still in cooldown period
      }

      const { thumb, fingers } = calculateFingerState(landmarks);
      
      // Play/Pause: Closed fist (all fingers down)
      if (!thumb && fingers.every(f => !f)) {
        setGestureDetected('Play/Pause');
        if (!hasPlayedInitially) {
          onPlayPause(); // Play the first song
          setHasPlayedInitially(true);
        } else {
          onPlayPause(); // Toggle play/pause
        }
        lastGestureTime.current = currentTime;
        return;
      }

      // Next: Swipe left (thumb and index extended)
      if (thumb && fingers[0] && !fingers[1] && !fingers[2] && !fingers[3]) {
        setGestureDetected('Next');
        onNext();
        lastGestureTime.current = currentTime;
        return;
      }

      // Previous: Swipe right (thumb, index, and middle extended)
      if (thumb && fingers[0] && fingers[1] && !fingers[2] && !fingers[3]) {
        setGestureDetected('Previous');
        onPrevious();
        lastGestureTime.current = currentTime;
        return;
      }

      setGestureDetected('');
    }

    hands.onResults((results) => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

      if (results.multiHandLandmarks) {
        for (const landmarks of results.multiHandLandmarks) {
          drawConnectors(ctx, landmarks, Hands.HAND_CONNECTIONS, {
            color: '#00FF00',
            lineWidth: 5
          });
          drawLandmarks(ctx, landmarks, {
            color: '#FF0000',
            lineWidth: 2
          });

          detectGesture(landmarks);
        }
      }

      ctx.restore();
    });

    return () => {
      hands.close();
      if (camera) {
        camera.stop();
      }
    };
  }, [onPlayPause, onNext, onPrevious, hasPlayedInitially, setHasPlayedInitially]);

  return (
    <div className="mediapipe-controls">
    <div className="video-container">
      <video ref={videoRef} className="input-video" />
      <canvas ref={canvasRef} className="output-canvas" width="640" height="480" />
    </div>
    <div className="gesture-info">
      <p>Current Gesture: {gestureDetected || 'None'}</p>
      <div className="gesture-instructions">

      </div>
    </div>
  </div>
);
};

export default MediaPipeControls;