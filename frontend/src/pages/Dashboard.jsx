import React, { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import BankCard from '../components/BankCard';
import AddCardModal from '../components/AddCardModal';
import TransactionList from '../components/TransactionList';
import CardSkeleton from '../components/CardSkeleton';
import ErrorMessage from '../components/ErrorMessage';
import api from '../api/axios';
import { Plus } from 'lucide-react';

export default function Dashboard() {
    const [cards, setCards] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const [cardsRes, txRes] = await Promise.all([
                api.get('/cards/'),
                api.get('/transactions/')
            ]);
            setCards(cardsRes.data);
            setTransactions(txRes.data.slice(0, 5)); // Get last 5
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.detail || 'Failed to load dashboard data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <DashboardLayout>
            {showAddModal && (
                <AddCardModal
                    onClose={() => setShowAddModal(false)}
                    onCardAdded={fetchData}
                />
            )}

            {error && <ErrorMessage message={error} onRetry={fetchData} />}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cards Section */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold text-white">My Cards</h3>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                            <span>Add New Card</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {loading ? (
                            <>
                                <CardSkeleton />
                                <CardSkeleton />
                            </>
                        ) : cards.length > 0 ? (
                            cards.map(card => (
                                <BankCard key={card.id} card={card} />
                            ))
                        ) : (
                            <div className="col-span-2 border-2 border-dashed border-gray-800 rounded-2xl p-8 text-center text-gray-500">
                                No cards found. Add one to get started.
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Stats / Recent Activity */}
                <div className="space-y-6">
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Quick Stats</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-gray-400">
                                <span>Total Cards</span>
                                <span className="text-white font-medium">{cards.length}</span>
                            </div>
                            <div className="flex justify-between items-center text-gray-400">
                                <span>Active</span>
                                <span className="text-green-400 font-medium">{cards.filter(c => !c.is_blocked).length}</span>
                            </div>
                            <div className="flex justify-between items-center text-gray-400">
                                <span>Blocked</span>
                                <span className="text-red-400 font-medium">{cards.filter(c => c.is_blocked).length}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Recent Activity</h3>
                        {loading ? (
                            <div className="space-y-3">
                                <div className="h-12 bg-gray-800 rounded animate-pulse"></div>
                                <div className="h-12 bg-gray-800 rounded animate-pulse"></div>
                                <div className="h-12 bg-gray-800 rounded animate-pulse"></div>
                            </div>
                        ) : (
                            <TransactionList transactions={transactions} />
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
