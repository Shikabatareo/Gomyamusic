import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import axios from 'axios'
import TrackList from "./TrackList"
import AudioPlayer from "./AudioPlayer"
import useAudioPlayer from "../hooks/useAudioPlayer"
import { useUser } from "./context/UserContext"




const API_BASE = 'http://localhost:8000'



function PlaylistsPage() {
    const { currentUser } = useUser();
    const [playlists, setPlaylists] = useState([])
    const [showCreateForm, setShowCreateForm] = useState(false)

    const [newPlaylist, setNewPlaylist] = useState({
        title: '',
        description: '',
        image: null
    })

    const audio = useAudioPlayer()

    const fetchPlaylists = async () => {
        try {
            const response = await axios.get(`${API_BASE}/${currentUser}/playlists/`)
            setPlaylists(response.data)
        } catch (e) {
            console.log('Ошибка загрузки плейлистов', e)
        }
    }

    const handleCreatePlaylist = async (e) => {
        e.preventDefault()

        if (!currentUser) {
            alert('Пожалуйста, выберите пользователя');
            return;
        }
        
        const formData = new FormData()
        formData.append('title', newPlaylist.title)

        if (newPlaylist.image) {
            formData.append('image', newPlaylist.image)
            formData.append('description', newPlaylist.description)
        }
        try {
            await axios.post(`${API_BASE}/${currentUser}/playlists/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
        fetchPlaylists()
        setShowCreateForm(false)
        setNewPlaylist({title: '', description: '', image: null})
    }
    
    catch(error) {
        console.log('Ошибка создания плейлиста', error)
        }
    }
useEffect(()=> {
    fetchPlaylists()
}, [currentUser])

 return (
        <div className='app'>
            <main className='left-container'>
                <header>
                    <h1 className='logo'>Gomyamusic</h1>
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
                        <h2>Мои плейлисты</h2>
                        <button 
                            className='button-upload'
                            onClick={() => setShowCreateForm(!showCreateForm)}
                        >
                            Создать плейлист
                        </button>
                    </div>
                </div>
        {showCreateForm && (
            <form onSubmit={handleCreatePlaylist} className="audio-form-playlists">
                <input className="audio-input" type='text' placeholder="Название" value={newPlaylist.title} onChange={(e)=> setNewPlaylist({...newPlaylist, title: e.target.value})} required/>
                <textarea className="audio-text" placeholder="Описание плейлиста"
                            value={newPlaylist.description}
                            onChange={(e) => setNewPlaylist({...newPlaylist, description: e.target.value})}/>

                <input className='audio-input' type="file" accept="image/*" onChange={(e) => setNewPlaylist({...newPlaylist, image: e.target.files[0]})}/>
                <button className='button-upload' type="submit">
                            Создать
                        </button>
            </form>
        )}
    <div className="playlists-grid">
                    {playlists.map(playlist => (
                        <div key={playlist.id} className="playlist">
                            <Link to={`/playlist/${playlist.id}`}>
                            {playlist.image_url ? (
                                <img src={`${API_BASE}/${playlist.image_url}`} alt={playlist.title}/>
                            ): (
                                <div>🎵</div>
                            )}
                            <h3>{playlist.title}</h3>
                            <p>{playlist.description}</p>
                            {/* <span>{playlist.tracks} треков</span> */}
                           </Link>
                        </div>
                    ))}
                    </div>
                {audio.currentTrack && (
                    <AudioPlayer {...audio}/>
                )}
                </main>
                </div>
    )
}

export default PlaylistsPage