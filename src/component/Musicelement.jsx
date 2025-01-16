import React, { useState, useRef, useEffect } from "react";
import { IoIosRepeat, IoIosShuffle } from "react-icons/io";
import { MdOutlineSkipPrevious, MdOutlineSkipNext } from "react-icons/md";
import { FaPlay, FaPause } from "react-icons/fa";
import { LuRepeat1 } from "react-icons/lu";
import imgSrc from "../assets/default.png";
import MusicList from './Musiclist';
import MediaPipeControls from './MediaPipeControls';

const Musicelement = () => {
  const audioRef = useRef(new Audio());
  const [isHovered, setisHovered] = useState(false);
  const [musicDetails, setmusicDetails] = useState(null);
  const [isplay, setisPlay] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [musicListdata, setMusicListdata] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isrep, setisRep] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [hasPlayedInitially, setHasPlayedInitially] = useState(false);

  const handleDragOver = (event) => {
    event.preventDefault();
    setisHovered(true);
  };

  const handleDragLeave = () => {
    setisHovered(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setisHovered(false);
    const file = event.dataTransfer.files[0];
    if (file && file.type === "audio/mpeg") {
      uploadAudio(file);
    } else {
      setError("Please choose an MP3 file");
    }
  };

  const uploadAudio = async (file) => {
    setError(null);
    setIsLoading(true);
    
    try {
      const formdata = new FormData();
      formdata.append("mp3file", file);
  
      const response = await fetch("http://localhost:8000/uploadsong", {
        method: "POST",
        body: formdata,
        credentials: 'include',
        mode: 'cors',
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Upload failed with status: ${response.status}`);
      }
  
      const data = await response.json();
      
      if (!data || !data.filename) {
        throw new Error('Invalid response from server');
      }

      const songDetails = {
        title: data.title || file.name,
        artist: data.artist || 'Unknown Artist',
        picture: data.picture || null,
        audioName: data.filename
      };
      
      setmusicDetails(songDetails);
  
      const audioUrl = `http://localhost:8000/uploads/${data.filename}`;
      audioRef.current.src = audioUrl;
      
      const currentAudio = audioRef.current;
      const metadataHandler = () => setDuration(currentAudio.duration);
      const timeUpdateHandler = () => setCurrentTime(currentAudio.currentTime);
      
      currentAudio.addEventListener("loadedmetadata", metadataHandler);
      currentAudio.addEventListener("timeupdate", timeUpdateHandler);
      currentAudio.addEventListener("ended", handleSongEnd);

      await audioRef.current.play();
      setisPlay(true);
  
      await fetchList();
  
      return () => {
        currentAudio.removeEventListener("loadedmetadata", metadataHandler);
        currentAudio.removeEventListener("timeupdate", timeUpdateHandler);
        currentAudio.removeEventListener("ended", handleSongEnd);
      };
  
    } catch (error) {
      console.error("Upload error:", error);
      setError(error.message || 'Failed to upload file');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSongEnd = () => {
    setisPlay(false);
    if (isrep) {
      audioRef.current.play();
      setisPlay(true);
    } else if (isShuffle) {
      playRandomSong();
    } else {
      nextPlay();
    }
  };

  const handlePlay = () => {
    if (!musicDetails) {
      setError("Please select or upload a song first");
      return;
    }

    if (audioRef.current.paused) {
      audioRef.current.play()
        .then(() => {
          setisPlay(true);
          setError(null);
        })
        .catch(err => {
          setError("Failed to play audio: " + err.message);
        });
    } else {
      audioRef.current.pause();
      setisPlay(false);
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const handleProgress = (e) => {
    if (!audioRef.current.duration) return;
    
    const progress = e.currentTarget;
    const clickedPos = e.clientX - progress.getBoundingClientRect().left;
    const progressWidth = progress.clientWidth;
    const seekTime = (clickedPos / progressWidth) * audioRef.current.duration;
    
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const fetchList = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("http://localhost:8000/getItem");
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (Array.isArray(data)) {
        setMusicListdata(data);
      } else {
        throw new Error("Invalid data format received");
      }
    } catch (error) {
      setError(error.message);
      console.error("Fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedSong = (clickedSong, index) => {
    const audioUrl = `http://localhost:8000/uploads/${clickedSong.audioName}`;
    audioRef.current.src = audioUrl;
    audioRef.current.play()
      .then(() => {
        setisPlay(true);
        setmusicDetails(clickedSong);
        setCurrentIndex(index);
        setError(null);
      })
      .catch(err => {
        setError("Failed to play audio: " + err.message);
      });
  };

  const nextPlay = () => {
    if (musicListdata.length === 0) return;
    const nextSong = (currentIndex + 1) % musicListdata.length;
    setCurrentIndex(nextSong);
    selectedSong(musicListdata[nextSong], nextSong);
  };

  const prevPlay = () => {
    if (musicListdata.length === 0) return;
    const prevSong = (currentIndex - 1 + musicListdata.length) % musicListdata.length;
    setCurrentIndex(prevSong);
    selectedSong(musicListdata[prevSong], prevSong);
  };

  const playRandomSong = () => {
    if (musicListdata.length <= 1) return;
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * musicListdata.length);
    } while (randomIndex === currentIndex);
    
    setCurrentIndex(randomIndex);
    selectedSong(musicListdata[randomIndex], randomIndex);
  };

  const toggleRepeat = () => {
    setisRep(!isrep);
  };

  const toggleShuffle = () => {
    setIsShuffle(!isShuffle);
  };

  useEffect(() => {
    fetchList();
    
    return () => {
      audioRef.current.removeEventListener("ended", handleSongEnd);
    };
  }, []);

  useEffect(() => {
    audioRef.current.loop = isrep;
  }, [isrep]);

  return (
    <div className="musicelement">
      <div className="song-and-list-container">
        <div
          className={`song_picture ${isHovered ? "hovered" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{ maxHeight: '30vh' }}
        >
          {musicDetails && (
            <img
              src={
                musicDetails.picture
                  ? `data:image/jpeg;base64,${musicDetails.picture}`
                  : imgSrc
              }
              alt="album art"
            />
          )}
          {!musicDetails && <p>Drag and drop MP3 file here</p>}
        </div>

        <MusicList 
          musicListdata={musicListdata}
          selectedSong={selectedSong}
          isLoading={isLoading}
          error={error}
          currentIndex={currentIndex}
          style={{ flex: 1 }}
        />
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="song_detail" style={{ 
        width: '500px', 
        marginLeft: '0%',  
        marginRight: 'auto'
      }}>
        <marquee behavior="" direction="" style={{ width: '100%' }}>
          {musicDetails ? musicDetails.title || musicDetails.audioName : "No song selected"}
        </marquee>
        <p>{musicDetails && musicDetails.artist}</p>
      </div>

      <div className="playback-controls">
        <div className="progress">
          <div className="time">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>

          <div className="progress_bar" onClick={handleProgress}>
            <div
              className="progress_line"
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            ></div>
          </div>
        </div>

        <div className="controls-bar">
          <button 
            onClick={toggleRepeat} 
            className={`control-button ${isrep ? "active" : ""}`}
          >
            {isrep ? <LuRepeat1 /> : <IoIosRepeat />}
          </button>

          <button 
            onClick={prevPlay} 
            className="control-button"
            disabled={musicListdata.length === 0}
          >
            <MdOutlineSkipPrevious />
          </button>

          <button 
            className="control-button play-button"
            onClick={handlePlay}
            style={{ fontSize: '1.5rem' }}
          >
            {isplay ? <FaPause /> : <FaPlay />}
          </button>

          <button 
            onClick={nextPlay} 
            className="control-button"
            disabled={musicListdata.length === 0}
          >
            <MdOutlineSkipNext />
          </button>

          <button 
            onClick={toggleShuffle} 
            className={`control-button ${isShuffle ? "active" : ""}`}
          >
            <IoIosShuffle />
          </button>
        </div>
      </div>

      <MediaPipeControls 
  isPlaying={isplay}
  onPlayPause={handlePlay}
  onNext={nextPlay}
  onPrevious={prevPlay}
  hasPlayedInitially={hasPlayedInitially}
  setHasPlayedInitially={setHasPlayedInitially}
/>
    </div>
  );
};

export default Musicelement;