import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import TransactionList from '../components/TransactionList';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import api from '../api/axios';
import { CreditCard, Lock, Unlock, Trash2, DollarSign, Calendar, Shield } from 'lucide-react';

export default function CardDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [card, setCard] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchCardData = async () => {
        try {
            setLoading(true);
            const [cardRes, txRes] = await Promise.all([
                api.get(`/cards/${id}/`),
                api.get(`/transactions/?card=${id}`)
            ]);
            setCard(cardRes.data);
            setTransactions(txRes.data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to load card details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCardData();
    }, [id]);

    const handleBlockToggle = async () => {
        setActionLoading(true);
        try {
            if (card.is_blocked) {
                await api.post(`/cards/${id}/unblock/`);
            } else {
                await api.post(`/cards/${id}/block/`);
            }
            await fetchCardData();
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to update card status');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this card? This action cannot be undone.')) {
            return;
        }

        setActionLoading(true);
        try {
            await api.delete(`/cards/${id}/`);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to delete card');
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex justify-center items-center h-64">
                    <LoadingSpinner size="lg" />
                </div>
            </DashboardLayout>
        );
    }

    if (error && !card) {
        return (
            <DashboardLayout>
                <ErrorMessage message={error} onRetry={fetchCardData} />
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-white">Card Details</h2>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        Back to Dashboard
                    </button>
                </div>

                {error && <ErrorMessage message={error} onRetry={() => setError(null)} />}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Card Info */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Card Display */}
                        <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl p-6 text-white shadow-xl">
                            <div className="flex justify-between items-start mb-8">
                                <CreditCard className="h-8 w-8" />
                                <div className={`px-3 py-1 rounded-full text-sm font-medium ${card.is_blocked ? 'bg-red-500' : 'bg-green-500'}`}>
                                    {card.is_blocked ? 'Blocked' : 'Active'}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm opacity-75 mb-1">Card Number</p>
                                    <p className="text-xl font-mono tracking-wider">•••• •••• •••• {card.last_four}</p>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm opacity-75 mb-1">Cardholder</p>
                                        <p className="font-medium">{card.card_holder_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm opacity-75 mb-1">Expires</p>
                                        <p className="font-medium">{card.expiry_date}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Card Stats */}
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
                            <h3 className="text-lg font-bold text-white mb-4">Card Information</h3>

                            <div className="flex items-center justify-between py-3 border-b border-gray-800">
                                <div className="flex items-center space-x-3 text-gray-400">
                                    <DollarSign className="h-5 w-5" />
                                    <span>Daily Limit</span>
                                </div>
                                <span className="text-white font-medium">${card.daily_limit}</span>
                            </div>

                            <div className="flex items-center justify-between py-3 border-b border-gray-800">
                                <div className="flex items-center space-x-3 text-gray-400">
                                    <Calendar className="h-5 w-5" />
                                    <span>Created</span>
                                </div>
                                <span className="text-white font-medium">
                                    {new Date(card.created_at).toLocaleDateString()}
                                </span>
                            </div>

                            <div className="flex items-center justify-between py-3">
                                <div className="flex items-center space-x-3 text-gray-400">
                                    <Shield className="h-5 w-5" />
                                    <span>Status</span>
                                </div>
                                <span className={`font-medium ${card.is_blocked ? 'text-red-400' : 'text-green-400'}`}>
                                    {card.is_blocked ? 'Blocked' : 'Active'}
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-3">
                            <h3 className="text-lg font-bold text-white mb-4">Card Actions</h3>

                            <button
                                onClick={handleBlockToggle}
                                disabled={actionLoading}
                                className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-colors ${card.is_blocked
                                        ? 'bg-green-600 hover:bg-green-500 text-white'
                                        : 'bg-yellow-600 hover:bg-yellow-500 text-white'
                                    } disabled:bg-gray-700`}
                            >
                                {card.is_blocked ? <Unlock className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
                                <span>{card.is_blocked ? 'Unblock Card' : 'Block Card'}</span>
                            </button>

                            <button
                                onClick={handleDelete}
                                disabled={actionLoading}
                                className="w-full flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-500 disabled:bg-gray-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                            >
                                <Trash2 className="h-5 w-5" />
                                <span>Delete Card</span>
                            </button>
                        </div>
                    </div>

                    {/* Transactions */}
                    <div className="lg:col-span-2">
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4">Transaction History</h3>
                            {transactions.length > 0 ? (
                                <TransactionList transactions={transactions} />
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                    <p>No transactions yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
