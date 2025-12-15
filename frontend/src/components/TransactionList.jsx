import React, { useState, useMemo } from 'react';
import { ArrowUpRight, ArrowDownLeft, Search, SlidersHorizontal } from 'lucide-react';

export default function TransactionList({ transactions }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('date'); // date, amount
    const [sortOrder, setSortOrder] = useState('desc'); // asc, desc
    const [showFilters, setShowFilters] = useState(false);

    // Filter and sort transactions
    const filteredAndSortedTx = useMemo(() => {
        let result = [...transactions];

        // Search filter
        if (searchTerm) {
            result = result.filter(tx =>
                tx.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
                tx.reference_id.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Sort
        result.sort((a, b) => {
            if (sortBy === 'date') {
                const comparison = new Date(b.timestamp) - new Date(a.timestamp);
                return sortOrder === 'asc' ? -comparison : comparison;
            } else if (sortBy === 'amount') {
                const comparison = parseFloat(b.amount) - parseFloat(a.amount);
                return sortOrder === 'asc' ? -comparison : comparison;
            }
            return 0;
        });

        return result;
    }, [transactions, searchTerm, sortBy, sortOrder]);

    const toggleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('desc');
        }
    };

    return (
        <div className="space-y-4">
            {/* Search and Filter Bar */}
            {transactions.length > 0 && (
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by merchant or reference..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => toggleSort('date')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${sortBy === 'date'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                }`}
                        >
                            Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </button>
                        <button
                            onClick={() => toggleSort('amount')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${sortBy === 'amount'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                }`}
                        >
                            Amount {sortBy === 'amount' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </button>
                    </div>
                </div>
            )}

            {/* Transaction List */}
            <div className="space-y-3">
                {filteredAndSortedTx.map((tx) => (
                    <div
                        key={tx.id}
                        className="flex items-center justify-between p-4 bg-gray-900 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors"
                    >
                        <div className="flex items-center space-x-4">
                            <div className={`p-3 rounded-full ${tx.transaction_type === 'DEPOSIT'
                                    ? 'bg-green-500/10 text-green-500'
                                    : 'bg-red-500/10 text-red-500'
                                }`}>
                                {tx.transaction_type === 'DEPOSIT'
                                    ? <ArrowDownLeft className="h-5 w-5" />
                                    : <ArrowUpRight className="h-5 w-5" />
                                }
                            </div>
                            <div>
                                <p className="text-white font-medium">{tx.merchant}</p>
                                <p className="text-sm text-gray-500">
                                    {new Date(tx.timestamp).toLocaleDateString()} · {tx.reference_id.slice(0, 8)}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className={`font-bold ${tx.transaction_type === 'DEPOSIT' ? 'text-green-400' : 'text-white'
                                }`}>
                                {tx.transaction_type === 'DEPOSIT' ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
                            </p>
                            <p className={`text-xs ${tx.status === 'COMPLETED' ? 'text-green-500' :
                                    tx.status === 'PENDING' ? 'text-yellow-500' : 'text-red-500'
                                }`}>
                                {tx.status}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {filteredAndSortedTx.length === 0 && transactions.length > 0 && (
                <div className="text-center text-gray-500 py-8">
                    <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No transactions match your search</p>
                </div>
            )}
            {transactions.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                    No transactions found.
                </div>
            )}
        </div>
    );
}
