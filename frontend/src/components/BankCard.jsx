import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Wifi } from 'lucide-react';

export default function BankCard({ card, isDetails = false }) {
    const navigate = useNavigate();

    const handleClick = () => {
        if (!isDetails) {
            navigate(`/cards/${card.id}`);
        }
    };

    return (
        <div
            onClick={handleClick}
            className={`relative overflow-hidden rounded-2xl p-6 text-white transition-all ${isDetails ? '' : 'hover:scale-[1.02] hover:shadow-2xl cursor-pointer'
                } aspect-[1.586] ${card.is_blocked
                    ? 'bg-gray-800 grayscale'
                    : 'bg-gradient-to-br from-blue-600 to-indigo-700 shadow-xl shadow-blue-900/20'
                }`}
        >
            <div className="flex justify-between items-start mb-8">
                <div className="font-bold text-xl italic tracking-wider">SecureBank</div>
                <Wifi className="h-6 w-6 rotate-90 opacity-70" />
            </div>

            <div className="flex items-center space-x-3 mb-2">
                <div className="bg-yellow-200 h-8 w-10 rounded overflow-hidden relative">
                    <div className="absolute top-2 left-0 w-full h-[1px] bg-yellow-600/30"></div>
                </div>
                <Wifi className="h-6 w-6 rotate-90 text-white/50" />
            </div>

            <div className="mb-6 relative group">
                <div className="text-lg font-mono tracking-[0.2em] flex items-center space-x-4">
                    <span>••••</span>
                    <span>••••</span>
                    <span>••••</span>
                    <span>{card.last_four || '0000'}</span>
                </div>
            </div>

            <div className="flex justify-between items-end">
                <div>
                    <div className="text-xs text-blue-200 uppercase mb-1">Card Holder</div>
                    <div className="font-medium tracking-wide uppercase">{card.card_holder_name}</div>
                </div>
                <div className="text-right">
                    <div className="text-xs text-blue-200 uppercase mb-1">Expires</div>
                    <div className="font-medium">{card.expiry_date}</div>
                </div>
            </div>

            {card.is_blocked && (
                <div className="absolute top-4 right-4 bg-red-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                    Blocked
                </div>
            )}

            {/* Glossy Effect */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        </div>
    );
}
