import { Link, useNavigate } from "react-router-dom";
import { LogOut, User } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { applyLanguage } from "../i18n";

const Header = () => {
  const { isAuthenticated, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const handleLanguageChange = () => {
    const nextLanguage = i18n.language === "ar" ? "en" : "ar";
    i18n.changeLanguage(nextLanguage);
    applyLanguage(nextLanguage);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="app-header">
      <div className="app-header__inner">
        <Link to="/" className="app-logo" aria-label={t("header.homeAria")}>
          <span className="app-logo__mark"><img src="/favicon.svg" alt="" /></span>
          <span>{t("header.brand")}</span>
        </Link>

        <div className="app-header__actions">
          <button
            type="button"
            onClick={handleLanguageChange}
            className="rounded-lg border border-mist px-3 py-1.5 text-xs font-bold"
            aria-label={t("language.switchTo")}
          >
            {t("language.switchTo")}
          </button>
          {isAuthenticated ? (
            <>
              <Link to="/profile" className="app-header__profile">
                <User aria-hidden="true" />
                {t("header.profile")}
              </Link>
              <button type="button" onClick={handleLogout} className="app-header__logout">
                <LogOut aria-hidden="true" />
                {t("header.logout")}
              </button>
            </>
          ) : (
            <>
              <Link to="/signin" className="app-header__signin">{t("header.signin")}</Link>
              <Link to="/signup" className="app-header__signup">{t("header.signup")}</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
