import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { portalAuthService } from '../../services/portalAuth';
import { colors, shadows, animations, variants } from '../../theme';

const PortalLogin: React.FC = () => {
    const [emailOrMobile, setEmailOrMobile] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!emailOrMobile) {
            setError("Please enter Email/Mobile number");
            return;
        }

        const isEmail = emailOrMobile.includes('@');
        if (isEmail) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(emailOrMobile)) {
                setError("Please enter a valid email address");
                return;
            }
        } else {
            const mobileRegex = /^\d{10}$/;
            if (!mobileRegex.test(emailOrMobile)) {
                setError("Please enter a valid 10-digit mobile number");
                return;
            }
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await portalAuthService.login(emailOrMobile, password);

            if (response.status === 200) {
                setSuccess('Portal Login successful!');

                // Store portal user data separately to avoid conflict with main app user
                const { user, token } = response.data.responseObject;
                localStorage.setItem('portalUser', JSON.stringify(user));
                if (token) {
                    localStorage.setItem('portalToken', token);
                }

                // Dispatch event to update App state
                window.dispatchEvent(new Event("portal-user-login"));

                // Redirect
                setTimeout(() => {
                    // Navigate to a dedicated portal dashboard or home
                    // Since it doesn't exist, we might just assume user will handle it or we stick to a placeholder
                    navigate('/portal/dashboard');
                }, 1500);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Portal Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            className="min-h-screen flex items-center justify-center py-8 px-4"
            style={{ backgroundColor: colors.GRAY_50 }}
            variants={variants.springDrop}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={animations.springDrop}
        >
            <div className="w-full max-w-md">
                <div
                    className="card"
                    style={{
                        backgroundColor: colors.WHITE,
                        boxShadow: shadows.xl
                    }}
                >
                    <div className="card-body">
                        <div className="text-center mb-8">
                            <h2
                                className="text-3xl font-bold mb-2"
                                style={{ color: colors.TEXT_COLOR }}
                            >
                                Portal Login
                            </h2>
                            <p style={{ color: colors.GRAY_600 }}>
                                Login to access your portal
                            </p>
                        </div>

                        <form onSubmit={handleLogin}>
                            <div className="form-group">
                                <label htmlFor="emailOrMobile" className="form-label">
                                    Email or Mobile *
                                </label>
                                <input
                                    type="text"
                                    id="emailOrMobile"
                                    required
                                    value={emailOrMobile}
                                    onChange={(e) => setEmailOrMobile(e.target.value.replace(/\s+/g, ''))}
                                    className="form-input"
                                    placeholder="Enter email or mobile number"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="password" className="form-label">
                                    Password *
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="form-input"
                                    placeholder="Enter your password"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn btn-primary w-full"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center">
                                        <div className="spinner mr-2" />
                                        Logging in...
                                    </div>
                                ) : (
                                    'Portal Login'
                                )}
                            </button>
                        </form>

                        {error && (
                            <div className="alert alert-error mt-4">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="alert alert-success mt-4">
                                {success}
                            </div>
                        )}

                        <div className="text-center mt-6">
                            <p style={{ color: colors.GRAY_600 }}>
                                Don't have an account?{' '}
                                <button
                                    onClick={() => navigate('/portal/signup')}
                                    className="text-primary hover:underline font-medium"
                                    style={{ color: colors.PRIMARY_COLOR }}
                                >
                                    Portal Sign up here
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default PortalLogin;
