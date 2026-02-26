import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Stethoscope, User, LogOut } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navItems = [
    { path: "/", label: "الرئيسية", icon: Home },
  ];

  const authItems = isAuthenticated
    ? [
        { path: "/doctors", label: "الأطباء", icon: Stethoscope },
        { path: "/profile", label: "الملف الشخصي", icon: User },
      ]
    : [];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-lg border-t border-gray-200 shadow-lg sm:static sm:border-b sm:border-t-0 sm:shadow-md">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-around sm:justify-center sm:gap-8">
          {/* Logo */}
          <Link to="/" className="hidden sm:flex items-center gap-2 font-black text-xl text-blue-600">
            <Stethoscope className="h-6 w-6" />
            طبيبي
          </Link>

          {/* Nav Items */}
          <div className="flex w-full justify-around sm:w-auto sm:justify-center sm:gap-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-sm font-medium transition-all sm:flex-row sm:px-4 sm:py-2 ${
                  isActive(item.path)
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-xs sm:text-sm">{item.label}</span>
              </Link>
            ))}

            {authItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-sm font-medium transition-all sm:flex-row sm:px-4 sm:py-2 ${
                  isActive(item.path)
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-xs sm:text-sm">{item.label}</span>
              </Link>
            ))}

            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-sm font-medium text-gray-600 transition-all hover:text-red-600 hover:bg-red-50 sm:flex-row sm:px-4 sm:py-2"
              >
                <LogOut className="h-5 w-5" />
                <span className="text-xs sm:text-sm">خروج</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
