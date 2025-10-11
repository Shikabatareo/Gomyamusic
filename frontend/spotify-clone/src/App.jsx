import { use, useEffect, useRef, useState } from 'react'
import axios from 'axios'
import './App.css'

const API_BASE = 'http://localhost:8000'

function App() {
  const [tracks, setTracks] = useState([])
  const [currentTrack, setCurrentTrack] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [uploadData, setUploadData] = useState({
    title : '',
    artist_id: '',
    album_id: '',
    duration: '',
    file: null
  })

    const audioRef = useRef(new Audio()).current
    console.log(audioRef);
    
    const playTrack = (track) => {
        if (currentTrack && currentTrack.id == track.id) {
            if(isPlaying) {
                audioRef.pause()
                setIsPlaying(false)
            }
            else {
                audioRef.play() 
                setIsPlaying(true)
            }
            return
        }
        
        let audioUrl = track.file_url
        if (!audioUrl.startsWith('http')) {
            audioUrl = `${API_BASE}${audioUrl.startsWith('/') ? '' : '/'}${audioUrl}`;
        }
        console.log(audioUrl);
        
        audioRef.src = audioUrl
        audioRef.volume = 0.2
        audioRef.play().then(setIsPlaying(true))
        setCurrentTrack(track)
    }
    

  const togglePlayPause = () => {
    if(isPlaying) {
        audioRef.pause()
        setIsPlaying(false)
    }
    else {
        audioRef.play()
        setIsPlaying(true)
    }
  }

  const handleSeek = (e) => {
    audioRef.currentTime = e.target.value
    setCurrentTime(audioRef.currentTime)
  }

  const fetchTracks = async() => {
    try {
        const responce = await axios.get(`${API_BASE}/tracks/`)
        setTracks(responce.data)
        console.log(responce.data)
        console.log(tracks);
        
        // setTracks(responce)
    }
    catch (e) 
    {
        console.log('Ошибка поиска треков ', e);
    }
  }

  const handleUploadChange = (e) => {
    console.log(e.target.name);
    const {name,files} = e.target 
    if (name === 'file') {
        setUploadData(prev => ({
            ...prev,
            file: files[0]
        }))
        if(files[0]) {
            const fileName = files[0].name
            console.log(fileName);
            setUploadData(prev=> ({
                ...prev,
                title: fileName
            }))
            console.log(uploadData);
            
        }
    }
  }



  const handleUploadSubmit = async (e) => {
    e.preventDefault()

    // if (!uploadData.file) {
    //     alert('Пожалуйста выберите файл')
    //     return
    // }
    const formData = new FormData()
    formData.append('file', uploadData.file)
    formData.append('title', uploadData.title)
    // formData.append('duration', uploadData.duration)
    const responce = await axios.post(`${API_BASE}/upload/`, formData)
    fetchTracks()
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds/60)
    const secs = Math.floor(seconds % 60) 
    return `${mins}:${secs}`
  }

  useEffect(()=> {
    const updateProgress = () => {
        setCurrentTime(audioRef.currentTime)
        setDuration(audioRef.duration)
    }
    audioRef.addEventListener('timeupdate', updateProgress)
    audioRef.addEventListener('loadedmetadata', () => setDuration(audioRef.duration))

    return () => {
        audioRef.removeEventListener('timeupdate', updateProgress)
    }

  }, [])


  
  useEffect(()=> {
    fetchTracks()
  }, [])


  return (
   <div>
    <header>
        <h1>Gomyamusic</h1>
    </header>
    <main>
        <nav>
            <ul>
                <li>Главная</li>
                <li>Поиск</li>
                <li>Моя медиатека</li>
                <li>Создать плейлист</li>
            </ul>
        </nav>


    <div>
        <h2>Треки</h2>
        <div>
            {tracks.map(track=> (
                <div key={track.id} onClick={()=> playTrack(track)}>
                    <div>
                        <h4>{track.title}</h4>
                        {currentTrack?.id === track.id && <span>{isPlaying ? '▶' : '⏸'}</span>}
                    </div>
                </div>
            ))}
        </div>
            <button onClick={()=> setShowUploadForm(!showUploadForm)}>{showUploadForm ? 'Закрыть' : 'Загрузить трек'}</button>
    </div>
    </main>


    {currentTrack && (
        <footer>
            <div>
                <div>{currentTrack.title}</div>
                <div>{formatTime(currentTime)} / {formatTime(duration)}</div>
                <div></div>
            </div>
            <div>
                <button onClick={togglePlayPause}> {isPlaying ? '⏸ Пауза' : '▶ Воспр.'}</button>
                <input type='range' max={duration} value={currentTime} onChange={handleSeek}/>
            </div>
        </footer>
    
    )}


    {showUploadForm &&
    <form onSubmit={handleUploadSubmit}>
        <label>Аудио файл</label>
        <input type='file' name='file' accept='audio/*' onChange={handleUploadChange} required></input>
        <input type='text' value={uploadData.title} onChange={handleUploadChange}></input>
        <button type='submit'>Загрузить трек</button>
    </form>
    }   
   </div>
  )
}

export default App
