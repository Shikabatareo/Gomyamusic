import { useFavorites } from "./context/FavoritesContext"

const API_BASE = 'http://localhost:8000'

function TrackList({ tracks, playTrack}) {
    const {favorites, toggleFavorite} = useFavorites()


    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    return (
        <div className='track-container'>
            {tracks.map((track,index) => (
                <div
                    className='track' 
                    key={track.id} 
                    onClick={() => playTrack(track)}
                >
                    <h4>{index+1}</h4>
                    <h4>{track.title}</h4>
                    <h4>{formatTime(track.duration)}</h4>
                    <h4>{track.artist}</h4>
                    {track.image_url && (
                        <img 
                            src={`${API_BASE}/${track.image_url}`} 
                            alt={track.title}
                        />
                    )}
                    <button className="button-like" onClick={(e)=> {e.stopPropagation(); toggleFavorite(track.id)}}>{favorites.has(track.id) ? '❤️': '🖤'}</button>
                </div>
            ))}
        </div>
    )
}

export default TrackList