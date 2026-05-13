import axios from 'axios';

const API_BASE_URL = 'https://nextopson.com/temp';

export const portalAuthService = {
    signup: async (fullName: string, contact: string) => {
        const isEmail = contact.includes('@');
        const payload = {
            fullName,
            [isEmail ? 'email' : 'mobileNumber']: contact
        };

        return axios.post(`${API_BASE_URL}/api/v1/temp-auth/signup`, payload);
    },

    verifyOtp: async (userId: string, otp: string, otpType: 'email' | 'mobile') => {
        const payload = {
            userId,
            otp,
            otpType
        };

        return axios.post(`${API_BASE_URL}/api/v1/temp-auth/verify-otp`, payload);
    },

    createPassword: async (token: string, password: string, userId: string) => {
        return axios.post(`${API_BASE_URL}/api/v1/temp-auth/create-password`, {
            tempToken: token,
            password,
            userId
        });
    },

    login: async (emailOrMobile: string, password: string) => {
        const isEmail = emailOrMobile.includes('@');
        const payload = isEmail
            ? { email: emailOrMobile, password }
            : { mobileNumber: emailOrMobile, password };

        return axios.post(`${API_BASE_URL}/api/v1/temp-auth/login`, payload);
    }
};
