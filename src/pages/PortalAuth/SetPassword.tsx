import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { portalAuthService } from '../../services/portalAuth';
import { colors, shadows, animations, variants } from '../../theme';

interface LocationState {
    token?: string;
    emailOrMobile?: string;
    userId?: string;
}

const SetPassword: React.FC = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as LocationState;

    useEffect(() => {
        // If no token or userId, redirect to signup
        // userId is now critical
        if (!state || !state.token || !state.userId) {
            console.error("Missing state for password creation", state);
            navigate('/portal/signup');
        }
    }, [state, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // userId and token are now required
            const { token, userId } = state;

            if (!token || !userId) {
                throw new Error("Missing authentication context");
            }

            const response = await portalAuthService.createPassword(token, password, userId);

            if (response.status === 200 || response.status === 201) {
                setSuccess('Password set successfully!');

                setTimeout(() => {
                    navigate('/portal/login');
                }, 1500);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Failed to set password. Please try again.');
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
                                Set Password
                            </h2>
                            <p style={{ color: colors.GRAY_600 }}>
                                Create a password for your account
                            </p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="password" className="form-label">
                                    New Password *
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="form-input"
                                    placeholder="Enter new password"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="confirmPassword" className="form-label">
                                    Confirm Password *
                                </label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="form-input"
                                    placeholder="Confirm new password"
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
                                        Setting Password...
                                    </div>
                                ) : (
                                    'Set Password'
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
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default SetPassword;
