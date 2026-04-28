import React, { useEffect, useState } from 'react';
import {
  fetchAllUsers,
  fetchUserWatchlist,
  fetchAllMovies,
  adminDeleteMovie,
  updateUserRole,
} from '../services/adminService';

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [movies, setMovies] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  const [selectedUser, setSelectedUser] = useState(null);
  const [watchlistData, setWatchlistData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'users') {
        const data = await fetchAllUsers();
        setUsers(data);
      } else {
        const data = await fetchAllMovies();
        setMovies(data);
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleViewWatchlist = async (user) => {
    try {
      setSelectedUser(user);
      setWatchlistData(null);
      const data = await fetchUserWatchlist(user._id);
      setWatchlistData(data);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to load watchlist');
    }
  };

  const handleDeleteMovie = async (movieId) => {
    if (!window.confirm('Delete this movie? This cannot be undone.')) return;
    try {
      await adminDeleteMovie(movieId);
      setMovies((prev) => prev.filter((m) => m._id !== movieId));
      setActionMessage('Movie deleted successfully');
      setTimeout(() => setActionMessage(''), 3000);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to delete movie');
    }
  };

  const handleRoleChange = async (userId, newRole, userName) => {
    const action = newRole === 'admin' ? `Make "${userName}" an admin?` : `Revoke admin from "${userName}"?`;
    if (!window.confirm(action)) return;
    try {
      await updateUserRole(userId, newRole);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
      );
      setActionMessage(newRole === 'admin' ? `"${userName}" is now an Admin` : `"${userName}" role set back to User`);
      setTimeout(() => setActionMessage(''), 3000);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to update role');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto', color: 'var(--primary-text)' }}>
      <h1>Admin Panel</h1>
      <p className="page-subtitle">Manage users, watchlists, and movies</p>

      {actionMessage && (
        <p style={{ color: 'var(--success-color)', marginBottom: '1rem', fontWeight: 'bold' }}>
          ✓ {actionMessage}
        </p>
      )}
      {error && (
        <p style={{ color: 'var(--error-color)', marginBottom: '1rem' }}>
          ✗ {error}
        </p>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        {['users', 'movies'].map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setSelectedUser(null); setWatchlistData(null); }}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1rem',
              fontWeight: activeTab === tab ? 'bold' : 'normal',
              color: activeTab === tab ? 'var(--accent-color)' : 'var(--primary-text)',
              borderBottom: activeTab === tab ? '3px solid var(--accent-color)' : 'none',
              cursor: 'pointer',
              paddingBottom: '0.4rem',
              textTransform: 'capitalize',
            }}
          >
            {tab === 'users' ? `👤 Users (${users.length})` : `🎬 All Movies (${movies.length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : activeTab === 'users' ? (
        <>
          {/* Users Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                <th style={{ padding: '0.75rem' }}>Name</th>
                <th style={{ padding: '0.75rem' }}>Email</th>
                <th style={{ padding: '0.75rem' }}>Auth</th>
                <th style={{ padding: '0.75rem' }}>Verified</th>
                <th style={{ padding: '0.75rem' }}>Role</th>
                <th style={{ padding: '0.75rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.75rem' }}>{u.name}</td>
                  <td style={{ padding: '0.75rem', fontSize: '0.9rem' }}>{u.email}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{ fontSize: '0.8rem', padding: '2px 8px', borderRadius: '12px', background: u.authMethod === 'google' ? '#4285f420' : '#aaa2', color: u.authMethod === 'google' ? '#4285f4' : 'inherit' }}>
                      {u.authMethod}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem' }}>{u.isVerified ? '✓' : '✗'}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '3px 10px',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      background: u.role === 'admin' ? '#f59e0b22' : '#6366f122',
                      color: u.role === 'admin' ? '#f59e0b' : '#6366f1',
                    }}>
                      {u.role === 'admin' ? '⭐ Admin' : '👤 User'}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      className="btn"
                      onClick={() => handleViewWatchlist(u)}
                      style={{ fontSize: '0.8rem', padding: '4px 12px' }}
                    >
                      View Watchlist
                    </button>
                    {u.role === 'user' ? (
                      <button
                        onClick={() => handleRoleChange(u._id, 'admin', u.name)}
                        style={{
                          fontSize: '0.8rem',
                          padding: '4px 12px',
                          background: '#f59e0b',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                        }}
                      >
                        ⭐ Make Admin
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRoleChange(u._id, 'user', u.name)}
                        style={{
                          fontSize: '0.8rem',
                          padding: '4px 12px',
                          background: '#6366f1',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                        }}
                      >
                        Revoke Admin
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Watchlist Modal */}
          {selectedUser && (
            <div style={{ background: 'var(--secondary-bg)', border: '2px solid var(--border-color)', borderRadius: '12px', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ margin: 0 }}>{selectedUser.name}&apos;s Watchlist</h2>
                <button
                  onClick={() => { setSelectedUser(null); setWatchlistData(null); }}
                  style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--primary-text)' }}
                >
                  ✕
                </button>
              </div>
              {!watchlistData ? (
                <p>Loading...</p>
              ) : watchlistData.watchlist.length === 0 ? (
                <p style={{ color: 'var(--muted-text)' }}>No movies in watchlist.</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                  {watchlistData.watchlist.map((movie) => (
                    <li key={movie._id} style={{ background: 'var(--primary-bg)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      {movie.posterUrl && (
                        <img src={movie.posterUrl} alt={movie.title} style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '4px', marginBottom: '0.5rem' }} />
                      )}
                      <p style={{ fontWeight: 'bold', margin: '0 0 4px 0', fontSize: '0.9rem' }}>{movie.title}</p>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--muted-text)' }}>{movie.releaseYear} • {movie.genre}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </>
      ) : (
        /* Movies Table */
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
              <th style={{ padding: '0.75rem' }}>Title</th>
              <th style={{ padding: '0.75rem' }}>Genre</th>
              <th style={{ padding: '0.75rem' }}>Year</th>
              <th style={{ padding: '0.75rem' }}>Owner</th>
              <th style={{ padding: '0.75rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {movies.map((m) => (
              <tr key={m._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>{m.title}</td>
                <td style={{ padding: '0.75rem' }}>{m.genre}</td>
                <td style={{ padding: '0.75rem' }}>{m.releaseYear}</td>
                <td style={{ padding: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <span style={{ color: 'var(--primary-text)' }}>{m.createdBy?.name || 'Unknown'}</span><br /><span style={{ color: 'var(--muted-text)' }}>{m.createdBy?.email}</span>
                </td>
                <td style={{ padding: '0.75rem' }}>
                  <button
                    onClick={() => handleDeleteMovie(m._id)}
                    style={{ background: 'var(--error-color)', color: '#fff', border: 'none', borderRadius: '6px', padding: '4px 12px', cursor: 'pointer', fontSize: '0.8rem' }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminPage;
