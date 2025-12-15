import React from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { UserCircle } from 'lucide-react';

export default function DashboardLayout({ children }) {
    const { user } = useAuth();
    return (
        <div className="min-h-screen bg-gray-950 flex">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Overview</h2>
                        <p className="text-gray-400 text-sm">Welcome back, {user?.username}</p>
                    </div>
                    <div className="flex items-center space-x-3 bg-gray-900 border border-gray-800 px-4 py-2 rounded-full">
                        <UserCircle className="text-blue-500 h-6 w-6" />
                        <span className="text-gray-300 font-medium text-sm">{user?.email}</span>
                    </div>
                </header>
                {children}
            </main>
        </div>
    );
}
