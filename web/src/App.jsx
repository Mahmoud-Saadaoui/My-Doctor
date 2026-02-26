import { lazy, Suspense, memo } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Header from "./components/Header";
import ProtectedRoute from "./components/ProtectedRoute";
import "./index.css";

// Lazy load pages for code splitting
const Home = lazy(() => import("./pages/Home"));
const SignIn = lazy(() => import("./pages/SignIn"));
const SignUp = lazy(() => import("./pages/SignUp"));
const Doctors = lazy(() => import("./pages/Doctors"));
const DoctorDetails = lazy(() => import("./pages/DoctorDetails"));
const Profile = lazy(() => import("./pages/Profile"));
const UpdateProfile = lazy(() => import("./pages/UpdateProfile"));

// Loading fallback component - memoized to prevent re-creation
const PageLoader = memo(() => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 pt-16 flex items-center justify-center">
    <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
  </div>
));

PageLoader.displayName = "PageLoader";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen">
          <Header />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/doctors" element={<Doctors />} />

              {/* Protected Routes */}
              <Route
                path="/doctor/:id"
                element={
                  <ProtectedRoute>
                    <DoctorDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/update-profile"
                element={
                  <ProtectedRoute>
                    <UpdateProfile />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Suspense>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
