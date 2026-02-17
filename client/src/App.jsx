import { useEffect, useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import "./App.css";

const API_BASE = "https://albums-api-pgx9.onrender.com";

function LandingPage() {
  return (
    <div className="landing">
      <h1>🎶 Album Archive</h1>
      <p>Manage your favorite albums with full CRUD functionality.</p>
      <Link to="/albums" className="primary-btn">
        Enter Albums
      </Link>
    </div>
  );
}

function AlbumsPage() {
  const [albums, setAlbums] = useState([]);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [year, setYear] = useState("");
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const fetchAlbums = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/albums`);
      const data = await res.json();
      setAlbums(data);
    } catch (err) {
      setError("Failed to fetch albums");
    }
  };

  useEffect(() => {
    fetchAlbums();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = editingId
      ? `${API_BASE}/api/albums/${editingId}`
      : `${API_BASE}/api/albums`;

    const method = editingId ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, artist, year }),
    });

    setTitle("");
    setArtist("");
    setYear("");
    setEditingId(null);
    fetchAlbums();
  };

  const handleDelete = async (id) => {
    await fetch(`${API_BASE}/api/albums/${id}`, { method: "DELETE" });
    fetchAlbums();
  };

  const handleEdit = (album) => {
    setTitle(album.title);
    setArtist(album.artist);
    setYear(album.year);
    setEditingId(album._id);
  };

  return (
    <div className="page">
      <h2>Albums</h2>

      {error && <p>{error}</p>}

      <form onSubmit={handleSubmit} className="form">
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          placeholder="Artist"
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
          required
        />
        <input
          placeholder="Year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          required
        />
        <button type="submit">
          {editingId ? "Update Album" : "Add Album"}
        </button>
      </form>

      <ul className="album-list">
        {albums.map((album) => (
          <li key={album._id} className="album-card">
            <div>
              <strong>{album.title}</strong>
              <div>
                {album.artist} ({album.year})
              </div>
            </div>
            <div>
              <button onClick={() => handleEdit(album)}>Edit</button>
              <button onClick={() => handleDelete(album._id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AboutPage() {
  return (
    <div className="page">
      <h2>About</h2>
      <p>
        Album Archive is a MERN stack application built to manage and organize
        music albums. This project demonstrates full Create, Read, Update, and
        Delete functionality using MongoDB, Express, React, and Node.
      </p>
    </div>
  );
}

function App() {
  const [theme, setTheme] = useState("dark");

  return (
    <div className={`app ${theme}`}>
      <nav className="nav">
        <div>
          <Link to="/">Home</Link>
          <Link to="/albums">Albums</Link>
          <Link to="/about">About</Link>
        </div>

        <div className="theme-buttons">
          <button onClick={() => setTheme("dark")}>🌙 Dark mode</button>
          <button onClick={() => setTheme("light")}>☀️ Light mode</button>
          <button onClick={() => setTheme("neon")}>💜 Neon mode</button>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/albums" element={<AlbumsPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </div>
  );
}

export default App;
