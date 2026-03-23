import React, { useState } from 'react';
import apiClient from '../api/apiClient';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await apiClient.post('/api/auth/login', { username, password });
            const token = response.data.token;

            localStorage.setItem('jwt', token);

            const decodedToken = jwtDecode(token);
            const userRole =
                decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

            localStorage.setItem('userRole', userRole);

            navigate(userRole === 'Admin' ? '/admin' : '/dashboard');
        } catch (err) {
            setError('Invalid credentials');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-700 px-4">
            <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
                <h1 className="mb-2 text-center text-3xl font-bold text-slate-800">
                    Welcome Back
                </h1>
                <p className="mb-6 text-center text-sm text-slate-500">
                    Sign in to your attendance system
                </p>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                            Username
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                            placeholder="Enter your username"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                            placeholder="Enter your password"
                        />
                    </div>

                    {error && (
                        <div className="rounded-xl bg-rose-50 px-4 py-2 text-sm text-rose-600">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full rounded-xl bg-blue-600 py-2.5 font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-700"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
}

export default LoginPage;