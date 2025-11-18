import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import TracksPage from './components/TracksPage'
import FavoritesPage from './components/Favorites'
import './App.css'
import { FavoritesProvider } from './components/context/FavoritesContext'
import PlaylistsPage from './components/PlaylistsPage'

function App() {

  return (
    <FavoritesProvider>
      <Router>
            <Routes>
              <Route path="/" element={<TracksPage />} />
              <Route path="/tracks" element={<TracksPage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route path="/playlists" element={<PlaylistsPage />} />
            </Routes>
      </Router>
    </FavoritesProvider>
  )
}
export default App