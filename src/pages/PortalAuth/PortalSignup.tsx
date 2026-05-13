import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { portalAuthService } from '../../services/portalAuth';
import { colors, shadows, animations, variants } from '../../theme';

interface OTPFormData {
    otp: string;
}

const PortalSignup: React.FC = () => {
    // UPDATED: Using 'contact' to allow Email OR Mobile
    const [formData, setFormData] = useState<{ fullName: string; contact: string }>({
        fullName: '',
        contact: '',
    });
    const [userId, setUserId] = useState<string>('');
    const [otpData, setOtpData] = useState<OTPFormData>({
        otp: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otpTimer, setOtpTimer] = useState(0);
    const navigate = useNavigate();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'contact' ? value.replace(/\s+/g, '') : value
        }));
    };

    const handleOTPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        const otpValue = value.replace(/\D/g, '').slice(0, 6);
        setOtpData({ otp: otpValue });
    };

    const startOTPTimer = () => {
        setOtpTimer(60);
        const interval = setInterval(() => {
            setOtpTimer(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleSendOTP = async () => {
        // Validation for both fields
        if (!formData.fullName || !formData.contact) {
            setError("Please enter Full Name and Email/Mobile number");
            return;
        }

        const isEmail = formData.contact.includes('@');
        if (isEmail) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.contact)) {
                setError("Please enter a valid email address");
                return;
            }
        } else {
            const mobileRegex = /^\d{10}$/;
            if (!mobileRegex.test(formData.contact)) {
                setError("Please enter a valid 10-digit mobile number");
                return;
            }
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Service handles splitting contact into email/mobile
            const response = await portalAuthService.signup(formData.fullName, formData.contact);

            if (response.status === 200 || response.status === 201) {
                setSuccess('OTP sent successfully!');

                // Store userId for verification step
                if (response.data?.responseObject?.userId) {
                    setUserId(response.data.responseObject.userId);
                }

                setOtpSent(true);
                startOTPTimer();
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Determine OTP type
            const isEmail = formData.contact.includes('@');
            const otpType = isEmail ? 'email' : 'mobile';

            // Updated to use userId and otpType
            const response = await portalAuthService.verifyOtp(userId, otpData.otp, otpType);

            if (response.status === 200 || response.status === 201) {
                setSuccess('Verification successful!');

                // Extract tempToken from the correct path in response
                const tempToken = response.data?.responseObject?.tempToken;

                setTimeout(() => {
                    navigate('/portal/set-password', {
                        state: {
                            token: tempToken,
                            emailOrMobile: formData.contact,
                            userId: userId
                        }
                    });
                }, 1500);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to verify OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (otpTimer > 0) return;

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await portalAuthService.signup(formData.fullName, formData.contact);

            if (response.status === 200) {
                setSuccess('OTP resent successfully!');
                startOTPTimer();
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to resend OTP.');
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
                                {otpSent ? 'Verify OTP' : 'Portal Signup'}
                            </h2>
                            <p style={{ color: colors.GRAY_600 }}>
                                {otpSent
                                    ? 'Enter the OTP sent to your device'
                                    : 'Enter your details to continue'
                                }
                            </p>
                        </div>

                        {!otpSent ? (
                            // Signup Form
                            <form onSubmit={(e) => { e.preventDefault(); handleSendOTP(); }}>
                                <div className="form-group">
                                    <label htmlFor="fullName" className="form-label">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="fullName"
                                        name="fullName"
                                        required
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        placeholder="Enter your full name"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="contact" className="form-label">
                                        Email or Mobile *
                                    </label>
                                    <input
                                        type="text"
                                        id="contact"
                                        name="contact"
                                        required
                                        value={formData.contact}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        placeholder="Enter email or mobile number"
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
                                            Sending OTP...
                                        </div>
                                    ) : (
                                        'Send OTP'
                                    )}
                                </button>
                            </form>
                        ) : (
                            // OTP Verification Form
                            <form onSubmit={(e) => { e.preventDefault(); handleVerifyOTP(); }}>
                                <div className="form-group">
                                    <label htmlFor="otp" className="form-label">
                                        Enter OTP *
                                    </label>
                                    <input
                                        type="text"
                                        id="otp"
                                        name="otp"
                                        required
                                        value={otpData.otp}
                                        onChange={handleOTPChange}
                                        className="form-input text-center text-2xl tracking-widest"
                                        placeholder="0000"
                                        maxLength={6}
                                    />
                                    <p className="text-sm text-gray-500 mt-2">
                                        OTP sent to {formData.contact}
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || otpData.otp.length < 4}
                                    className="btn btn-primary w-full mb-4"
                                >
                                    {loading ? (
                                        <div className="flex items-center justify-center">
                                            <div className="spinner mr-2" />
                                            Verifying...
                                        </div>
                                    ) : (
                                        'Verify OTP'
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={handleResendOTP}
                                    disabled={loading || otpTimer > 0}
                                    className="btn btn-outline w-full"
                                >
                                    {otpTimer > 0 ? `Resend OTP in ${otpTimer}s` : 'Resend OTP'}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setOtpSent(false)}
                                    className="btn btn-secondary w-full mt-4"
                                >
                                    Back
                                </button>
                            </form>
                        )}

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

                        {!otpSent && (
                            <div className="text-center mt-6">
                                <p style={{ color: colors.GRAY_600 }}>
                                    Already have an account?{' '}
                                    <button
                                        onClick={() => navigate('/portal/login')}
                                        className="text-primary hover:underline font-medium"
                                        style={{ color: colors.PRIMARY_COLOR }}
                                    >
                                        Portal Login here
                                    </button>
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default PortalSignup;
