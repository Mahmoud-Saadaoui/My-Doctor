import React, { useState, useEffect, useCallback } from "react";
import axios from "../lib/axios";
import { PROFILE_URL, DELETE_PROFILE_URL } from "../lib/urls";
import { transformName } from "../lib/helpers";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Loader from "../components/Loader";
import Alert from "../components/Alert";
import { LogOut, Edit, Trash2, MapPin, Phone, Clock, Stethoscope, User } from "lucide-react";

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-start gap-4 border-b border-mist py-4 last:border-0">
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-mist text-brand-deep">
      {React.createElement(icon, { className: "h-6 w-6" })}
    </div>
    <div className="flex-1 text-right">
      <p className="text-sm font-medium text-brand/70">{label}</p>
      <p className="mt-1 text-lg font-semibold text-brand-deep">{value || "-"}</p>
    </div>
  </div>
);

const Profile = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
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
      "أنت على وشك حذف حسابك",
      "هل تريد بالفعل حذف حسابك؟ هذا الإجراء لا يمكن التراجع عنه.",
      "delete"
    );
  };

  const confirmLogout = () => {
    showAlert(
      "أنت على وشك تسجيل الخروج",
      "هل تريد تسجيل الخروج من التطبيق بالفعل؟",
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
        "خطأ!",
        e.response?.data?.errors?.[0]?.message || "حدث خطأ أثناء حذف الحساب",
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
    return <Loader loading={loading} title="جاري تحميل الملف الشخصي" />;
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
            <h1 className="text-3xl font-black text-brand-deep">الملف الشخصي</h1>
            <p className="mt-2 text-brand-deep/80">إدارة معلوماتك الشخصية</p>
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
                  <div className="text-right">
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
              {user.profile && (
                <div className="space-y-2">
                  <InfoRow
                    icon={Stethoscope}
                    label="التخصص"
                    value={user.profile.specialization}
                  />
                  <InfoRow
                    icon={MapPin}
                    label="العنوان"
                    value={user.profile.address}
                  />
                  <InfoRow
                    icon={Clock}
                    label="ساعات العمل"
                    value={user.profile.workingHours}
                  />
                  <InfoRow
                    icon={Phone}
                    label="رقم الهاتف"
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
                تسجيل الخروج
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
