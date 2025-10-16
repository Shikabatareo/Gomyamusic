import { use, useEffect, useRef, useState } from 'react'
import axios from 'axios'
import Background from './assets/Background.png'
import BackgroundArtist from './assets/Michael.png'
import BackgroundSvg from './assets/Vector.png'
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
                title: fileName,
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
   <div className='app'>
    <main className='left-container'>
        <header>
        <h1>Gomyamusic</h1>
        <nav className='nav-menu'>
            <ul className='ul-menu'>
                <ol>Главная</ol>
                <ol>Поиск</ol>
                <ol>Моя медиатека</ol>
                <ol>Создать плейлист</ol>
            </ul>
        </nav>
    </header>
    </main>
    <main className='right-container'>
    <div className='track-background'>
        <img className='track-background-img' src={Background}></img>
        <img className='track-background-artist' src={BackgroundArtist}></img>
        <div className='track-background-info'>
            <div className='track-background-info-logo'>
                <img style={{width: '30px', height: '30px',marginRight: '15px'}} src={BackgroundSvg}></img>
                <h2>Verified Artist</h2>
            </div>
            <h2>27.852.501 monthly listeners</h2>
            <h1>Michael Jackson</h1>
        </div>
    </div>
    <div>
        <div className='tracks-menu'>
            <h2>Треки</h2>
            <h2>Больше</h2>
        </div>
        <div className='tracks-info'>
            <h3>#</h3>
            <h3>Название</h3>
            <h3>Длительность</h3>
            <h3>Альбом</h3>
        </div>
        <div>
            {tracks.map(track=> (
                <div className='track' key={track.id} onClick={()=> playTrack(track)}>
                        <h4>1</h4>
                        <h4>{track.title}</h4>
                        <h4>10:10</h4>
                        <h4>Thriller 25</h4>
                        {currentTrack?.id === track.id && <span>{isPlaying ? '▶' : '⏸'}</span>}
                </div>
            ))}
        </div>
            <button className='button-upload' onClick={()=> setShowUploadForm(!showUploadForm)}>{showUploadForm ? 'Закрыть' : 'Загрузить трек'}</button>
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
