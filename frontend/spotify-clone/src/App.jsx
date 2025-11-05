import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import TracksPage from './components/TracksPage'
import FavoritesPage from './components/Favorites'

function App() {

  return (
    <Router>
          <Routes>
            <Route path="/" element={<TracksPage />} />
            <Route path="/tracks" element={<TracksPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
          </Routes>
    </Router>
  )
}
export default App