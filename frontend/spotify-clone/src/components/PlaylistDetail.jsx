import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import axios, { all } from 'axios'
import useAudioPlayer from "../hooks/useAudioPlayer"
import TrackList from "./TrackList"
import AudioPlayer from "./AudioPlayer"
import { useUser } from "./context/UserContext"

const API_BASE = 'http://localhost:8000'


function PlaylistDetail() {

    const {id} = useParams(null)
    const [playlist, setPlaylist] = useState(null)
    const [allTracks, setAllTracks] = useState([])
    const [showAddTrack, setShowAddTrack] = useState(false)
    const {currentUser} = useUser()
    const audio = useAudioPlayer()

    const fetchPlaylist = async () => {
        try {
            const responce = await axios.get(`${API_BASE}/playlists/${id}`)
            setPlaylist(responce.data)
            console.log(responce.data)
        }
        catch(e) {
            console.log('Ошибка загрузки плейлиста', e)
        }
    }

    const fetchAllTracks = async () => {
        try {
        const response = await axios.get(`${API_BASE}/${currentUser}/tracks/`)
        setAllTracks(response.data)
        }
        catch (e) {
            console.log('Ошибка загрузки треков', e)
        }
    }

    const addTrackToPlayList = async (trackId) => {
        try {
            await axios.post(`${API_BASE}/playlists/${id}/tracks/?track_id=${trackId}`)
            fetchPlaylist()
            setShowAddTrack(false)
        }
        catch (error) {
            console.log('Ошибка добавления трека', error)
        }
    }

    const removeTrackToPlayList = async (trackId) => {
        try {
            await axios.delete(`${API_BASE}/playlists/${id}/tracks/${trackId}`)
            fetchPlaylist()
        }
        catch (error) {
            console.log('Ошибка добавления трека', error)
        }
    }


    useEffect(()=> {
        fetchPlaylist()
        fetchAllTracks()
    },[id])

    if (!playlist) return <div>Загрузка...</div>

    const availableTracks = allTracks.filter(track=> !playlist.tracks.some(pt => pt.id === track.id))
    
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
                        <h2>{playlist.title}</h2>
                        {playlist.description && <p>{playlist.description}</p>}
                        <button 
                            className='button-upload'
                            onClick={() => setShowAddTrack(!showAddTrack)}
                        >
                            Добавить трек
                        </button>
                    </div>
                </div>
                {showAddTrack && (
                    <div className="add-track-modal">
                        <h3>Добавить трек в плейлист</h3>
                        <div className="available-tracks">
                            {availableTracks.map(track => (
                                <div key={track.id} className="track-item">
                                    <span>{track.title} - {track.artist}</span>
                                    <button 
                                        className="button-upload"
                                        onClick={() => addTrackToPlayList(track.id)}
                                    >
                                        Добавить
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                 <TrackList 
                    tracks={playlist.tracks}
                    playTrack={audio.playTrack}
                    showRemoveButton={true}
                    onRemoveTrack={removeTrackToPlayList}
                    showLikeButton={false}
                />
                {audio.currentTrack && (
                    <AudioPlayer {...audio} />
                )}
            </main>
        </div>
    )

}

export default PlaylistDetail