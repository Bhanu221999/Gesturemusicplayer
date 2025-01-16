import React from 'react';
import { act } from 'react';
import * as audioPlayer from './audioPlayer';

describe('Audio Player Functions', () => {
    let setError, setIsLoading, setmusicDetails, setDuration, setCurrentTime, setisPlay, setMusicListdata;
    let audioRef;

    beforeEach(() => {
        audioRef = {
            current: {
                src: '',
                play: jest.fn(),
                pause: jest.fn(),
                duration: 120, // Set a default duration
                currentTime: 0,
                load: jest.fn(),
                addEventListener: jest.fn(),
                removeEventListener: jest.fn(),
            }
        };

        // Mock state updater functions
        setError = jest.fn();
        setIsLoading = jest.fn();
        setmusicDetails = jest.fn();
        setDuration = jest.fn();
        setCurrentTime = jest.fn();
        setisPlay = jest.fn();
        setMusicListdata = jest.fn();

        // Reset fetch mock
        global.fetch = jest.fn();
    });

    it('should handle successful audio upload and play', async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                filename: "test.mp3",
                title: "Test Song",
                artist: "Test Artist",
                picture: null,
            }),
        });

        const file = new File(["dummy content"], "test.mp3", { type: "audio/mp3" });

        await act(async () => {
            await audioPlayer.uploadAudio(
                file, 
                setError, 
                setIsLoading, 
                setmusicDetails, 
                audioRef, 
                setisPlay
            );
        });

        expect(fetch).toHaveBeenCalledWith("http://localhost:8000/uploadsong", expect.any(Object));
        expect(setmusicDetails).toHaveBeenCalledWith({
            title: "Test Song",
            artist: "Test Artist",
            picture: null,
            audioName: "test.mp3",
        });
        expect(audioRef.current.src).toBe("http://localhost:8000/uploads/test.mp3");
        expect(audioRef.current.play).toHaveBeenCalled();
        expect(setisPlay).toHaveBeenCalledWith(true);
    });

    it('should handle server error during audio upload', async () => {
        fetch.mockResolvedValueOnce({
            ok: false,
            status: 400,
            json: async () => ({ error: "Upload failed" }),
        });

        const file = new File(["dummy content"], "test.mp3", { type: "audio/mp3" });

        await act(async () => {
            await audioPlayer.uploadAudio(
                file, 
                setError, 
                setIsLoading, 
                setmusicDetails, 
                audioRef, 
                setisPlay
            );
        });

        expect(fetch).toHaveBeenCalledWith("http://localhost:8000/uploadsong", expect.any(Object));
        expect(setError).toHaveBeenCalledWith("Upload failed");
        expect(setIsLoading).toHaveBeenCalledWith(false);
    });

    it('should fetch music list successfully', async () => {
        const mockList = [{ title: "Song 1" }, { title: "Song 2" }];

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockList,
        });

        await act(async () => {
            await audioPlayer.fetchList(setMusicListdata, setError);
        });

        expect(fetch).toHaveBeenCalledWith("http://localhost:8000/getItem");
        expect(setMusicListdata).toHaveBeenCalledWith(mockList);
        expect(setError).not.toHaveBeenCalled();
    });

    it('should handle error while fetching music list', async () => {
        fetch.mockResolvedValueOnce({
            ok: false,
            status: 500,
        });

        await act(async () => {
            await audioPlayer.fetchList(setMusicListdata, setError);
        });

        expect(fetch).toHaveBeenCalledWith("http://localhost:8000/getItem");
        expect(setError).toHaveBeenCalledWith("HTTP error! status: 500");
    });

    it('should format time correctly', () => {
        expect(audioPlayer.formatTime(75)).toBe("01:15");
        expect(audioPlayer.formatTime(0)).toBe("00:00");
        expect(audioPlayer.formatTime(NaN)).toBe("00:00");
    });

    it('should update progress on handleProgress', () => {
        const mockEvent = {
            currentTarget: { 
                clientWidth: 100,
                getBoundingClientRect: () => ({ left: 0 }) 
            },
            clientX: 50
        };

        audioRef.current.duration = 120;

        act(() => {
            audioPlayer.handleProgress(mockEvent, audioRef, setCurrentTime);
        });

        expect(audioRef.current.currentTime).toBe(60); // Clicked at 50% of the progress bar
        expect(setCurrentTime).toHaveBeenCalledWith(60);
    });
});