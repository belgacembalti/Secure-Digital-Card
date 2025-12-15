import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import api from '../api/axios';

export default function AddCardModal({ onClose, onCardAdded }) {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState('');

    const onSubmit = async (data) => {
        setLoading(true);
        setServerError('');
        try {
            await api.post('/cards/', {
                card_number: data.cardNumber.replace(/\s/g, ''),
                cvv: data.cvv,
                expiry_date: data.expiryDate,
                card_holder_name: data.holderName
            });
            onCardAdded();
            onClose();
        } catch (error) {
            setServerError('Failed to add card. Please check details.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-gray-800 rounded-2xl w-full max-w-md border border-gray-700 shadow-2xl">
                <div className="flex justify-between items-center p-6 border-b border-gray-700">
                    <h3 className="text-xl font-bold text-white">Add New Card</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                    {serverError && (
                        <div className="bg-red-500/10 text-red-500 p-3 rounded-lg text-sm border border-red-500/50">
                            {serverError}
                        </div>
                    )}

                    <div>
                        <label className="block text-gray-400 text-sm mb-1">Card Holder Name</label>
                        <input
                            {...register('holderName', { required: true })}
                            className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-3 focus:border-blue-500 focus:outline-none"
                            placeholder="JOHN DOE"
                        />
                        {errors.holderName && <span className="text-red-400 text-xs">Required</span>}
                    </div>

                    <div>
                        <label className="block text-gray-400 text-sm mb-1">Card Number</label>
                        <input
                            {...register('cardNumber', {
                                required: true,
                                pattern: /^[0-9 ]{16,19}$/
                            })}
                            className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-3 focus:border-blue-500 focus:outline-none"
                            placeholder="0000 0000 0000 0000"
                        />
                        {errors.cardNumber && <span className="text-red-400 text-xs">Invalid card number</span>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-400 text-sm mb-1">Expiry Date</label>
                            <input
                                {...register('expiryDate', {
                                    required: true,
                                    pattern: /^(0[1-9]|1[0-2])\/([0-9]{2})$/
                                })}
                                className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-3 focus:border-blue-500 focus:outline-none"
                                placeholder="MM/YY"
                            />
                            {errors.expiryDate && <span className="text-red-400 text-xs">Format: MM/YY</span>}
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm mb-1">CVV</label>
                            <input
                                type="password"
                                {...register('cvv', { required: true, minLength: 3, maxLength: 4 })}
                                className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-3 focus:border-blue-500 focus:outline-none"
                                placeholder="123"
                            />
                            {errors.cvv && <span className="text-red-400 text-xs">Invalid CVV</span>}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg mt-4 flex items-center justify-center disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Add Card'}
                    </button>
                </form>
            </div>
        </div>
    );
}
