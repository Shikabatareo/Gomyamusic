const API_BASE = 'http://localhost:8000'

function TrackList({ tracks, onTrackClick}) {
    return (
        <div className='track-container'>
            {tracks.map(track => (
                <div 
                    className='track' 
                    key={track.id} 
                    onClick={() => onTrackClick(track)}
                >
                    <h4>1</h4>
                    <h4>{track.title}</h4>
                    <h4>10:10</h4>
                    <h4>Thriller 25</h4>
                    {track.image_url && (
                        <img 
                            src={`${API_BASE}/${track.image_url}`} 
                            alt={track.title}
                        />
                    )}
                </div>
            ))}
        </div>
    )
}

export default TrackList