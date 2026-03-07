'use client';

import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle2, Trophy, ArrowRight } from 'lucide-react';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import * as handpose from '@tensorflow-models/handpose';
import VerificationGate from './VerificationGate';

export default function AttendTest() {
  const navigate = useNavigate();
  const { user } = useUser();

  const [isVerified, setIsVerified] = useState(false);
  const [warningLogs, setWarningLogs] = useState([]);
  const [quizContent, setQuizContent] = useState([]);
  const [quizId, setQuizId] = useState('');
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [topUsers, setTopUsers] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  // Proctoring State
  const [cheatWarnings, setCheatWarnings] = useState(0);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const videoRef = React.useRef(null);
  const modelRef = React.useRef(null);
  const handModelRef = React.useRef(null);
  const analyserRef = React.useRef(null);
  const audioContextRef = React.useRef(null);
  const lastWarningTime = React.useRef(0);
  const isAlertOpen = React.useRef(false);

  const [allowNoise, setAllowNoise] = useState(false);
  const [allowHandGestures, setAllowHandGestures] = useState(false);
  const [passPercentage, setPassPercentage] = useState(70);

  const issueWarning = (reason) => {
    if (isAlertOpen.current) return;
    const now = Date.now();
    if (now - lastWarningTime.current < 4000) return; // 4s cooldown

    isAlertOpen.current = true;
    lastWarningTime.current = Date.now();

    setWarningLogs(prev => [...prev, reason]);

    setCheatWarnings(prev => {
      const next = prev + 1;
      if (next < 5) {
        setTimeout(() => {
          alert(`Warning ${next}/5: ${reason}`);
          isAlertOpen.current = false;
          lastWarningTime.current = Date.now();
        }, 50);
      } else {
        isAlertOpen.current = false;
      }
      return next;
    });
  };

  useEffect(() => {
    if (cheatWarnings >= 5 && !submitted) {
      alert("Your exam has been automatically submitted due to multiple cheating violations (5/5).");
      handleSubmit();
    }
  }, [cheatWarnings, submitted]);

  // Proctoring: Tab Switch Detection
  useEffect(() => {
    if (!quizStarted || submitted) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        issueWarning("You moved away from the exam tab!");
      }
    };

    const handleBlur = () => {
      issueWarning("Exam window lost focus!");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
    };
  }, [quizStarted, submitted]);

  // Proctoring: Camera & ML Model Initialization
  useEffect(() => {
    if (!quizStarted || submitted) return;

    let requestAnimationFrameId;

    const setupCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240 },
          audio: !allowNoise, // Only request audio if noise detection is enabled
        });

        if (!allowNoise) {
          audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
          const source = audioContextRef.current.createMediaStreamSource(stream);
          analyserRef.current = audioContextRef.current.createAnalyser();
          analyserRef.current.fftSize = 256;
          source.connect(analyserRef.current);
        }

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            setIsCameraReady(true);
            videoRef.current.play();
          };
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        alert("Camera (and Microphone) access is required for proctoring. Please enable them.");
      }
    };

    const loadModel = async () => {
      try {
        await tf.ready();
        const loadedModel = await cocoSsd.load();
        modelRef.current = loadedModel;

        if (!allowHandGestures) {
          try {
            const handModel = await handpose.load();
            handModelRef.current = handModel;
          } catch (e) {
            console.warn("Handpose model failed to load", e);
          }
        }

        console.log("Models loaded");
      } catch (err) {
        console.error("Error loading model:", err);
      }
    };

    setupCamera();
    loadModel();

    return () => {
      if (requestAnimationFrameId) cancelAnimationFrame(requestAnimationFrameId);
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [quizStarted, submitted, allowNoise, allowHandGestures]);

  // Proctoring: Object Detection Loop
  useEffect(() => {
    if (!quizStarted || submitted || !isCameraReady) return;

    let requestAnimationFrameId;

    const detectCheating = async () => {
      if (modelRef.current && videoRef.current) {
        try {
          const predictions = await modelRef.current.detect(videoRef.current);
          const cellPhoneDetected = predictions.some(p => p.class === 'cell phone' && p.score > 0.6);
          const personCount = predictions.filter(p => p.class === 'person' && p.score > 0.6).length;

          if (cellPhoneDetected) {
            issueWarning("Cell phone detected in camera frame!");
          }
          if (personCount > 1) {
            issueWarning("Multiple people detected in camera frame!");
          }
          if (personCount === 0) {
            issueWarning("No person detected in camera frame! Please stay visible.");
          }
        } catch (err) {
          // ignore transient detection errors
        }

        if (!allowHandGestures && handModelRef.current) {
          try {
            const handPredictions = await handModelRef.current.estimateHands(videoRef.current);

            if (handPredictions.length > 0) {
              const hand = handPredictions[0];
              const confidence = hand.handInViewConfidence;

              // Calculate bounding box area to ensure it's not a tiny glitch artifact
              let boxArea = 0;
              if (hand.boundingBox) {
                const width = hand.boundingBox.bottomRight[0] - hand.boundingBox.topLeft[0];
                const height = hand.boundingBox.bottomRight[1] - hand.boundingBox.topLeft[1];
                boxArea = width * height;
              }

              // Only flag if confidence is high AND the detected area is reasonably large 
              // (Filters out tiny face/mouth movements being recognized as hands)
              if (confidence > 0.90 && boxArea > 5000) {
                // Require it to be present for a moment, not just a 1-frame glitch
                if (!window.handGlitches) window.handGlitches = 0;
                window.handGlitches++;

                if (window.handGlitches > 3) {
                  issueWarning("Suspicious hand gesture detected in camera frame!");
                  window.handGlitches = 0; // reset after warning
                }
              } else {
                window.handGlitches = 0; // reset if confidence drops
              }
            } else {
              window.handGlitches = 0; // reset if no hands
            }
          } catch (err) { }
        }

        if (!allowNoise && analyserRef.current) {
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const averageVolume = sum / dataArray.length;

          // Slightly increased threshold to avoid very minor background noise triggering it
          if (averageVolume > 45) {
            issueWarning("Loud noise or talking detected!");
          }
        }
      }
      requestAnimationFrameId = requestAnimationFrame(detectCheating);
    };

    detectCheating();

    return () => {
      if (requestAnimationFrameId) cancelAnimationFrame(requestAnimationFrameId);
    };
  }, [quizStarted, submitted, isCameraReady, allowNoise, allowHandGestures]);

  // Start Test
  const handleTest = async () => {
    const input = document.getElementById('link');
    const url = input.value.trim();

    if (!url) return alert('Please paste quiz link');

    const extractedId = url.split('/').pop();
    setQuizId(extractedId);
    setLoading(true);

    try {
      const checkRes = await fetch(
        `/api/checkAttempt/${extractedId}?email=${encodeURIComponent(
          user.primaryEmailAddress.emailAddress
        )}`
      );

      if (checkRes.status === 403) {
        alert('You have already attempted this quiz.');
        navigate('/');
        return;
      }

      // We need to fetch test data FIRST to know if we need microphone permissions
      const initialRes = await fetch(`/api/getTest/${extractedId}`);
      const initialData = await initialRes.json();

      if (initialData.error) {
        alert(initialData.error);
        setLoading(false);
        return;
      }

      const now = new Date();
      if (initialData.startDate && new Date(initialData.startDate) > now) {
        alert("This quiz has not started yet.");
        setLoading(false);
        return;
      }
      if (initialData.endDate && new Date(initialData.endDate) < now) {
        alert("This quiz has already ended.");
        setLoading(false);
        return;
      }

      setAllowNoise(initialData.allowNoise);
      setAllowHandGestures(initialData.allowHandGestures);
      setPassPercentage(initialData.passPercentage || 70);

      const requiresAudio = !initialData.allowNoise;

      // Request permissions before starting the exam to prevent false 'blur' cheating warnings from native prompts
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: requiresAudio });
        stream.getTracks().forEach(track => track.stop());
      } catch (err) {
        alert(`Camera ${requiresAudio ? 'and Microphone ' : ''}permissions are required to start this proctored test!`);
        setLoading(false);
        return;
      }

      // Check if there is an existing saved session
      const savedSessionStr = localStorage.getItem(`quizData_${extractedId}`);
      if (savedSessionStr) {
        const savedSession = JSON.parse(savedSessionStr);
        const timeSinceLastActive = (Date.now() - savedSession.lastActiveTimestamp) / 1000;

        // 5 minutes = 300 seconds
        if (timeSinceLastActive > 300) {
          alert("Your exam session has expired due to being offline for more than 5 minutes. Submitting your saved answers.");

          // Hydrate state so handleSubmit uses saved answers
          setQuizContent(savedSession.quizContent);
          setAnswers(savedSession.answers);
          setScore(savedSession.score || 0);
          setWarningLogs(savedSession.warningLogs || []);
          setQuizStarted(true);

          // Wait briefly for state to update, then submit
          setTimeout(() => {
            handleSubmitData(
              savedSession.quizContent,
              savedSession.answers,
              savedSession.warningLogs,
              extractedId
            );
          }, 100);
          return;
        } else {
          // Resume within 5 minutes
          alert("Resuming your existing exam session.");
          setQuizContent(savedSession.quizContent);
          setTimeLeft(savedSession.timeLeft);
          setAnswers(savedSession.answers);
          setWarningLogs(savedSession.warningLogs || []);
          setCheatWarnings(savedSession.cheatWarnings || 0);
          setQuizStarted(true);
          setCurrentQuestion(0);
          setLoading(false);
          return;
        }
      }

      setQuizContent(initialData.content);
      setTimeLeft(initialData.time * 60);
      setQuizStarted(true);
      setCurrentQuestion(0);
    } catch (err) {
      console.error('Error loading quiz:', err);
    }

    setLoading(false);
  };

  // Helper to submit without relying completely on component state during an auto-submit scenario
  const handleSubmitData = async (content, currentAnswers, warnings, currentQuizId) => {
    let userScore = 0;
    content.forEach((q, index) => {
      if (currentAnswers[index] === q.answer) {
        userScore++;
      }
    });

    setScore(userScore);
    setSubmitted(true);
    localStorage.removeItem(`quizData_${currentQuizId}`);

    try {
      await fetch('/api/addResponse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: user.firstName,
          email: user.primaryEmailAddress.emailAddress,
          answers: currentAnswers,
          score: userScore,
          quizId: currentQuizId,
          warnings: warnings,
        }),
      });
    } catch (err) {
      console.error('Error auto-submitting response:', err);
    }
  };

  // Timer & Auto-Save
  useEffect(() => {
    if (!quizStarted || submitted) return;

    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);

      // Auto-save to localStorage
      if (quizId) {
        const sessionData = {
          quizContent,
          answers,
          timeLeft: timeLeft - 1,   // save the next tick time
          warningLogs,
          cheatWarnings,
          score,
          lastActiveTimestamp: Date.now()
        };
        localStorage.setItem(`quizData_${quizId}`, JSON.stringify(sessionData));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, quizStarted, submitted, quizId, answers, warningLogs, cheatWarnings, score, quizContent]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Handle Answer Selection
  const handleAnswerChange = (questionIndex, selectedOption) => {
    if (submitted) return;

    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: selectedOption,
    }));
  };

  // Navigate to next question
  const goToNextQuestion = () => {
    if (currentQuestion < quizContent.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  // Navigate to previous question
  const goToPreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  // Submit Quiz
  const handleSubmit = async () => {
    if (submitted) return;

    let userScore = 0;

    quizContent.forEach((q, index) => {
      if (answers[index] === q.answer) {
        userScore++;
      }
    });

    setScore(userScore);
    setSubmitted(true);

    try {
      await fetch('/api/addResponse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: user.firstName,
          email: user.primaryEmailAddress.emailAddress,
          answers,
          score: userScore,
          quizId,
          warnings: warningLogs,
        }),
      });
    } catch (err) {
      console.error('Error submitting response:', err);
    }
  };

  // Load Leaderboard
  const loadLeaderboard = async () => {
    try {
      const res = await fetch(`/api/leaderboard/${quizId}`);
      const data = await res.json();
      setTopUsers(data);
      setShowLeaderboard(true);
    } catch (err) {
      console.error('Error loading leaderboard:', err);
    }
  };

  // Calculate percentage
  const percentage = quizContent.length > 0 ? Math.round((score / quizContent.length) * 100) : 0;

  // Verification Screen
  if (!isVerified) {
    return <VerificationGate onVerificationSuccess={() => setIsVerified(true)} />;
  }

  // Landing/Input Screen
  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-16">
            <div>
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
                Quiz-Wuiz
              </h1>
            </div>
          </div>

          {/* Main Card */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700 rounded-2xl p-12 backdrop-blur-sm">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">Ready to Test Your Knowledge?</h2>
              <p className="text-slate-400 text-lg">Paste your quiz link below to begin</p>
            </div>

            {/* Input Section */}
            <div className="space-y-4">
              <div>
                <input
                  id="link"
                  type="url"
                  placeholder="https://example.com/quiz/xyz123"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>

              <button
                onClick={handleTest}
                disabled={loading}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-600 disabled:to-slate-600 text-white font-semibold rounded-xl transition transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin">⏳</div>
                    Loading Quiz...
                  </>
                ) : (
                  <>
                    Start Quiz
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-3 gap-4 mt-12">
              <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
                <div className="text-2xl mb-2">⚡</div>
                <p className="text-sm text-slate-300">Quick Questions</p>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
                <div className="text-2xl mb-2">⏱️</div>
                <p className="text-sm text-slate-300">Timed Sessions</p>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
                <div className="text-2xl mb-2">🏆</div>
                <p className="text-sm text-slate-300">Leaderboards</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Quiz Screen
  if (quizStarted && !submitted) {
    const currentQ = quizContent[currentQuestion];
    const answeredCount = Object.keys(answers).length;
    const isAnswered = answers[currentQuestion] !== undefined;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
        {/* Top Bar */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">Question {currentQuestion + 1} of {quizContent.length}</h1>
            </div>
            <div className="flex gap-4 items-center">
              {cheatWarnings > 0 && (
                <div className="flex items-center gap-2 bg-red-900/50 border border-red-700 rounded-xl px-4 py-2">
                  <span className="text-red-400 font-bold text-sm">Warnings: {cheatWarnings}</span>
                </div>
              )}
              <div className="flex items-center gap-3 bg-slate-800/50 border border-slate-700 rounded-xl px-6 py-3">
                <Clock className="w-5 h-5 text-blue-400" />
                <span className={`font-mono text-lg font-bold ${timeLeft <= 60 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / quizContent.length) * 100}%` }}
            />
          </div>
          <p className="text-sm text-slate-400 mt-2">{answeredCount} of {quizContent.length} answered</p>
        </div>

        {/* Question Card */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700 rounded-2xl p-8 backdrop-blur-sm">
            {/* Question Title */}
            <h2 className="text-2xl font-bold mb-8 leading-relaxed">{currentQ.question}</h2>

            {/* Options */}
            <div className="space-y-3 mb-8">
              {Object.entries(currentQ.options).map(([key, value]) => (
                <label
                  key={key}
                  className={`block p-4 rounded-xl border-2 cursor-pointer transition transform hover:scale-102 ${answers[currentQuestion] === key
                    ? 'border-blue-500 bg-blue-500/20'
                    : 'border-slate-600 bg-slate-700/30 hover:border-slate-500 hover:bg-slate-700/50'
                    }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${answers[currentQuestion] === key
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-slate-400'
                        }`}
                    >
                      {answers[currentQuestion] === key && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    <input
                      type="radio"
                      name={`question-${currentQuestion}`}
                      value={key}
                      checked={answers[currentQuestion] === key}
                      onChange={() => handleAnswerChange(currentQuestion, key)}
                      className="sr-only"
                    />
                    <span className="text-lg font-medium">{key.toUpperCase()}) {value}</span>
                  </div>
                </label>
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-4 justify-between">
              <button
                onClick={goToPreviousQuestion}
                disabled={currentQuestion === 0}
                className="px-6 py-3 bg-slate-700/50 hover:bg-slate-600/50 disabled:opacity-30 rounded-lg font-medium transition"
              >
                Previous
              </button>

              <div className="flex gap-2 flex-wrap justify-center">
                {quizContent.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestion(index)}
                    className={`w-10 h-10 rounded-lg font-medium transition ${index === currentQuestion
                      ? 'bg-blue-600 text-white'
                      : answers[index] !== undefined
                        ? 'bg-emerald-600/50 text-emerald-200'
                        : 'bg-slate-700 text-slate-300'
                      }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              {currentQuestion === quizContent.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  disabled={answeredCount !== quizContent.length}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-slate-600 disabled:to-slate-600 text-white font-medium rounded-lg transition"
                >
                  Submit Quiz
                </button>
              ) : (
                <button
                  onClick={goToNextQuestion}
                  disabled={!isAnswered}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-600 disabled:to-slate-600 text-white font-medium rounded-lg transition"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Floating Camera for Proctoring */}
        <div className="fixed bottom-6 right-6 w-48 h-36 bg-black rounded-lg border-2 border-slate-600 overflow-hidden shadow-2xl z-50 pointer-events-none">
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          {!isCameraReady && <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400 bg-black/80">Initializing Camera...</div>}
        </div>
      </div>
    );
  }

  // Results Screen
  if (submitted) {
    const rating = percentage >= passPercentage ? '🏆 Passed' : '📚 Failed. Keep Practicing';

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6 flex items-center justify-center">
        {/* Animated Background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />

        {/* Results Card */}
        <div className="relative z-10 max-w-2xl w-full">
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700 rounded-3xl p-12 backdrop-blur-sm text-center">
            {/* Celebration Icon */}
            <div className="mb-8 flex justify-center">
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-5xl animate-bounce">
                🎉
              </div>
            </div>

            {/* Title */}
            <h1 className="text-4xl font-bold mb-2">Congratulations!</h1>
            <p className="text-slate-400 text-lg mb-8">You completed the quiz</p>

            {/* Score Display */}
            <div className="bg-gradient-to-r from-slate-700/50 to-slate-800/50 border border-slate-600 rounded-2xl p-8 mb-8">
              <div className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400 mb-3">
                {percentage}%
              </div>
              <p className="text-2xl font-semibold mb-2">{score} out of {quizContent.length}</p>
              <p className="text-lg text-slate-300">{rating}</p>
            </div>

            {/* Results Breakdown */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600">
                <div className="text-2xl mb-2">✅</div>
                <p className="text-sm text-slate-300 mb-1">Correct</p>
                <p className="text-2xl font-bold text-emerald-400">{score}</p>
              </div>
              <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600">
                <div className="text-2xl mb-2">❌</div>
                <p className="text-sm text-slate-300 mb-1">Incorrect</p>
                <p className="text-2xl font-bold text-red-400">{quizContent.length - score}</p>
              </div>
              <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600">
                <div className="text-2xl mb-2">📊</div>
                <p className="text-sm text-slate-300 mb-1">Accuracy</p>
                <p className="text-2xl font-bold text-blue-400">{percentage}%</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate('/')}
                className="px-8 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold transition">
                Back Home
              </button>

              <button
                onClick={() => navigate('/certificate')}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-lg font-medium transition transform hover:scale-105">
                Download Certificate
              </button>

              <button
                onClick={loadLeaderboard}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg font-semibold transition flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                View Leaderboard
              </button>
            </div>
          </div>
        </div>

        {/* Leaderboard Modal */}
        {showLeaderboard && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700 rounded-3xl max-w-md w-full backdrop-blur-sm max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-b border-slate-700 px-8 py-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                  <h2 className="text-2xl font-bold">Top Scorers</h2>
                </div>
                <button
                  onClick={() => setShowLeaderboard(false)}
                  className="p-2 hover:bg-slate-700 rounded-lg transition text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* Leaderboard List */}
              <div className="p-8">
                {topUsers.length === 0 ? (
                  <p className="text-slate-400 text-center py-8">No attempts yet.</p>
                ) : (
                  <div className="space-y-4">
                    {topUsers.map((user, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border ${index === 0
                          ? 'bg-yellow-500/20 border-yellow-500/50'
                          : index === 1
                            ? 'bg-slate-700/50 border-slate-600'
                            : index === 2
                              ? 'bg-orange-500/10 border-orange-500/30'
                              : 'bg-slate-700/30 border-slate-600'
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center font-bold text-sm">
                              {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                            </div>
                            <span className="font-semibold">{user.name}</span>
                          </div>
                          <span className="text-lg font-bold text-emerald-400">{user.score}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => setShowLeaderboard(false)}
                  className="w-full mt-8 px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}
