import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { colors } from '../../theme';

const PortalDashboard: React.FC<{ portalUser: any }> = ({ portalUser }) => {

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") || "{}") : null;



    // Close mobile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            if (isMobileMenuOpen && !target.closest(".nav-container")) {
                setIsMobileMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isMobileMenuOpen]);

    return (
        <div className="min-h-full p-2 md:p-8" style={{ backgroundColor: colors.GRAY_50 }}>
            <div className="w-full md:max-w-4xl flex flex-col items-center justify-center mx-auto bg-white rounded-lg shadow-xl p-4 md:p-8">
                <div>
                    <h1 className="text-3xl font-bold mb-4" style={{ color: colors.TEXT_COLOR }}>
                        Welcome, {portalUser?.fullName || portalUser?.email || portalUser?.mobile || 'Portal User'}!
                    </h1>
                    <p className="mb-6 text-gray-600">You have successfully logged in.</p>
                </div>
                <p className="mb-6 text-gray-600">For Uploading Property Continue With below login or signup</p>
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    {user ? (
                        <Link
                            to="/upload-property"
                            className="btn btn-primary"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Upload Property
                    </Link>):(
                        <div className='flex gap-4'>
                            <Link
                        to="/signup"
                                className="btn btn-outline"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Signup
                            </Link>
                            <Link
                        to="/login"
                                className="btn btn-primary"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Login
                            </Link>
                        </div>
                    )
                    }
                    <span className="text-gray-600">OR</span>
                    <Link
                        to="/upload-hostel"
                        className="btn btn-warning"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        Upload Hostel/PG
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PortalDashboard;
