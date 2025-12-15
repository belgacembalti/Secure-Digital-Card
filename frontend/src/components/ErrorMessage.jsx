import React from 'react';

export default function ErrorMessage({ message, onRetry }) {
    return (
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
            <div className="flex items-start">
                <div className="flex-1">
                    <h3 className="text-red-400 font-semibold mb-1">Error</h3>
                    <p className="text-red-300 text-sm">{message}</p>
                </div>
            </div>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="mt-3 text-sm text-red-400 hover:text-red-300 underline"
                >
                    Try again
                </button>
            )}
        </div>
    );
}
