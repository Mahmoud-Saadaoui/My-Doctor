import React, { useState, useCallback, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, Stethoscope, User, LogOut } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = useCallback(() => {
    logout();
    navigate("/");
    setMobileMenuOpen(false);
  }, [logout, navigate]);

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen((prev) => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  const navLinks = useMemo(
    () => [
      { name: "الرئيسية", href: "/" },
      { name: "البحث", href: "/doctors" },
    ],
    []
  );

  // Memoize the mobile menu content to prevent re-renders
  const mobileMenuContent = useMemo(() => {
    return (
      <div className="md:hidden py-4 space-y-4 border-t border-gray-100">
        {navLinks.map((link) => (
          <Link
            key={link.name}
            to={link.href}
            onClick={closeMobileMenu}
            className="block py-2 text-base font-semibold text-gray-600 hover:text-blue-600"
          >
            {link.name}
          </Link>
        ))}
        <div className="pt-4 space-y-3 border-t border-gray-100">
          {isAuthenticated ? (
            <>
              <Link
                to="/profile"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 py-2 text-base font-semibold text-gray-600"
              >
                <User className="h-5 w-5" />
                الملف الشخصي
              </Link>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl bg-red-50 px-4 py-3 text-base font-semibold text-red-600"
              >
                <LogOut className="h-5 w-5" />
                خروج
              </button>
            </>
          ) : (
            <>
              <Link
                to="/signin"
                onClick={closeMobileMenu}
                className="block py-2 text-base font-semibold text-gray-600"
              >
                دخول
              </Link>
              <Link
                to="/signup"
                onClick={closeMobileMenu}
                className="block w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-center text-base font-semibold text-white"
              >
                إنشاء حساب
              </Link>
            </>
          )}
        </div>
      </div>
    );
  }, [navLinks, isAuthenticated, handleLogout, closeMobileMenu]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg group-hover:scale-110 transition-transform">
              <Stethoscope className="h-5 w-5" />
            </div>
            <span className="text-xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              طبيبي
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`text-sm font-semibold transition-colors ${
                  location.pathname === link.href
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <User className="h-4 w-4" />
                  الملف الشخصي
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  خروج
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/signin"
                  className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors"
                >
                  دخول
                </Link>
                <Link
                  to="/signup"
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all"
                >
                  إنشاء حساب
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-600 hover:bg-gray-100 md:hidden"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && mobileMenuContent}
      </div>
    </header>
  );
};

export default Header;
