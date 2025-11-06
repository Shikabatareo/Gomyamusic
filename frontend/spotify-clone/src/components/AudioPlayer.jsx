const API_BASE = 'http://localhost:8000'

function AudioPlayer({ currentTrack, isPlaying, togglePlayPause, currentTime, duration, handleSeek, formatTime }) {
    return (
        <footer className='footer'>
            <div className='footer-info'>
                {currentTrack.image_url && (
                    <img 
                        src={`${API_BASE}/${currentTrack.image_url}`}
                        alt={currentTrack.title}
                    />
                )}
                <div>{currentTrack.title}</div>
                <div className='footer-toggle'>
                    <button 
                        className='footer-toggle-button' 
                        onClick={togglePlayPause}
                    >
                        {isPlaying ? '⏸' : '▶'}
                    </button>
                </div>
            </div>
            <input 
                className='footer-toggle-bar' 
                type='range' 
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
            />
            <div>{formatTime(currentTime)} / {formatTime(duration)}</div>
        </footer>
    )
}

export default AudioPlayer