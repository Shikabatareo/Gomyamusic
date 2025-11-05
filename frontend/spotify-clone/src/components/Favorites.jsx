function FavoritesPage() {
    return (
        <div className='app'>
            <main className='left-container'>
                <header>
                    <h1 className='logo'>Gomyamusic</h1>
                    <nav className='nav-menu'>
                        <ul className='ul-menu'>
                            <ol>Главная</ol>
                            <ol>Моя медиатека</ol>
                            <ol>Создать плейлист</ol>
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
                        <h3>#</h3>
                        <h3>Название</h3>
                        <h3>Длительность</h3>
                        <h3>Исполнитель</h3>
                        <h3>Обложка</h3>
                    </div>
                </div>
                
                <div className='empty-favorites'>
                    <h3>Функциональность избранного в разработке</h3>
                    <p>Скоро здесь появятся ваши любимые треки!</p>
                </div>
            </main>
        </div>
    )
}

export default FavoritesPage