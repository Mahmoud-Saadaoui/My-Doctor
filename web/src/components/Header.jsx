import { Link, useNavigate } from "react-router-dom";
import { LogOut, User } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const Header = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="app-header">
      <div className="app-header__inner">
        <Link to="/" className="app-logo" aria-label="العودة إلى الصفحة الرئيسية">
          <span className="app-logo__mark"><img src="/favicon.svg" alt="" /></span>
          <span>طبيبي</span>
        </Link>

        <div className="app-header__actions">
          {isAuthenticated ? (
            <>
              <Link to="/profile" className="app-header__profile">
                <User aria-hidden="true" />
                الملف الشخصي
              </Link>
              <button type="button" onClick={handleLogout} className="app-header__logout">
                <LogOut aria-hidden="true" />
                خروج
              </button>
            </>
          ) : (
            <>
              <Link to="/signin" className="app-header__signin">دخول</Link>
              <Link to="/signup" className="app-header__signup">إنشاء حساب</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
