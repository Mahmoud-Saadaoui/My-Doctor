import React from "react";
import { AlertCircle, CheckCircle, HelpCircle, Trash2, LogOut, X } from "lucide-react";

const Alert = ({ visible, title, message, type = "alert", onClose, onClick }) => {
  if (!visible) return null;

  const icons = {
    alert: <AlertCircle className="h-8 w-8 text-red-500" />,
    success: <CheckCircle className="h-8 w-8 text-emerald-500" />,
    question: <HelpCircle className="h-8 w-8 text-blue-500" />,
    delete: <Trash2 className="h-8 w-8 text-red-500" />,
    logout: <LogOut className="h-8 w-8 text-orange-500" />,
  };

  const styles = {
    alert: "border-red-200 bg-red-50",
    success: "border-emerald-200 bg-emerald-50",
    question: "border-blue-200 bg-blue-50",
    delete: "border-red-200 bg-red-50",
    logout: "border-orange-200 bg-orange-50",
  };

  // Types that require confirmation buttons (yes/no)
  const confirmationTypes = ["question", "delete", "logout"];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className={`w-full max-w-md rounded-2xl border-2 p-6 shadow-2xl ${styles[type]}`}>
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            {icons[type]}
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mb-6 text-gray-700 leading-relaxed">{message}</p>
        <div className={`flex gap-3 ${confirmationTypes.includes(type) ? "justify-end" : "justify-center"}`}>
          {confirmationTypes.includes(type) ? (
            <>
              <button
                onClick={onClick}
                className={`rounded-xl px-6 py-2.5 font-semibold text-white transition-colors ${
                  type === "delete" ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                نعم
              </button>
              <button
                onClick={onClose}
                className="rounded-xl border-2 border-gray-300 px-6 py-2.5 font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
              >
                لا
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="rounded-xl bg-gray-900 px-8 py-2.5 font-semibold text-white hover:bg-gray-800 transition-colors"
            >
              موافق
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Alert;
