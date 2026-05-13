import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { colors, shadows, animations, variants } from '../../theme';


interface SignupFormData {
  fullName: string;
  mobileNumber: string;
  userType: 'Agent' | 'Owner' | 'EndUser';
}

interface OTPFormData {
  otp: string;
}

const SignupPage: React.FC = () => {

  const BACKEND_URL = "https://nextopson.com/temp";

  const [formData, setFormData] = useState<SignupFormData>({
    fullName: '',
    mobileNumber: '',
    userType: 'Owner'
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'mobileNumber' ? value.replace(/\D/g, '').slice(0, 10) : value
    }));
  };

  const handleOTPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
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
      const response = await axios.post(`${BACKEND_URL}/api/v1/temp/signup/send-otp`, {
        fullName: formData.fullName,
        mobileNumber: formData.mobileNumber,
        userType: formData.userType
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
      const response = await axios.post(`${BACKEND_URL}/api/v1/temp/signup/verify-otp`, {
        fullName: formData.fullName,
        mobileNumber: formData.mobileNumber,
        otp: otpData.otp,
        userType: formData.userType
      });

      if (response.status === 201) {
        setSuccess('Account created successfully!');

        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(response.data.user));

        // Redirect to property upload page
        setTimeout(() => {
          navigate('/upload-property');
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
      const response = await axios.post(`${BACKEND_URL}/api/v1/temp/signup/send-otp`, {
        fullName: formData.fullName,
        mobileNumber: formData.mobileNumber,
        userType: formData.userType
      });

      if (response.status === 200) {
        setSuccess('OTP resent successfully!');
        startOTPTimer();
      }
    } catch (err: any) {
      setError(err.response?.data?.message);
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
                {otpSent ? 'Verify OTP' : 'Create Account'}
              </h2>
              <p style={{ color: colors.GRAY_600 }}>
                {otpSent
                  ? 'Enter the 4-digit OTP sent to your mobile'
                  : 'Sign up to start uploading properties'
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
                  <label htmlFor="userType" className="form-label">
                    User Type *
                  </label>
                  <select
                    id="userType"
                    name="userType"
                    required
                    value={formData.userType}
                    onChange={handleInputChange}
                    className="form-input"
                  >
                    <option value="Agent">Agent</option>
                    <option value="Owner">Owner</option>
                    <option value="EndUser">EndUser</option>
                  </select>
                </div>
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
                  Back to Signup
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
                    onClick={() => navigate('/login')}
                    className="text-primary hover:underline font-medium"
                    style={{ color: colors.PRIMARY_COLOR }}
                  >
                    Login here
                  </button>
                </p>
              </div>
            )}

            <div className='w-full flex items-center justify-center pt-4'>
              <button onClick={() => navigate('/portal/dashboard')} className="btn btn-secondary w-full">
                Back to Portal Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SignupPage; 