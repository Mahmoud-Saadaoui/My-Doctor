import React, { useState, useEffect, useCallback } from "react";
import axios from "../lib/axios";
import { PROFILE_URL, DELETE_PROFILE_URL } from "../lib/urls";
import { transformName } from "../lib/helpers";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Loader from "../components/Loader";
import Alert from "../components/Alert";
import { LogOut, Edit, Trash2, MapPin, Phone, Clock, Stethoscope, User, ShieldCheck, ShieldAlert } from "lucide-react";
import { useTranslation } from "react-i18next";

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-start gap-4 border-b border-mist py-4 last:border-0">
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-mist text-brand-deep">
      {React.createElement(icon, { className: "h-6 w-6" })}
    </div>
    <div className="flex-1 text-start">
      <p className="text-sm font-medium text-brand/70">{label}</p>
      <p className="mt-1 text-lg font-semibold text-brand-deep">{value || "-"}</p>
    </div>
  </div>
);

const Profile = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [alert, setAlert] = useState({ visible: false, title: "", message: "", type: "" });

  const fetchProfile = useCallback(async () => {
    try {
      const response = await axios.get(PROFILE_URL);
      setUser(response.data);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // The request owns the loading/profile state for this screen.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async data fetch
    fetchProfile();
  }, [fetchProfile]);

  const showAlert = (title, message, type) => {
    setAlert({ visible: true, title, message, type });
  };

  const confirmDelete = () => {
    showAlert(
       t("profile.deleteTitle"),
       t("profile.deleteMessage"),
      "delete"
    );
  };

  const confirmLogout = () => {
    showAlert(
       t("profile.logoutTitle"),
       t("profile.logoutMessage"),
      "logout"
    );
  };

  const handleConfirm = async () => {
    try {
      if (alert.type === "delete") {
        const response = await axios.delete(DELETE_PROFILE_URL);
        console.log("Delete response:", response);
      }
      logout();
      navigate("/");
    } catch (e) {
      console.log("Delete error:", e);
      showAlert(
         t("common.error"),
         e.response?.data?.message || t("profile.deleteError"),
        "alert"
      );
      return;
    }
    setAlert({ ...alert, visible: false });
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, visible: false });
  };

  if (loading && !user) {
    return <Loader loading={loading} title={t("common.loading")} />;
  }

  return (
    <div className="min-h-screen bg-cream pt-16">
      <Alert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onClose={handleCloseAlert}
        onClick={handleConfirm}
      />
      <Loader loading={loading} />

      {user && (
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Page Title */}
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand text-brand-deep shadow-lg">
              <User className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-black text-brand-deep">{t("profile.title")}</h1>
            <p className="mt-2 text-brand-deep/80">{t("profile.subtitle")}</p>
          </div>

          {/* Profile Card */}
          <div className="overflow-hidden rounded-3xl bg-white shadow-xl">
            {/* Header */}
            <div className="bg-brand px-6 py-8 sm:px-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-2xl font-bold text-white backdrop-blur-sm">
                    {transformName(user.name)}
                  </div>
                  <div className="text-start">
                    <h2 className="text-2xl font-black text-white">{user.name}</h2>
                    <p className="text-cream">{user.email}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate("/update-profile")}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-cream backdrop-blur-sm transition-colors hover:bg-brand-deep/50"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 sm:p-8">
              {/* Verification status badge for doctors */}
              {user.userType === "doctor" && user.profile && (
                <div className={`mb-6 flex items-center gap-3 rounded-xl p-4 ${user.profile.isVerified ? "bg-mist" : "bg-cream"}`}>
                  {user.profile.isVerified ? (
                    <ShieldCheck className="h-6 w-6 text-brand" />
                  ) : (
                    <ShieldAlert className="h-6 w-6 text-brand-deep" />
                  )}
                  <div>
                    <p className="font-semibold text-brand-deep">
                      {user.profile.isVerified ? t("profile.verified") : t("profile.pendingVerification")}
                    </p>
                    <p className="text-sm text-brand/70">
                      {user.profile.isVerified ? t("profile.verifiedDesc") : t("profile.pendingVerificationDesc")}
                    </p>
                  </div>
                </div>
              )}

              {user.profile && (
                <div className="space-y-2">
                  <InfoRow
                    icon={Stethoscope}
                     label={t("profile.specialization")}
                    value={user.profile.specialization}
                  />
                  <InfoRow
                    icon={MapPin}
                     label={t("profile.address")}
                    value={user.profile.address}
                  />
                  <InfoRow
                    icon={Clock}
                     label={t("profile.workingHours")}
                    value={user.profile.workingHours}
                  />
                  <InfoRow
                    icon={Phone}
                     label={t("profile.phone")}
                    value={user.profile.phone}
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-mist bg-cream px-6 py-4">
              <button
                onClick={confirmLogout}
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-brand py-4 font-bold text-brand-deep shadow-lg shadow-brand/20 transition-all hover:bg-brand-deep hover:text-white"
              >
                <LogOut className="h-5 w-5" />
                 {t("profile.logout")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
