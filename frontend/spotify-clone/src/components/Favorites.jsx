import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import TrackList from "./TrackList"
import { useFavorites } from "./context/FavoritesContext"
import useAudioPlayer from "../hooks/useAudioPlayer"
import axios from 'axios'
import AudioPlayer from "./AudioPlayer"
import { useUser } from "./context/UserContext"

const API_BASE = 'http://localhost:8000'

function FavoritesPage() {
    const [tracks, setTracks] = useState([])
    const [search, setSearch] = useState('')
    const { currentUser } = useUser()

    const audio = useAudioPlayer()
    const { favorites } = useFavorites()

   
    const favoritesTracks = tracks.filter(track=> favorites.has(track.id))
    
    const filteredTracks = favoritesTracks.filter(track => 
        track.title.toLowerCase().includes(search.toLowerCase())
    )

    const fetchTracks = async () => {
        try {
            const response = await axios.get(`${API_BASE}/${currentUser}/tracks`)
            setTracks(response.data)
        } catch (e) {
            console.log('Ошибка загрузки треков ', e)
        }
    }


    useEffect(() => {
        fetchTracks()
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
                        <h2>Моя медиатека</h2>
                    </div>
                    <div className='tracks-info'>
                        <h3>№</h3>
                        <h3>Название</h3>
                        <h3>Длительность</h3>
                        <h3>Исполнитель</h3>
                        <h3>Обложка</h3>
                        <h3>Нравится</h3>
                    </div>
                </div>
                
                <div className='favorites'>
                    <TrackList tracks={filteredTracks} playTrack={audio.playTrack}/>
                    {audio.currentTrack && (
                        <AudioPlayer {...audio} />
                    )}
                </div>
            </main>
        </div>
    )
}

export default FavoritesPage