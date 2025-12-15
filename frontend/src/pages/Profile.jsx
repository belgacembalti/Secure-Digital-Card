import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { User, Lock, Shield, Mail, Camera, Upload } from 'lucide-react';

export default function Profile() {
    const { user, setUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [uploadingPicture, setUploadingPicture] = useState(false);
    const [passwordData, setPasswordData] = useState({
        old_password: '',
        new_password: '',
        confirm_password: ''
    });

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (passwordData.new_password !== passwordData.confirm_password) {
            setError("New passwords don't match");
            return;
        }

        if (passwordData.new_password.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/change-password/', {
                old_password: passwordData.old_password,
                new_password: passwordData.new_password
            });
            setSuccess('Password changed successfully!');
            setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
        } catch (err) {
            setError(err.response?.data?.old_password?.[0] || err.response?.data?.error || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    const handleProfilePictureUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            setError('Invalid file type. Only JPEG, PNG, and GIF are allowed.');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('File too large. Maximum size is 5MB.');
            return;
        }

        setError(null);
        setUploadingPicture(true);

        const formData = new FormData();
        formData.append('profile_picture', file);

        try {
            const response = await api.post('/auth/upload-profile-picture/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Update user context with new profile picture
            setUser({ ...user, profile_picture: response.data.profile_picture });
            setSuccess('Profile picture updated successfully!');
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to upload profile picture');
        } finally {
            setUploadingPicture(false);
        }
    };

    const getProfilePictureUrl = () => {
        if (user?.profile_picture) {
            // If it's already a full URL, use it
            if (user.profile_picture.startsWith('http')) {
                return user.profile_picture;
            }
            // Otherwise, prepend the backend URL
            return `http://localhost:8000${user.profile_picture}`;
        }
        return null;
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                <h2 className="text-2xl font-bold text-white">Profile & Settings</h2>

                {/* User Information */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                    <div className="flex items-center space-x-4 mb-6">
                        {/* Profile Picture */}
                        <div className="relative group">
                            <div className="h-20 w-20 rounded-full bg-blue-600 flex items-center justify-center overflow-hidden">
                                {getProfilePictureUrl() ? (
                                    <img
                                        src={getProfilePictureUrl()}
                                        alt="Profile"
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <User className="h-10 w-10 text-white" />
                                )}
                            </div>

                            {/* Upload Button Overlay */}
                            <label
                                htmlFor="profile-picture-input"
                                className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            >
                                {uploadingPicture ? (
                                    <LoadingSpinner size="sm" />
                                ) : (
                                    <Camera className="h-6 w-6 text-white" />
                                )}
                            </label>
                            <input
                                id="profile-picture-input"
                                type="file"
                                accept="image/jpeg,image/jpg,image/png,image/gif"
                                onChange={handleProfilePictureUpload}
                                className="hidden"
                                disabled={uploadingPicture}
                            />
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-white">{user?.username}</h3>
                            <p className="text-gray-400">{user?.email}</p>
                            <p className="text-xs text-gray-500 mt-1">Click on avatar to change picture</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-gray-800">
                        <div className="flex items-center space-x-3 text-gray-400">
                            <Mail className="h-5 w-5" />
                            <div>
                                <p className="text-sm">Email</p>
                                <p className="text-white font-medium">{user?.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3 text-gray-400">
                            <Shield className="h-5 w-5" />
                            <div>
                                <p className="text-sm">Account Status</p>
                                <p className="text-green-400 font-medium">Active</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Global Error/Success Messages */}
                {error && <ErrorMessage message={error} onRetry={() => setError(null)} />}
                {success && (
                    <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-4">
                        <p className="text-green-400">{success}</p>
                    </div>
                )}

                {/* Change Password */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                    <div className="flex items-center space-x-3 mb-6">
                        <Lock className="h-6 w-6 text-blue-400" />
                        <h3 className="text-xl font-bold text-white">Change Password</h3>
                    </div>

                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Current Password
                            </label>
                            <input
                                type="password"
                                value={passwordData.old_password}
                                onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                New Password
                            </label>
                            <input
                                type="password"
                                value={passwordData.new_password}
                                onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                required
                                minLength={8}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Confirm New Password
                            </label>
                            <input
                                type="password"
                                value={passwordData.confirm_password}
                                onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
                        >
                            {loading ? <LoadingSpinner size="sm" /> : 'Change Password'}
                        </button>
                    </form>
                </div>

                {/* Security Settings */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Security Settings</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                            <div>
                                <p className="text-white font-medium">Two-Factor Authentication</p>
                                <p className="text-sm text-gray-400">Add an extra layer of security</p>
                            </div>
                            <div className="text-gray-500">
                                <span className="text-sm">Coming soon</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
