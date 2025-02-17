Gesture-Controlled Music Player Application
Overview
This repository contains the source code and documentation for a gesture-controlled music player application developed using computer vision and deep learning techniques. The application leverages modern web technologies (MERN Stack) and advanced libraries like OpenCV and MediaPipe to provide an intuitive and responsive user interface for controlling music playback using hand gestures.
Features
Gesture Recognition: Real-time hand gesture recognition using MediaPipe and a custom-trained CNN model.
Responsive UI: Built with React.js for a seamless and interactive user experience.
Backend: Node.js and Express.js for efficient server-side management of music data.
Database: MongoDB for storing user playlists and music metadata.
Real-time Feedback: Immediate visual feedback on recognized gestures to enhance user interaction.
Getting Started
Prerequisites
Node.js (v14 or higher)
MongoDB (v4 or higher)
Installation
Clone the repository:
bashCopy
git clone https://github.com/yourusername/gesture-controlled-music-player.git
Navigate to the project directory:
bashCopy
cd gesture-controlled-music-player
Install dependencies for both the frontend and backend:
bashCopy
npm install
cd client
npm install
cd ..
Running the Application
Start the MongoDB server:
bashCopy
mongod
Start the backend server using nodemon:
bashCopy
npm run server
Start the frontend development server:
bashCopy
cd client
npm run dev
Open your browser and navigate to localhost to see the application in action.

Usage
Play/Pause: Make a fist and then open your hand.
Next Track: Swipe your hand to the right.
Previous Track: Swipe your hand to the left.
Stop: Make a stop sign with your hand.
Contributing
Contributions are welcome! Please read the Contributing Guidelines before submitting a pull request.
License
This project is licensed under the MIT License - see the LICENSE file for details.
Acknowledgments
MediaPipe for hand tracking and gesture recognition.
OpenCV for computer vision tasks.
MongoDB for database management.
Express.js and Node.js for backend development.
React.js for frontend development.
