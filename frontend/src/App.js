import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

function App() {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/users`);
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email })
      });
      if (response.ok) {
        setName('');
        setEmail('');
        fetchUsers();
      }
    } catch (error) {
      console.error('Error adding user:', error);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`${API_URL}/api/users/${id}`, { method: 'DELETE' });
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>User Management System</h1>
        
        <form onSubmit={handleSubmit} className="user-form">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Adding...' : 'Add User'}
          </button>
        </form>

        <div className="users-list">
          <h2>Users ({users.length})</h2>
          {users.map(user => (
            <div key={user.id} className="user-card">
              <div>
                <strong>{user.name}</strong>
                <p>{user.email}</p>
              </div>
              <button onClick={() => handleDelete(user.id)}>Delete</button>
            </div>
          ))}
        </div>
      </header>
    </div>
  );
}

export default App;