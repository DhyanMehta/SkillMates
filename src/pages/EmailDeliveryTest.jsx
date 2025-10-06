import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

const EmailDeliveryTest = () => {
    const [testEmail, setTestEmail] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const sendTestEmail = async () => {
        setLoading(true);
        const timestamp = new Date().toISOString();

        try {
            // Test 1: Basic OTP send
            const { data: otpData, error: otpError } = await supabase.auth.signInWithOtp({
                email: testEmail,
                options: {
                    shouldCreateUser: false,
                }
            });

            const otpResult = {
                id: Date.now() + 1,
                timestamp,
                type: 'OTP Email',
                success: !otpError,
                data: otpData,
                error: otpError?.message
            };

            // Test 2: Check email settings
            const { data: settings, error: settingsError } = await supabase.auth.getSession();

            const settingsResult = {
                id: Date.now() + 2,
                timestamp,
                type: 'Auth Settings Check',
                success: !settingsError,
                data: settings ? 'Session accessible' : 'No session',
                error: settingsError?.message
            };

            setResults(prev => [otpResult, settingsResult, ...prev]);

        } catch (err) {
            const errorResult = {
                id: Date.now(),
                timestamp,
                type: 'Test Error',
                success: false,
                error: err.message
            };

            setResults(prev => [errorResult, ...prev]);
        }

        setLoading(false);
    };

    const clearResults = () => {
        setResults([]);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-2xl font-bold text-center mb-6">Email Delivery Test</h2>

                    <div className="flex gap-4 mb-4">
                        <input
                            type="email"
                            value={testEmail}
                            onChange={(e) => setTestEmail(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter test email address"
                        />
                        <button
                            onClick={sendTestEmail}
                            disabled={loading || !testEmail}
                            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Testing...' : 'Send Test'}
                        </button>
                    </div>

                    {results.length > 0 && (
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium">Test Results ({results.length})</h3>
                            <button
                                onClick={clearResults}
                                className="text-sm text-gray-500 hover:text-gray-700"
                            >
                                Clear Results
                            </button>
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    {results.map((result) => (
                        <div
                            key={result.id}
                            className={`bg-white rounded-lg shadow-md p-4 border-l-4 ${result.success
                                    ? 'border-green-500 bg-green-50'
                                    : 'border-red-500 bg-red-50'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h4 className={`font-medium ${result.success ? 'text-green-800' : 'text-red-800'
                                    }`}>
                                    {result.type}
                                </h4>
                                <span className="text-xs text-gray-500">
                                    {new Date(result.timestamp).toLocaleTimeString()}
                                </span>
                            </div>

                            <div className={`text-sm ${result.success ? 'text-green-700' : 'text-red-700'
                                }`}>
                                {result.success ? (
                                    <div>
                                        <p>✓ Success</p>
                                        {result.data && typeof result.data === 'string' && (
                                            <p className="mt-1 text-gray-600">{result.data}</p>
                                        )}
                                        {result.data && typeof result.data === 'object' && (
                                            <details className="mt-2">
                                                <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                                                    Show Details
                                                </summary>
                                                <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-auto max-h-40">
                                                    {JSON.stringify(result.data, null, 2)}
                                                </pre>
                                            </details>
                                        )}
                                    </div>
                                ) : (
                                    <p>✗ Error: {result.error}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {results.length === 0 && (
                    <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
                        No test results yet. Enter an email address and click "Send Test" to begin.
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmailDeliveryTest;