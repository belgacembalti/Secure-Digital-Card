import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import StatsCard from '../components/StatsCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import api from '../api/axios';
import { DollarSign, TrendingUp, CreditCard, Activity, Download, Calendar } from 'lucide-react';

export default function Analytics() {
    const [stats, setStats] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeRange, setTimeRange] = useState('month'); // week, month, year

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            setError(null);
            const [txRes, cardsRes] = await Promise.all([
                api.get('/transactions/'),
                api.get('/cards/')
            ]);
            setTransactions(txRes.data);
            setCards(cardsRes.data);
            calculateStats(txRes.data, cardsRes.data);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (txData, cardData) => {
        const now = new Date();
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

        // Filter transactions for current period
        const recentTx = txData.filter(tx => new Date(tx.timestamp) >= monthAgo);

        const totalSpent = recentTx.reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);
        const avgTransaction = recentTx.length > 0 ? totalSpent / recentTx.length : 0;

        setStats({
            totalSpent: totalSpent.toFixed(2),
            transactionCount: recentTx.length,
            averageTransaction: avgTransaction.toFixed(2),
            activeCards: cardData.filter(c => !c.is_blocked).length,
            totalCards: cardData.length,
        });
    };

    useEffect(() => {
        fetchAnalytics();
    }, [timeRange]);

    const exportToCSV = () => {
        if (transactions.length === 0) return;

        const csvContent = [
            ['Date', 'Merchant', 'Amount', 'Type', 'Status', 'Reference'],
            ...transactions.map(tx => [
                new Date(tx.timestamp).toLocaleDateString(),
                tx.merchant,
                tx.amount,
                tx.transaction_type,
                tx.status,
                tx.reference_id
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
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

    if (error) {
        return (
            <DashboardLayout>
                <ErrorMessage message={error} onRetry={fetchAnalytics} />
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Analytics Dashboard</h2>
                        <p className="text-gray-400 mt-1">Overview of your spending and card usage</p>
                    </div>
                    <button
                        onClick={exportToCSV}
                        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        <Download className="h-4 w-4" />
                        <span>Export Report</span>
                    </button>
                </div>

                {/* Time Range Selector */}
                <div className="flex space-x-2">
                    {['week', 'month', 'year'].map(range => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${timeRange === range
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                }`}
                        >
                            {range.charAt(0).toUpperCase() + range.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatsCard
                            title="Total Spent"
                            value={`$${stats.totalSpent}`}
                            icon={DollarSign}
                            color="blue"
                        />
                        <StatsCard
                            title="Transactions"
                            value={stats.transactionCount}
                            icon={Activity}
                            color="green"
                        />
                        <StatsCard
                            title="Avg. Transaction"
                            value={`$${stats.averageTransaction}`}
                            icon={TrendingUp}
                            color="purple"
                        />
                        <StatsCard
                            title="Active Cards"
                            value={`${stats.activeCards}/${stats.totalCards}`}
                            icon={CreditCard}
                            color="orange"
                        />
                    </div>
                )}

                {/* Charts Placeholder */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Spending Trends</h3>
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            <div className="text-center">
                                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p>Chart visualization coming soon</p>
                                <p className="text-sm mt-2">Showing spending over time</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Top Merchants</h3>
                        <div className="space-y-3">
                            {transactions.slice(0, 5).map((tx, idx) => (
                                <div key={idx} className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                                    <span className="text-white">{tx.merchant}</span>
                                    <span className="text-blue-400 font-medium">${tx.amount}</span>
                                </div>
                            ))}
                            {transactions.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    No transactions to display
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Card Usage */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Card Usage</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {cards.map(card => (
                            <div key={card.id} className="p-4 bg-gray-800 rounded-lg">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-white font-medium">•••• {card.last_four}</span>
                                    <span className={`text-xs px-2 py-1 rounded-full ${card.is_blocked ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                                        }`}>
                                        {card.is_blocked ? 'Blocked' : 'Active'}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-400">{card.card_holder_name}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
