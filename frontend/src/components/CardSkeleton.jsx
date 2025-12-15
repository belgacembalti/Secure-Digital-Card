import React from 'react';

export default function CardSkeleton() {
    return (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 h-48 animate-pulse">
            <div className="flex justify-between items-start mb-8">
                <div className="h-4 w-24 bg-gray-700 rounded"></div>
                <div className="h-6 w-12 bg-gray-700 rounded"></div>
            </div>
            <div className="space-y-4">
                <div className="h-6 w-48 bg-gray-700 rounded"></div>
                <div className="flex justify-between items-center">
                    <div className="h-4 w-32 bg-gray-700 rounded"></div>
                    <div className="h-4 w-16 bg-gray-700 rounded"></div>
                </div>
            </div>
        </div>
    );
}
