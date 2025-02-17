# Gesture-Controlled Music Player Application

## Overview
This repository contains the source code and documentation for a gesture-controlled music player application developed using computer vision and deep learning techniques. The application leverages modern web technologies (MERN Stack) and advanced libraries like OpenCV and MediaPipe to provide an intuitive and responsive user interface for controlling music playback using hand gestures.

## Features
- **Gesture Recognition**: Real-time hand gesture recognition using MediaPipe and a custom-trained CNN model.
- **Responsive UI**: Built with React.js for a seamless and interactive user experience.
- **Backend**: Node.js and Express.js for efficient server-side management of music data.
- **Database**: MongoDB for storing user playlists and music metadata.
- **Real-time Feedback**: Immediate visual feedback on recognized gestures to enhance user interaction.

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4 or higher)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/gesture-controlled-music-player.git
   ```
2. Navigate to the project directory:
   ```bash
   cd gesture-controlled-music-player
   ```
3. Install dependencies for both the frontend and backend:
   ```bash
   npm install
   cd client
   npm install
   cd ..
   ```

### Running the Application
1. Start the MongoDB server:
   ```bash
   mongod
   ```
2. Start the backend server using nodemon:
   ```bash
   npm run server
   ```
3. Start the frontend development server:
   ```bash
   cd client
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:3000` to see the application in action.



## Usage
- **Play/Pause**: Make a fist and then open your hand.
- **Next Track**: Swipe your hand to the right.
- **Previous Track**: Swipe your hand to the left.
- **Stop**: Make a stop sign with your hand.


## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments
- [MediaPipe](https://mediapipe.dev/) for hand tracking and gesture recognition.
- [OpenCV](https://opencv.org/) for computer vision tasks.
- [MongoDB](https://www.mongodb.com/) for database management.
- [Express.js](https://expressjs.com/) and [Node.js](https://nodejs.org/) for backend development.
- [React.js](https://reactjs.org/) for frontend development.

