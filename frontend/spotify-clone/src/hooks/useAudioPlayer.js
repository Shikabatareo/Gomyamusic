import { useState, useRef, useEffect } from 'react'

const API_BASE = 'http://localhost:8000'

function useAudioPlayer() {
    const [currentTrack, setCurrentTrack] = useState(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [duration, setDuration] = useState(0)
    const [currentTime, setCurrentTime] = useState(0)

    const audioRef = useRef(new Audio())

    const playTrack = (track) => {
        if (currentTrack && currentTrack.id === track.id) {
            if (isPlaying) {
                audioRef.current.pause()
                setIsPlaying(false)
            } else {
                audioRef.current.play()
                setIsPlaying(true)
            }
            return
        }
        
        let audioUrl = track.file_url
        if (!audioUrl.startsWith('http')) {
            audioUrl = `${API_BASE}${audioUrl.startsWith('/') ? '' : '/'}${audioUrl}`
        }
        
        audioRef.current.src = audioUrl
        audioRef.current.volume = 0.2
        audioRef.current.play().then(() => setIsPlaying(true))
        setCurrentTrack(track)
    }

    const togglePlayPause = () => {
        if (isPlaying) {
            audioRef.current.pause()
            setIsPlaying(false)
        } else {
            audioRef.current.play()
            setIsPlaying(true)
        }
    }

    const handleSeek = (e) => {
        audioRef.current.currentTime = e.target.value
        setCurrentTime(audioRef.current.currentTime)
    }

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    useEffect(() => {
        const audio = audioRef.current
        const updateProgress = () => setCurrentTime(audio.currentTime)
        const updateDuration = () => setDuration(audio.duration)

        audio.addEventListener('timeupdate', updateProgress)
        audio.addEventListener('loadedmetadata', updateDuration)

        return () => {
            audio.removeEventListener('timeupdate', updateProgress)
            audio.removeEventListener('loadedmetadata', updateDuration)
        }
    }, [])

    return {
        currentTrack,
        isPlaying,
        duration,
        currentTime,
        playTrack,
        togglePlayPause,
        handleSeek,
        formatTime
    }
}

export default useAudioPlayer