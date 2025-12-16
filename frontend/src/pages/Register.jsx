import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, User, Loader2, CheckCircle, Camera, X } from 'lucide-react';
import FaceLogin from '../components/FaceLogin';

export default function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        password2: ''
    });
    const [faceImage, setFaceImage] = useState(null);
    const [showCamera, setShowCamera] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFaceCapture = (imageData) => {
        setFaceImage(imageData);
        setShowCamera(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.password2) {
            return setError("Passwords do not match");
        }

        setLoading(true);
        try {
            await register(formData.username, formData.email, formData.password, formData.password2, faceImage);
            // Auto login or redirect to login? Let's redirect for now.
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.username?.[0] || err.response?.data?.email?.[0] || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    if (showCamera) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
                <div className="bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-700">
                    <h2 className="text-2xl font-bold text-center text-white mb-6">Capture Face</h2>
                    <FaceLogin
                        onLogin={handleFaceCapture}
                        onCancel={() => setShowCamera(false)}
                        buttonText="Capture Photo"
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-700">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-blue-500 mb-2">Create Account</h1>
                    <p className="text-gray-400">Join the future of digital banking</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-6 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-300 text-sm font-medium mb-1">Username</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
                            <input
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg py-3 px-10 focus:outline-none focus:border-blue-500 transition-colors"
                                placeholder="johndoe"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-300 text-sm font-medium mb-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
                            <input
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg py-3 px-10 focus:outline-none focus:border-blue-500 transition-colors"
                                placeholder="name@example.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-300 text-sm font-medium mb-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
                            <input
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg py-3 px-10 focus:outline-none focus:border-blue-500 transition-colors"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-300 text-sm font-medium mb-1">Confirm Password</label>
                        <div className="relative">
                            <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
                            <input
                                name="password2"
                                type="password"
                                value={formData.password2}
                                onChange={handleChange}
                                className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg py-3 px-10 focus:outline-none focus:border-blue-500 transition-colors"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="button"
                            onClick={() => setShowCamera(true)}
                            className={`w-full py-3 rounded-lg border border-dashed flex items-center justify-center gap-2 transition-colors ${faceImage
                                    ? 'border-green-500 text-green-500 bg-green-500/10'
                                    : 'border-gray-600 text-gray-400 hover:border-gray-500 hover:text-gray-300'
                                }`}
                        >
                            <Camera className="w-5 h-5" />
                            {faceImage ? 'Face Photo Added' : 'Add Face Photo (Optional)'}
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-[1.02] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Create Account'}
                    </button>

                    <p className="text-center text-gray-400 text-sm mt-4">
                        Already have an account?{' '}
                        <Link to="/login" className="text-blue-400 hover:text-blue-300">
                            Sign in
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
