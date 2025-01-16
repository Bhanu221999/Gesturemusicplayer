import React from "react";
import { FaPlay } from "react-icons/fa";
import "./style/style.css";
import imgSrc from "../assets/default.png";

const Musiclist = ({ musicListdata, selectedSong, isLoading, error, currentIndex }) => {
  if (isLoading) {
    return <div className="musicList">Loading music list...</div>;
  }

  if (error) {
    return <div className="musicList">Error: {error}</div>;
  }

  if (!Array.isArray(musicListdata) || musicListdata.length === 0) {
    return <div className="musicList">No music files available. Please upload some music.</div>;
  }

//...

return (
    <div className="musicList" style={{ overflowY: 'auto' }}>
        <ul className="ul_music">
            {musicListdata.map((element, index) => (
                <li 
                    key={index} 
                    onClick={() => selectedSong(element, index)}
                    className={currentIndex === index? "active" : ""}
                    style={{ padding: '0.5rem' }} /* NEW */
                >
                    <img 
                        src={element.picture? `data:image/jpeg;base64,${element.picture}` : imgSrc} 
                        alt={element.audioName || "Music"} 
                        style={{ width: '40px', height: '40px' }} /* NEW */
                    />
                    <div className="song_name_list">
                        <p style={{ fontSize: '0.875rem' }}>{element.audioName}</p>
                        <span>
                            <FaPlay />
                        </span>
                    </div>
                </li>
            ))}
        </ul>
    </div>
);
};

export default Musiclist;