import React, { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import TransactionList from '../components/TransactionList';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import api from '../api/axios';
import { Download } from 'lucide-react';

export default function Transactions() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await api.get('/transactions/');
            setTransactions(res.data);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.detail || 'Failed to load transactions. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-white">Transaction History</h2>
                    <button className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-gray-700">
                        <Download className="h-4 w-4" />
                        <span>Export CSV</span>
                    </button>
                </div>

                {error && <ErrorMessage message={error} onRetry={fetchTransactions} />}

                <div className="bg-gray-950 rounded-2xl">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <LoadingSpinner size="lg" />
                        </div>
                    ) : transactions.length > 0 ? (
                        <TransactionList transactions={transactions} />
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            <p>No transactions found</p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
