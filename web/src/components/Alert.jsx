import React from "react";
import { AlertCircle, CheckCircle, HelpCircle, Trash2, LogOut, X } from "lucide-react";

const Alert = ({ visible, title, message, type = "alert", onClose, onClick }) => {
  if (!visible) return null;

  const icons = {
    alert: <AlertCircle className="h-8 w-8 text-brand-deep" />,
    success: <CheckCircle className="h-8 w-8 text-brand" />,
    question: <HelpCircle className="h-8 w-8 text-brand" />,
    delete: <Trash2 className="h-8 w-8 text-brand-deep" />,
    logout: <LogOut className="h-8 w-8 text-gold" />,
  };

  const styles = {
    alert: "border-brand-deep/30 bg-cream",
    success: "border-brand/30 bg-mist",
    question: "border-brand/30 bg-cream",
    delete: "border-brand-deep/30 bg-cream",
    logout: "border-gold/40 bg-cream",
  };

  // Types that require confirmation buttons (yes/no)
  const confirmationTypes = ["question", "delete", "logout"];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className={`w-full max-w-md rounded-2xl border-2 p-6 shadow-2xl ${styles[type]}`}>
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            {icons[type]}
            <h3 className="text-xl font-bold text-brand-deep">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-brand/70 hover:bg-mist hover:text-brand-deep transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mb-6 text-brand-deep leading-relaxed">{message}</p>
        <div className={`flex gap-3 ${confirmationTypes.includes(type) ? "justify-end" : "justify-center"}`}>
          {confirmationTypes.includes(type) ? (
            <>
              <button
                onClick={onClick}
                className={`rounded-xl px-6 py-2.5 font-semibold text-white transition-colors ${
                  type === "delete" ? "bg-brand-deep hover:bg-brand" : "bg-brand hover:bg-brand-deep"
                }`}
              >
                نعم
              </button>
              <button
                onClick={onClose}
                className="rounded-xl border-2 border-brand/40 px-6 py-2.5 font-semibold text-brand-deep hover:bg-mist transition-colors"
              >
                لا
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="rounded-xl bg-brand-deep px-8 py-2.5 font-semibold text-white hover:bg-brand transition-colors"
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
