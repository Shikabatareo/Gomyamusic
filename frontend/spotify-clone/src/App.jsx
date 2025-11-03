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
    file: null,
    image: null
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
    const {name,value, files} = e.target 
    if (name === 'file' || name === 'image') {
        setUploadData(prev => ({
            ...prev,
            [name]: files[0]
        }))
        if(name === 'file' && files[0]) {
            const fileName = files[0].name
            console.log(fileName);
            setUploadData(prev=> ({
                ...prev,
                title: fileName,
            }))
            console.log(uploadData);  
        }
    }
    else {
            setUploadData(prev => ({
                ...prev,
               [name]: value
            }))
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

    if (uploadData.image) {
        formData.append('image', uploadData.image)
    }

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
        <h1 className='logo'>Gomyamusic</h1>
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
    <div className='container'>
        <div className='tracks-menu'>
            <h2>Треки</h2>
        </div>
        <div className='tracks-info'>
            <h3>#</h3>
            <h3>Название</h3>
            <h3>Длительность</h3>
            <h3>Исполнитель</h3>
            <h3>Обложка</h3>
        </div>
        <div className='track-container'>
            {tracks.map(track=> (
                <div className='track' key={track.id} onClick={()=> playTrack(track)}>
                        <h4>1</h4>
                        <h4>{track.title}</h4>
                        <h4>10:10</h4>
                        <h4>Thriller 25</h4>
                        {track.image_url && (
                            <img src={`${API_BASE}/${track.image_url}`} alt={track.title}></img>
                        )}
                </div>
            ))}
        </div>
            <button className='button-upload' onClick={()=> setShowUploadForm(!showUploadForm)}>{showUploadForm ? 'Закрыть' : 'Загрузить трек'}</button>
    </div>
    {currentTrack && (
        <footer className='footer'>
            <div className='footer-info'>
                {currentTrack.image_url && (
                    <img src={`${API_BASE}/${currentTrack.image_url}`}/>
                )}
                <div>{currentTrack.title}</div>
                   <div className='footer-toggle'>
                  <button className='footer-toggle-button' onClick={togglePlayPause}> {isPlaying ? '⏸' : '▶'}</button>
            </div>
            </div>
            <input className='footer-toggle-bar' type='range' max={duration} value={currentTime} onChange={handleSeek}/>
                  <div>{formatTime(currentTime)} / {formatTime(duration)}</div>
        </footer>
    
    )}
    </main>


    


    {showUploadForm &&
    <form className='audio-form' onSubmit={handleUploadSubmit}>
        <label className='audio-label'>Аудио файл</label>
        <input className='audio-input' type='file' name='file' accept='audio/*' onChange={handleUploadChange} required></input>
        <label className='audio-label'>Обложка</label>
        <input className='audio-input' type='file' name='image' accept='image/*' onChange={handleUploadChange}></input>
        <input className='audio-text' type='text' name='title' value={uploadData.title} onChange={handleUploadChange}></input>
        <button className='button-upload' type='submit'>Загрузить трек</button>
    </form>
    }   
   </div>
  )
}

export default App
