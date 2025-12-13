import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

// Mock fetch
global.fetch = jest.fn();

describe('App Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('renders the app title', () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ([])
    });

    render(<App />);
    expect(screen.getByText('User Management System')).toBeInTheDocument();
  });

  it('fetches and displays users on mount', async () => {
    const mockUsers = [
      { id: 1, name: 'John Doe', email: 'john@example.com' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUsers
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
  });

  it('displays user count', async () => {
    const mockUsers = [
      { id: 1, name: 'John Doe', email: 'john@example.com' }
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUsers
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Users (1)')).toBeInTheDocument();
    });
  });

  it('handles form submission to add user', async () => {
    // Initial fetch for users list
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ([])
    });

    render(<App />);

    const nameInput = screen.getByPlaceholderText('Name');
    const emailInput = screen.getByPlaceholderText('Email');
    const addButton = screen.getByText('Add User');

    fireEvent.change(nameInput, { target: { value: 'New User' } });
    fireEvent.change(emailInput, { target: { value: 'new@example.com' } });

    // Mock POST request
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 3, name: 'New User', email: 'new@example.com' })
    });

    // Mock second GET request after adding user
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ([{ id: 3, name: 'New User', email: 'new@example.com' }])
    });

    fireEvent.click(addButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/users'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'New User', email: 'new@example.com' })
        })
      );
    });
  });

  it('handles user deletion', async () => {
    const mockUsers = [
      { id: 1, name: 'John Doe', email: 'john@example.com' }
    ];

    // Initial fetch
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUsers
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const deleteButton = screen.getByText('Delete');

    // Mock DELETE request
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'User deleted' })
    });

    // Mock GET request after deletion
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ([])
    });

    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/users/1'),
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  it('shows loading state when submitting', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ([])
    });

    render(<App />);

    const nameInput = screen.getByPlaceholderText('Name');
    const emailInput = screen.getByPlaceholderText('Email');
    const addButton = screen.getByText('Add User');

    fireEvent.change(nameInput, { target: { value: 'Test' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    // Mock slow POST request
    fetch.mockImplementationOnce(() => new Promise(resolve => 
      setTimeout(() => resolve({
        ok: true,
        json: async () => ({ id: 1, name: 'Test', email: 'test@example.com' })
      }), 100)
    ));

    fireEvent.click(addButton);

    expect(screen.getByText('Adding...')).toBeInTheDocument();
  });

  it('handles fetch errors gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    fetch.mockRejectedValueOnce(new Error('Network error'));

    render(<App />);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error fetching users:',
        expect.any(Error)
      );
    });

    consoleErrorSpy.mockRestore();
  });
});
