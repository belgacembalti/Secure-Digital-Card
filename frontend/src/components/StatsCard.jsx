import React from 'react';

export default function StatsCard({ title, value, icon: Icon, color = 'blue', trend = null }) {
    const colorClasses = {
        blue: 'from-blue-600 to-blue-700',
        green: 'from-green-600 to-green-700',
        purple: 'from-purple-600 to-purple-700',
        orange: 'from-orange-600 to-orange-700',
    };

    return (
        <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-2xl p-6 text-white shadow-lg`}>
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <p className="text-sm opacity-80 mb-1">{title}</p>
                    <p className="text-3xl font-bold">{value}</p>
                </div>
                {Icon && (
                    <div className="bg-white/20 p-3 rounded-xl">
                        <Icon className="h-6 w-6" />
                    </div>
                )}
            </div>
            {trend && (
                <div className="flex items-center text-sm mt-2">
                    <span className={trend.value >= 0 ? 'text-green-300' : 'text-red-300'}>
                        {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
                    </span>
                    <span className="ml-2 opacity-75">{trend.label}</span>
                </div>
            )}
        </div>
    );
}
