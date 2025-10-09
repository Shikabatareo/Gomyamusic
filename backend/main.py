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

DATABASE_URL = 'postgresql://ShikaDb:@localhost/spotify_clone'
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
    file_url = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class Playlist(Base):
    __tablename__ = 'playlists'
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
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


Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()




@app.get('/tracks/')
def get_tracks(skip: int=0, limit: int=100, db: Session = fastapi.Depends(get_db)):
    tracks = db.query(Track).offset(skip).limit(limit).all()
    return tracks

@app.post('/upload/')
async def upload_track(file: UploadFile, title: str = Form(''), artist_id: Optional[int] = None, album_id: Optional[int] = None, duration: int= None, db: Session = fastapi.Depends(get_db)):
    file_location = f'uploads/music/{file.filename}'
    with open(file_location, 'wb') as f:
        content = await file.read()
        f.write(content)
    newTrack = Track(
        title = title,
        artist_id = artist_id,
        album_id = album_id,
        duration = duration,
        file_url = file_location,
        created_at =datetime.utcnow()
    )

    db.add(newTrack)
    db.commit()


    return {'filename': file.filename, 'location': file_location}



if __name__ == '__main__':
    uvicorn.run(app, port=8000)
