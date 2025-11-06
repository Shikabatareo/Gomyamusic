import { createContext, useContext, useState, useEffect } from "react";


const FavoritesContext = createContext()

export function FavoritesProvider({children}) {
    const [favorites, setFavorites] = useState(()=> {
        const savedFavorites = localStorage.getItem('musicFavorites')
        if (savedFavorites) {
            const parsed = JSON.parse(savedFavorites)
            return new Set(parsed)
        }
        return new Set()
    })

    useEffect(()=> {
        localStorage.setItem('musicFavorites', JSON.stringify([...favorites]))
    }, [favorites])


    function toggleFavorite(trackId) {
        setFavorites(prev=> {
            const newFavorites = new Set(prev)
            if (newFavorites.has(trackId)) {
                newFavorites.delete(trackId)
            }
            else {
                newFavorites.add(trackId)
            }
            return newFavorites
        })
    }

    return (
        <FavoritesContext.Provider value={{favorites, toggleFavorite}}>
            {children}
        </FavoritesContext.Provider>
    )

}

export function useFavorites() {
    const context = useContext(FavoritesContext)
    if (!context) {
        throw new Error('useFavorites error')
    }
    return context
}


