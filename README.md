# Quiz-Wuiz: AI-Proctored Examination Platform

Quiz-Wuiz is a modern, secure, and fully automated online examination system. It integrates advanced artificial intelligence models directly within the browser to ensure academic integrity without compromising user privacy.

## 🚀 Features

*   **Real-time AI Proctoring**: Utilizes machine learning to continuously monitor the candidate's environment.
*   **Identity Verification**: Uses facial recognition to ensure the person giving the test matches their registered profile.
*   **Intelligent Cheat Detection**: 
    *   **Tab Switching/Focus Loss**: Detects if the user navigates away from the exam tab.
    *   **Object Detection**: Identifies banned objects (like cell phones) in the camera frame.
    *   **Multiple Person Detection**: Flags warnings if more than one person appears in the frame or if no person is detected.
    *   **Suspicious Gesture Detection**: Uses hand tracking to detect suspicious hand movements.
    *   **Audio Monitoring**: Listens for loud noises or talking.
*   **Auto-Submission**: Automatically submits the exam upon exceeding the maximum allowed cheating warnings (5 warnings).
*   **Automated Evaluation & Certification**: Instantly grades the exam, generates a leaderboard, and provides a downloadable certificate for users who pass.

## 💻 Tech Stack

*   **Frontend**: React (v19), Vite, Tailwind CSS, Lucide React (for icons)
*   **Backend**: Node.js, Express, Mongoose (MongoDB)
*   **Authentication**: Clerk
*   **Machine Learning**: TensorFlow.js, `@tensorflow-models`, and `@vladmandic/face-api`
*   **Utilities**: `react-webcam` for video capture, `react-to-print` for certificate generation, `pdf-parse` for parsing text.

## 🧠 ML Models & Datasets Used

This project heavily relies on pre-trained ML models executed directly in the browser via WebGL/WebAssembly for zero-latency monitoring.

1.  **COCO-SSD (`@tensorflow-models/coco-ssd`)**
    *   **Purpose**: Real-time object detection.
    *   **Usage here**: Detects the presence of "cell phones" to prevent cheating and counts the number of "persons" to ensure only the candidate is present.
    *   **Dataset**: Trained on the massive **COCO (Common Objects in Context)** dataset containing over 330k images and 80 object categories.

2.  **Handpose (`@tensorflow-models/handpose`)**
    *   **Purpose**: Hand gesture and pose tracking.
    *   **Usage here**: Identifies 21 3D hand keypoints in real-time to detect suspicious hand movements (e.g., covering the mouth, signaling).
    *   **Dataset**: Trained by Google on a diverse dataset of hands with complex backgrounds and varying lighting conditions.

3.  **Face API (`@vladmandic/face-api`)**
    *   **Purpose**: Facial recognition and identity verification.
    *   **Usage here**: Verifies if the face in the live webcam feed matches the candidate's previously registered reference photo using Euclidean distance analysis on 128-dimensional face descriptors.
    *   **Models used internally**: `ssdMobilenetv1` (face detection), `faceLandmark68Net` (landmark detection), `faceRecognitionNet` (feature extraction).

4.  **Web Audio API (Browser Native)**
    *   **Purpose**: Audio and noise monitoring.
    *   **Usage here**: Captures the microphone stream, routes it through an `AudioContext` and an `AnalyserNode`, and calculates the average frequency volume to detect loud noises and talking without recording or saving any audio files.

5.  **Page Visibility & DOM Events (Browser Native)**
    *   **Purpose**: Tab switching and focus loss detection.
    *   **Usage here**: Listens to the `visibilitychange` event on the `document` (triggered when the user switches tabs or minimizes the browser) and the `blur` event on the `window` (triggered when the exam window loses focus) to instantly flag cheating attempts.

## 🎙️ Common Interview Questions & Answers

**Q: What exactly does this project do?**
> Quiz-Wuiz is an automated remote proctoring system. It allows teachers or admins to create quizzes, and users to take them in a strictly monitored environment. Standard online quizzes are easy to cheat on, so this project uses AI to analyze webcam and microphone feeds in real-time. It issues automated warnings for cheating behaviors and forcefully submits the test if the user receives 5 warnings.

**Q: Face verification uses face-api, hand pose uses handpose, and phone detection uses coco-ssd. How exactly do you detect noise and tab switching?**
> **For noise detection:** I used the browser's native **Web Audio API**. I pass the microphone stream into an `AudioContext` and use an `AnalyserNode` to extract the frequency data (FFT) in real-time. By averaging the byte frequency data, I calculate a real-time "volume level". If this volume exceeds a certain threshold (meaning the user is speaking or there is loud background noise), a warning is issued. The audio is purely mathematical data; I am *not* recording or transmitting voice recordings, which keeps it highly privacy-compliant.
> 
> **For tab switching:** I utilized native **DOM Event Listeners**. I listen for the `visibilitychange` event on the `document` (which tells me if the tab is hidden or minimized) and the `blur` event on the `window` (which tells me if the user clicked outside the exam window, like on another monitor or application). If either event fires, the system immediately logs a warning.

**Q: Why did you choose TensorFlow.js to run models in the browser instead of sending images to a backend server?**
> Three main reasons: **Privacy, Latency, and Cost**. By processing the video stream locally in the user's browser, no sensitive video data ever leaves their machine, protecting their privacy. It also eliminates network latency, enabling instant warnings. Finally, it drastically reduces server computation costs because the AI inference heavy lifting is distributed to the clients' devices.

**Q: How does the identity verification (`VerificationGate`) work?**
> During their first login, the user sets up a reference photo which is securely stored. When they attempt a quiz, the application takes a live snapshot from their webcam. Both the live photo and the securely fetched reference photo are parsed by `face-api.js` to compute a 128-dimensional facial descriptor. If the Euclidean distance between these two descriptors is below a strict threshold (< 0.6), the user is verified and allowed to proceed.

**Q: Did you train the datasets yourself?**
> No, training robust computer vision models from scratch requires massive amounts of curated data and significant GPU resources. I utilized highly optimized, pre-trained models from the TensorFlow ecosystem and `face-api.js`. My engineering focus was on effectively integrating these architectures into a responsive React frontend, optimizing their inference loop (using `requestAnimationFrame`), and formulating customized logic (e.g., scoring confidences and debouncing warnings) to fit the specific use-case of an online exam.

**Q: How do you handle false positives (e.g., the system thinks the user is cheating when they aren't)?**
> AI models can sometimes be overly sensitive. To mitigate this:
> 1.  I implemented **confidence thresholds**. For example, the handpose model and object detection models only flag items if their prediction confidence is high (e.g., > 0.85).
> 2.  **Cooldowns and Debouncing**: I wrapped the warning emission system in a cooldown timer (4 seconds) so that a transient glitch doesn't immediately exhaust the user's 5 warnings.
> 3.  **Volume Thresholding**: The microphone monitoring averages audio frequencies to distinguish between standard ambient noise and actual talking/loud sounds.

## 🛠️ How to run locally

1.  Clone the repository.
2.  Install dependencies: `npm install`
3.  Set up environment variables (`.env`) for Clerk authentication and backend endpoints.
4.  Run the development server for the backend (usually on port 5000).
5.  Start the Vite frontend: `npm run dev`
6.  Navigate to `http://localhost:5173` to test the application.
