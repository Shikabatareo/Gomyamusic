import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import useAudioPlayer from '../hooks/useAudioPlayer'
import TrackList from './TrackList'
import AudioPlayer from './AudioPlayer'
import { useUser } from './context/UserContext'


const API_BASE = 'http://localhost:8000'

function TracksPage() {
    const {currentUser} = useUser()
    const [tracks, setTracks] = useState([])
    const [showUploadForm, setShowUploadForm] = useState(false)
    const [search, setSearch] = useState('')
    const [uploadData, setUploadData] = useState({
        title: '',
        artist_id: '',
        album_id: '',
        duration: '',
        file: null,
        image: null
    })
    const audio = useAudioPlayer()
    const filteredTracks = tracks.filter(track => 
        track.title.toLowerCase().includes(search.toLowerCase())
    )

    const fetchTracks = async() => {
        try {
            const response = await axios.get(`${API_BASE}/${currentUser}/tracks/`)
            setTracks(response.data)
        } catch (e) {
            console.log('Ошибка загрузки треков ', e)
        }
    }

    const handleUploadChange = (e) => {
        const { name, value, files } = e.target 
        if (name === 'file' || name === 'image') {
            setUploadData(prev => ({
                ...prev,
                [name]: files[0]
            }))
            if (name === 'file' && files[0]) {
                const fileName = files[0].name
                setUploadData(prev => ({
                    ...prev,
                    title: fileName.replace(/\.[^/.]+$/, ""),
                }))
            }
        } else {
            setUploadData(prev => ({
                ...prev,
                [name]: value
            }))
        }
    }

    const handleUploadSubmit = async (e) => {
        e.preventDefault()

        if (!currentUser) {
            return;
        }

        const formData = new FormData()
        formData.append('file', uploadData.file)
        formData.append('title', uploadData.title)

        if (uploadData.image) {
            formData.append('image', uploadData.image)
        }

        try {
            await axios.post(`${API_BASE}/${currentUser}/upload/`, formData)
            fetchTracks()
            setShowUploadForm(false)
        } catch (error) {
            console.log('Ошибка загрузки трека ', error)
        }
    }


    const removeTrack = async (trackId) => {
        try {
            await axios.delete(`${API_BASE}/tracks/${trackId}`)
            fetchTracks()
        }
        catch (error) {
            console.log('Ошибка добавления трека', error)
        }
    }

    useEffect(() => {
        if (currentUser) {
            axios.post(`${API_BASE}/users/${currentUser}`)
            .then(() => {
                fetchTracks();
            })
            .catch(error => {
                console.log('Ошибка создания пользователя в базе:', error);
            });
        }
    }, [currentUser])

    return (
        <div className='app'>
            <main className='left-container'>
                <header>
                    <h1 className='logo'>Gomyamusic</h1>
                    <input 
                        type="text"
                        placeholder="Поиск..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className='search'
                    />
                    <nav className='nav-menu'>
                        <ul className='ul-menu'>
                            <ol>
                                <Link to='/tracks'>Главная</Link>
                            </ol>
                            <ol>
                                <Link to='/favorites'>Моя медиатека</Link>
                            </ol>
                            <ol>
                              <Link to='/playlists'>Мои плейлисты</Link>    
                            </ol>
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
                        <h3>№</h3>
                        <h3>Название</h3>
                        <h3>Длительность</h3>
                        <h3>Исполнитель</h3>
                        <h3>Обложка</h3>
                        <h3>Нравится</h3>
                        <h3>Удалить</h3>
                    </div>
                </div>

                <TrackList 
                    tracks={filteredTracks}
                    playTrack={audio.playTrack}
                    showRemoveButton={true}
                    onRemoveTrack={removeTrack}
                />
            <div className='div-button-upload'>
                <button 
                    className='button-upload' 
                    onClick={() => setShowUploadForm(!showUploadForm)}
                >
                    {showUploadForm ? 'Закрыть' : 'Загрузить трек'}
                </button>
            </div>

                {audio.currentTrack && (
                    <AudioPlayer {...audio} />
                )}
            </main>

            {showUploadForm && (
                <form className='audio-form' onSubmit={handleUploadSubmit}>
                    <label className='audio-label'>Аудио файл</label>
                    <input 
                        className='audio-input' 
                        type='file' 
                        name='file' 
                        accept='audio/*' 
                        onChange={handleUploadChange} 
                        required 
                    />
                    <label className='audio-label'>Обложка</label>
                    <input 
                        className='audio-input' 
                        type='file' 
                        name='image' 
                        accept='image/*' 
                        onChange={handleUploadChange} 
                        required
                    />
                    <input 
                        className='audio-text' 
                        type='text' 
                        name='title' 
                        value={uploadData.title} 
                        onChange={handleUploadChange} 
                        required
                    />
                    <button className='button-upload' type='submit'>
                        Загрузить трек
                    </button>
                </form>
            )}
        </div>
    )
}

export default TracksPage