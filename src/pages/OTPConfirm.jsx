import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/context/AuthContext";

const OTPConfirm = () => {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [email, setEmail] = useState('');
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { verifyOTP, resendOTP } = useAuth();

    useEffect(() => {
        // Get email from URL params or localStorage
        const emailParam = searchParams.get('email');
        const storedEmail = localStorage.getItem('signup_email');

        if (emailParam) {
            setEmail(emailParam);
        } else if (storedEmail) {
            setEmail(storedEmail);
        } else {
            // If no email, redirect to signup
            navigate('/signup');
        }
    }, [searchParams, navigate]);

    const handleVerifyOTP = async (e) => {
        e.preventDefault();

        if (!otp || otp.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const result = await verifyOTP(email, otp);

            if (result.success) {
                setMessage('Email verified successfully! Redirecting to login...');
                localStorage.removeItem('signup_email');

                setTimeout(() => {
                    navigate('/login', {
                        state: {
                            message: 'Account verified! You can now sign in.',
                            email: email
                        }
                    });
                }, 2000);
            } else {
                console.log('❌ OTP verification failed:', result.message);
                setError(result.message || 'Invalid OTP. Please try again.');
            }
        } catch (error) {
            console.error('💥 OTP verification error:', error);
            setError('Verification failed. Please try again.');
        } finally {
            setLoading(false);
            console.log('🏁 OTP verification completed');
        }
    };

    const handleResendOTP = async () => {
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const result = await resendOTP(email);

            if (result.success) {
                setMessage('New OTP sent to your email!');
            } else {
                setError(result.message || 'Failed to resend OTP');
            }
        } catch (error) {
            setError('Failed to resend OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleOTPChange = (e) => {
        const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
        setOtp(value);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Verify Your Email
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        We've sent a 6-digit verification code to
                    </p>
                    <p className="font-medium text-blue-600">{email}</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Enter Verification Code</CardTitle>
                        <CardDescription>
                            Check your email and enter the 6-digit code below
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleVerifyOTP} className="space-y-6">
                            {error && (
                                <Alert variant="destructive">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            {message && (
                                <Alert>
                                    <AlertDescription className="text-green-600">{message}</AlertDescription>
                                </Alert>
                            )}

                            <div>
                                <Input
                                    type="text"
                                    placeholder="Enter 6-digit code"
                                    value={otp}
                                    onChange={handleOTPChange}
                                    className="text-center text-2xl tracking-widest"
                                    maxLength={6}
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={loading || otp.length !== 6}
                            >
                                {loading ? 'Verifying...' : 'Verify Email'}
                            </Button>

                            <div className="text-center">
                                <p className="text-sm text-gray-600">
                                    Didn't receive the code?{' '}
                                    <button
                                        type="button"
                                        onClick={handleResendOTP}
                                        disabled={loading}
                                        className="font-medium text-blue-600 hover:text-blue-500 disabled:opacity-50"
                                    >
                                        Resend OTP
                                    </button>
                                </p>
                            </div>

                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={() => navigate('/signup')}
                                    className="text-sm text-gray-600 hover:text-gray-500"
                                >
                                    ← Back to Sign Up
                                </button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default OTPConfirm;