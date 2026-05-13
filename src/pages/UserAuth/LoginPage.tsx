import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { colors, shadows, animations, variants } from '../../theme';

interface LoginFormData {
  mobileNumber: string;
}

interface OTPFormData {
  otp: string;
}

interface LoginPageProps {
  setUser: (user: any) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ setUser }) => {
  const BACKEND_URL = "https://nextopson.com/temp";
  const [formData, setFormData] = useState<LoginFormData>({
    mobileNumber: ''
  });
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
      [name]: name === 'mobileNumber' ? value.replace(/\D/g, '').slice(0, 10) : value
    }));
  };

  const handleOTPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    // Only allow numbers and limit to 4 digits
    const otpValue = value.replace(/\D/g, '').slice(0, 4);
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
    const mobileRegex = /^\d{10}$/;
    if (!mobileRegex.test(formData.mobileNumber)) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(`${BACKEND_URL}/api/v1/temp/login/send-otp`, {
        mobileNumber: formData.mobileNumber
      });

      if (response.status === 200) {
        setSuccess('OTP sent successfully!');
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
      const response = await axios.post(`${BACKEND_URL}/api/v1/temp/login/verify-otp`, {
        mobileNumber: formData.mobileNumber,
        otp: otpData.otp
      });

      if (response.status === 200) {
        setSuccess('Login successful!');

        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setUser(response.data.user);
        window.dispatchEvent(new Event("user-login"));

        // Redirect to property upload page
        setTimeout(() => {
          navigate('/upload-property');
        }, 1500);
      }
    } catch (err: any) {
      if (err.code === 'ERR_HTTP_HEADERS_SENT' || err.message?.includes('headers')) {
        if (err.response?.data?.user) {
          setSuccess('Login successful!');
          localStorage.setItem('user', JSON.stringify(err.response.data.user));
          setTimeout(() => {
            navigate('/upload-property');
          }, 1500);
        } else {
          setError('Login verification completed but there was a server issue. Please try again.');
        }
      } else {
        setError(err.response?.data?.message || 'Failed to verify OTP. Please try again.');
      }
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
      const response = await axios.post(`${BACKEND_URL}/api/v1/temp/login/send-otp`, {
        mobileNumber: formData.mobileNumber
      });

      if (response.status === 200) {
        setSuccess('OTP resent successfully!');
        startOTPTimer();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="min-h-[calc(100vh-9.5vh)] flex items-center justify-center py-10 px-4"
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
                {otpSent ? 'Verify OTP' : 'Welcome Back'}
              </h2>
              <p style={{ color: colors.GRAY_600 }}>
                {otpSent
                  ? 'Enter the 4-digit OTP sent to your mobile'
                  : 'Login to access your account'
                }
              </p>
            </div>

            {!otpSent ? (
              // Login Form
              <form onSubmit={(e) => { e.preventDefault(); handleSendOTP(); }}>
                <div className="form-group">
                  <label htmlFor="mobileNumber" className="form-label">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    id="mobileNumber"
                    name="mobileNumber"
                    required
                    value={formData.mobileNumber}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter mobile number"
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
                    maxLength={4}
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    OTP sent to {formData.mobileNumber}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || otpData.otp.length !== 4}
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
                  Back to Login
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
                  Don't have an account?{' '}
                  <button
                    onClick={() => navigate('/signup')}
                    className="text-primary hover:underline font-medium"
                    style={{ color: colors.PRIMARY_COLOR }}
                  >
                    Sign up here
                  </button>
                </p>
              </div>
            )}
          </div>

          <div className='text-center my-2'>
            <button className='btn btn-secondary' onClick={() => navigate('/portal/dashboard')}> Back To Portal Dashboard</button></div>
        </div>
      </div>
    </motion.div>
  );
};

export default LoginPage; 