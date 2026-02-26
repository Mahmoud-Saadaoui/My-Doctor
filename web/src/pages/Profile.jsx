import React, { useState, useEffect } from "react";
import axios from "../lib/axios";
import { PROFILE_URL, DELETE_PROFILE_URL } from "../lib/urls";
import { transformName } from "../lib/helpers";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Loader from "../components/Loader";
import Alert from "../components/Alert";
import { LogOut, Edit, Trash2, MapPin, Phone, Clock, Stethoscope, User } from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [alert, setAlert] = useState({ visible: false, title: "", message: "", type: "" });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await axios.get(PROFILE_URL);
      setUser(response.data);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

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

  const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-4 border-b border-gray-100 py-4 last:border-0">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600">
        <Icon className="h-6 w-6" />
      </div>
      <div className="flex-1 text-right">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="mt-1 text-lg font-semibold text-gray-900">{value || "-"}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 pt-16">
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
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg">
              <User className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-black text-gray-900">الملف الشخصي</h1>
            <p className="mt-2 text-gray-600">إدارة معلوماتك الشخصية</p>
          </div>

          {/* Profile Card */}
          <div className="overflow-hidden rounded-3xl bg-white shadow-xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 sm:px-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-2xl font-bold text-white backdrop-blur-sm">
                    {transformName(user.name)}
                  </div>
                  <div className="text-right">
                    <h2 className="text-2xl font-black text-white">{user.name}</h2>
                    <p className="text-blue-100">{user.email}</p>
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
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-red-200 backdrop-blur-sm transition-colors hover:bg-red-500/30"
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
            <div className="border-t border-gray-100 bg-gray-50 px-6 py-4">
              <button
                onClick={confirmLogout}
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-red-500 to-red-600 py-4 font-bold text-white shadow-lg shadow-red-500/30 transition-all hover:scale-[1.02] hover:shadow-xl"
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
