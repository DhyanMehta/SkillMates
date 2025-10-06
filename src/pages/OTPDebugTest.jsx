import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

const OTPDebugTest = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const sendOTP = async () => {
        setLoading(true);
        setResult(null);

        try {
            const { data, error } = await supabase.auth.signInWithOtp({
                email: email,
                options: {
                    shouldCreateUser: false,
                }
            });

            setResult({
                type: 'send',
                success: !error,
                data: data,
                error: error?.message
            });
        } catch (err) {
            setResult({
                type: 'send',
                success: false,
                error: err.message
            });
        }

        setLoading(false);
    };

    const verifyOTP = async () => {
        setLoading(true);
        setResult(null);

        try {
            const { data, error } = await supabase.auth.verifyOtp({
                email: email,
                token: otp,
                type: 'email'
            });

            setResult({
                type: 'verify',
                success: !error,
                data: data,
                error: error?.message
            });
        } catch (err) {
            setResult({
                type: 'verify',
                success: false,
                error: err.message
            });
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-center mb-6">OTP Debug Test</h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter email address"
                        />
                    </div>

                    <button
                        onClick={sendOTP}
                        disabled={loading || !email}
                        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Sending...' : 'Send OTP'}
                    </button>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            OTP Code
                        </label>
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter OTP code"
                        />
                    </div>

                    <button
                        onClick={verifyOTP}
                        disabled={loading || !email || !otp}
                        className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Verifying...' : 'Verify OTP'}
                    </button>
                </div>

                {result && (
                    <div className={`mt-6 p-4 rounded-md ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                        }`}>
                        <h3 className={`font-medium ${result.success ? 'text-green-800' : 'text-red-800'
                            }`}>
                            {result.type === 'send' ? 'OTP Send' : 'OTP Verify'} Result
                        </h3>

                        {result.success ? (
                            <div className="mt-2">
                                <p className="text-green-700">✓ Success</p>
                                {result.data && (
                                    <pre className="mt-2 text-xs bg-green-100 p-2 rounded overflow-auto">
                                        {JSON.stringify(result.data, null, 2)}
                                    </pre>
                                )}
                            </div>
                        ) : (
                            <div className="mt-2">
                                <p className="text-red-700">✗ Error: {result.error}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OTPDebugTest;