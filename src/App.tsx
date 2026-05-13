import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
  Navigate,
  useLocation,
} from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import AdminPanel from "./components/AdminPanel";
import { animations, variants } from "./theme";
import SetPassword from './pages/PortalAuth/SetPassword';
import "./App.css";
import { faHome } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PropertyUploadPage from "./components/PropertyUploadPage";
// import HostelUploadPage from "./components/HostelUploadPage";
import PortalDashboard from './pages/PortalAuth/PortalDashboard';
import { ProtectedRoute } from "./components/ProtectedRoute";

// main login for intern or protal users
import PortalSignup from './pages/PortalAuth/PortalSignup';
import PortalLogin from './pages/PortalAuth/PortalLogin';
// inner login fo making temp account or fake users
import SignupPage from "./pages/UserAuth/SignupPage";
import LoginPage from "./pages/UserAuth/LoginPage";

interface NavigationHeaderProps {
  user: any;
  setUser: (user: any) => void;
  portalUser: any;
  setPortalUser: (user: any) => void;
}

function NavigationHeader({ user, setUser, portalUser, setPortalUser }: NavigationHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

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

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("sessionToken");
    setUser(null);
    setIsMobileMenuOpen(false);
    navigate("/login");
  };

  const location = useLocation();

  const handlePortalLogout = () => {
    localStorage.removeItem("portalUser");
    localStorage.removeItem("portalToken");
    setPortalUser(null);
    setIsMobileMenuOpen(false);
    navigate("/portal/login");
  };

  const goToHome = () => {
    if (portalUser) {
      navigate("/portal/dashboard");
    } else {
      navigate("/admin");
    }
  }

  return (
    <motion.nav
      className="nav"
      variants={variants.springDrop}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={animations.springDrop}
    >
      <div className="nav-container">
        <div className="nav-brand" onClick={goToHome}>Property Manager</div>

        {/* Mobile Menu Toggle */}
        {window.innerWidth < 768 && (
          <button
            className="nav-toggle "
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            ☰
          </button>
        )}

        {/* Navigation Menu */}
        <div className={`nav-menu ${isMobileMenuOpen ? "open" : ""}`}>

          {/* Portal User Section - Shows for any logged-in portal user */}
          {portalUser ?
            (user ?
              (
                <>
                  <span className="text-primary bg-gray-100 lg:px-3 py-1.5 rounded-full text-sm">
                    welcome, {user?.fullName || ""}
                  </span>
                  <button onClick={handleLogout} className="btn btn-danger">
                    Logout {user ? `(${user?.fullName || ""})` : ""}
                  </button>
                </>
              ) : (
                <>
                  <span className="text-primary bg-gray-100 px-3 py-1 rounded-full text-sm">
                    Portal User, {portalUser?.fullName || portalUser?.name || 'User'}
                  </span>
                  <button onClick={handlePortalLogout} className="btn btn-danger">
                    Portal Logout
                  </button>
                </>
              )) :
            ("")
          }

          {location.pathname === "/upload-hostel" && (
            <Link
              to="/portal/dashboard"
              className="btn btn-secondary"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Portal Dashboard
            </Link>
          )}




          {(portalUser && user) && (
            <div>
              <Link
                to="/admin"
                className="btn bg-blue-500 rounded-md text-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Listings
              </Link>
            </div>
          )}
          {user && (
            <div>
              <Link
                to="/portal/dashboard"
                className="btn bg-blue-500 rounded-md"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FontAwesomeIcon icon={faHome} className="text-2xl text-white" />
              </Link>
            </div>
          )}

        </div>
      </div>
    </motion.nav>
  );
}

function App() {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [portalUser, setPortalUser] = useState(() => {
    const storedPortalUser = localStorage.getItem("portalUser");
    return storedPortalUser ? JSON.parse(storedPortalUser) : null;
  });

  // Re-add listener for immediate state updates across the app (e.g. from Login component)
  useEffect(() => {
    const handleUserUpdate = () => {
      const storedUser = localStorage.getItem("user");
      setUser(storedUser ? JSON.parse(storedUser) : null);
    };

    const handlePortalUserUpdate = () => {
      const storedPortalUser = localStorage.getItem("portalUser");
      setPortalUser(storedPortalUser ? JSON.parse(storedPortalUser) : null);
    }

    window.addEventListener("user-login", handleUserUpdate);
    window.addEventListener("portal-user-login", handlePortalUserUpdate);
    window.addEventListener("storage", handleUserUpdate); // Fallback
    window.addEventListener("storage", handlePortalUserUpdate);

    return () => {
      window.removeEventListener("user-login", handleUserUpdate);
      window.removeEventListener("portal-user-login", handlePortalUserUpdate);
      window.removeEventListener("storage", handleUserUpdate);
      window.removeEventListener("storage", handlePortalUserUpdate);
    };
  }, []);

  return (
    <Router>
      <div className="min-h-full bg-gray-50">
        {/* <NavigationHeader /> */}
        <NavigationHeader
          user={user}
          setUser={setUser}
          portalUser={portalUser}
          setPortalUser={setPortalUser}
        />

        {/* Main Content */}
        <motion.main
          className="md:container md:py-6"
          variants={variants.springDrop}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={animations.springDrop}
        >
          <AnimatePresence mode="wait">
            <Routes>
              <Route
                path="/"
                element={
                  user ? (
                    <Navigate to="/admin" replace />
                  ) : localStorage.getItem("portalUser") ? (
                    <Navigate to="/portal/dashboard" replace />
                  ) : (
                    <Navigate to="/portal/login" replace />
                  )
                }
              />
              <Route
                path="/signup"
                element={user ? <Navigate to="/admin" replace /> : <SignupPage />}
              />
              <Route
                path="/login"
                element={user ? <Navigate to="/admin" replace /> : <LoginPage setUser={setUser} />}
              />
              <Route
                path="/upload-property"
                element={
                  <ProtectedRoute>
                    <PropertyUploadPage />
                  </ProtectedRoute>
                }
              />
              {/* <Route
                path="/upload-hostel"
                element={
                  <HostelUploadPage />
                }
              /> */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminPanel />
                  </ProtectedRoute>
                }
              />
              {/* Portal Auth Routes */}
              <Route path="/portal/signup" element={<PortalSignup />} />
              <Route path="/portal/login" element={<PortalLogin />} />
              <Route path="/portal/set-password" element={<SetPassword />} />
              <Route path="/portal/dashboard" element={<PortalDashboard portalUser={portalUser} />} />
            </Routes>
          </AnimatePresence>
        </motion.main>
      </div>
    </Router>
  );
}

export default App;
