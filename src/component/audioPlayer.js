// src/component/audioPlayer.js
export async function uploadAudio(file, setError, setIsLoading, setmusicDetails, audioRef, setisPlay) {
    try {
        setIsLoading(true);
        const formData = new FormData();
        formData.append('audio', file);

        const response = await fetch('http://localhost:8000/uploadsong', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setmusicDetails({
            title: data.title,
            artist: data.artist,
            picture: data.picture,
            audioName: data.filename
        });

        audioRef.current.src = `http://localhost:8000/uploads/${data.filename}`;
        await audioRef.current.play();
        setisPlay(true);
        setIsLoading(false);
    } catch (error) {
        setError(error.message);
        setIsLoading(false);
    }
}

export async function fetchList(setMusicListdata, setError) {
    try {
        const response = await fetch('http://localhost:8000/getItem');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setMusicListdata(data);
    } catch (error) {
        setError(error.message);
    }
}

export function formatTime(time) {
    if (isNaN(time)) return "00:00";
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function handleProgress(event, audioRef, setCurrentTime) {
    const progressBar = event.currentTarget || { clientWidth: 100, getBoundingClientRect: () => ({ left: 0 }) };
    const clickPosition = (event.clientX - progressBar.getBoundingClientRect().left) / progressBar.clientWidth;
    const time = clickPosition * audioRef.current.duration;
    
    audioRef.current.currentTime = time;
    setCurrentTime(time);
}