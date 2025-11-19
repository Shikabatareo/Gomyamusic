import fastapi
from fastapi import UploadFile, Form
import sqlalchemy
import os
from datetime import datetime
import aiofiles
import uvicorn
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.declarative import declarative_base
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, DateTime, ForeignKey, Text, Date
from typing import Optional
from fastapi.staticfiles import StaticFiles
from mutagen import File
from mutagen.mp3 import MP3
from mutagen.flac import FLAC

DATABASE_URL = 'postgresql://postgres:1337@localhost/spotify_clone'
engine = sqlalchemy.create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base=declarative_base()

app=fastapi.FastAPI(title='Spotify Clone API')
app.mount("/uploads", StaticFiles(directory="uploads"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:5173'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*']
)


class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    username= Column(String, unique=True, index=True)
    email = Column(String,unique=True, index=True)
    password_hash = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class Artist(Base):
    __tablename__ = 'artists'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    bio = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

class Album(Base):
    __tablename__ = 'albums'
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    artist_id = Column(Integer, ForeignKey('artists.id'))
    release_date = Column(Date)
    cover_art_url = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class Track(Base):
    __tablename__ = 'tracks'
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    artist_id = Column(Integer, ForeignKey('artists.id'))
    album_id = Column(Integer, ForeignKey("albums.id"))
    duration = Column(Integer)
    artist = Column(String, index=True)
    file_url = Column(String)
    image_url = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class Playlist(Base):
    __tablename__ = 'playlists'
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    image_url = Column(String)
    user_id = Column(Integer, ForeignKey('users.id'))
    created_at = Column(DateTime, default=datetime.utcnow)

class PlaylistTrack(Base):
    __tablename__ = 'playlists_tracks'
    id = Column(Integer, primary_key=True, index=True)
    playlist_id = Column(Integer, ForeignKey('playlists.id'))
    track_id = Column(Integer, ForeignKey('tracks.id'))
    position = Column(Integer)
    added_at = Column(DateTime, default=datetime.utcnow)


class ListeningHistory(Base):
    __tablename__ = 'listening_history'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    track_id = Column(Integer, ForeignKey('tracks.id'))
    listened_at = Column(DateTime, default=datetime.utcnow)


# @app.get("/")
# def read_root():
#     return {"message": "Spotify Clone API"}
# Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_audio_durartion(file_path):
    try:
        audio = File(file_path)
        if audio is not None:
            return int(audio.info.length)
        return 100
    except:
        return 180

def get_audio_artist(file_path):
    try:
        audio = File(file_path)
        if audio is not None:
            artist_tags = ['artist', 'ARTIST', 'TPE1', 'Author', 'author']
            for tag in artist_tags:
                if tag in audio.tags:
                    artist_value = audio.tags[tag]
                    if hasattr(artist_value, 'text'):
                        artist = artist_value.text[0] if artist_value.text else 'Неизвестный исполнитель'
                        return artist
        return 'Неизвестный исполнитель'
    except:
        return 'Неизвестный исполнитель'


@app.get('/tracks/')
def get_tracks(skip: int=0, limit: int=100, db: Session = fastapi.Depends(get_db)):
    tracks = db.query(Track).offset(skip).limit(limit).all()
    return tracks

@app.get("/playlists/")
def get_playlists(skip: int = 0, limit: int = 100, db: Session = fastapi.Depends(get_db)):
    playlists = db.query(Playlist).offset(skip).limit(limit).all()
    result = []
    for playlist in playlists:
        playlist_tracks = db.query(PlaylistTrack).filter(PlaylistTrack.playlist_id == playlist.id).all()
        tracks = []
        for pt in playlist_tracks:
            track = db.query(Track).filter(Track.id==pt.track_id).first()
            if track:
                tracks.append({
                    'id': track.id,
                    'title': track.title,
                    'artist': track.artist,
                    'duration': track.duration,
                    'file_url': track.file_url,
                    'image_url': track.image_url
                })
        result.append({
            "id": playlist.id,
            "title": playlist.title,
            "description": playlist.description,
            "image_url": playlist.image_url,
            "user_id": playlist.user_id,
            "created_at": playlist.created_at,
            "tracks": tracks
        })
    return result


@app.get("/playlists/{playlist_id}")
def get_playlist(playlist_id: int, db: Session = fastapi.Depends(get_db)):
    playlist = db.query(Playlist).filter(Playlist.id==playlist_id).first()
    playlist_tracks = db.query(PlaylistTrack).filter(PlaylistTrack.playlist_id == playlist_id).all()
    tracks = []
    for pt in playlist_tracks:
        track = db.query(Track).filter(Track.id==pt.track_id).first()
        if track:
            tracks.append({
                'id': track.id,
                'title': track.title,
                'artist': track.artist,
                'duration': track.duration,
                'file_url': track.file_url,
                'image_url': track.image_url
            })
    return {
        "id": playlist.id,
        "title": playlist.title,
        "description": playlist.description,
        "image_url": playlist.image_url,
        "user_id": playlist.user_id,
        "created_at": playlist.created_at,
        "tracks": tracks
    }


@app.post('/playlists/{playlist_id}/tracks/')
def add_track_to_playlist(playlist_id: int, track_id: int = fastapi.Query(...), db: Session = fastapi.Depends(get_db)):
    playlist = db.query(Playlist).filter(Playlist.id==playlist_id).first()
    print(playlist)
    track = db.query(Track).filter(Track.id==track_id).first()
    if not track:
        raise fastapi.HTTPException(status_code=404, detail="Track not found")
    
    existing = db.query(PlaylistTrack).filter(PlaylistTrack.playlist_id == playlist_id, PlaylistTrack.track_id == track_id).first()
    if existing:
        raise fastapi.HTTPException(status_code=400, detail='Трек уже добавлен')
    
    playlist_track = PlaylistTrack(playlist_id = playlist_id, track_id = track_id)
    db.add(playlist_track)
    db.commit()


@app.post("/playlists/")
def create_playlist(
    title: str = Form(...),
    description: str = Form(None),
    image: UploadFile = None,
    db: Session = fastapi.Depends(get_db)
):
    image_url = None
    if image:
        image_location = f'uploads/playlist_images/{image.filename}'
        with open(image_location, 'wb') as f:
            content = image.file.read()
            f.write(content)
        image_url = image_location
    new_playlist = Playlist(title = title, description = description, image_url = image_url, created_at =datetime.utcnow())
    db.add(new_playlist)
    db.commit()





@app.post('/upload/')
async def upload_track(
    file: UploadFile, 
    title: str = Form(''), 
    artist_id: Optional[int] = None, 
    album_id: Optional[int] = None, 
    duration: int = None, 
    image: Optional[UploadFile] = None,
    db: Session = fastapi.Depends(get_db)
):
    image_location = None
    if image is not None:
        image_location = f'uploads/images/{image.filename}'
        with open(image_location, 'wb') as f:
            content = await image.read()
            f.write(content)
    file_location = f'uploads/music/{file.filename}'
    with open(file_location, 'wb') as f:
        content = await file.read()
        f.write(content)
    duration = get_audio_durartion(file_location)
    artist = get_audio_artist(file_location)
    newTrack = Track(
        title = title,
        artist_id = artist_id,
        album_id = album_id,
        duration = duration,
        artist = artist,
        file_url = file_location,
        image_url = image_location,
        created_at =datetime.utcnow()
    )

    db.add(newTrack)
    db.commit()


    return {'filename': file.filename, 'location': file_location, 'location-image': image_location}

@app.delete('/playlists/{playlist_id}/tracks/{track_id}')
def remove_track_from_playlist(playlist_id: int, track_id: int, db: Session = fastapi.Depends(get_db)):
    playlist_track = db.query(PlaylistTrack).filter(PlaylistTrack.playlist_id == playlist_id, PlaylistTrack.track_id == track_id).first()
    if not playlist_track:
        raise fastapi.HTTPException(status_code=404, detail="Трект не найден в плейлисте")
    db.delete(playlist_track)
    db.commit()

@app.delete('/tracks/{track_id}')
def remove_track(track_id: int, db: Session = fastapi.Depends(get_db)):
    track = db.query(Track).filter(Track.id == track_id).first()
    if not track:
        raise fastapi.HTTPException(status_code=404, detail="Трект не найден")
    db.query(PlaylistTrack).filter(PlaylistTrack.track_id == track_id).delete()
    db.query(ListeningHistory).filter(ListeningHistory.track_id==track_id).delete()
    db.delete(track)
    db.commit()


if __name__ == '__main__':
    uvicorn.run(app, port=8000)
