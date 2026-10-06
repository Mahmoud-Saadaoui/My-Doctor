import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar } from "lucide-react";
import { useTranslation } from "react-i18next";
import AvailabilityManager from "../components/AvailabilityManager";
import { useAuth } from "../contexts/AuthContext";

const DoctorAvailability = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Only doctors can access this page
  if (user?.userType !== "doctor") {
    return (
      <div className="min-h-screen bg-cream pt-16 flex items-center justify-center">
        <div className="text-center">
          <Calendar className="mx-auto h-16 w-16 text-brand/60" />
          <h2 className="mt-4 text-xl font-bold text-brand-deep">
            {t("availability.onlyDoctors")}
          </h2>
          <button
            onClick={() => navigate("/")}
            className="mt-4 rounded-xl bg-brand px-6 py-2 font-semibold text-white hover:bg-brand-deep"
          >
            {t("common.back")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream pt-16">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate("/profile")}
          className="group flex items-center gap-2 text-brand-deep/80 transition-colors hover:text-brand"
        >
          <ArrowLeft className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          <span className="font-semibold">{t("common.back")}</span>
        </button>
      </div>

      <div className="mx-auto max-w-4xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl bg-white shadow-2xl">
          <div className="bg-brand px-6 py-8 sm:px-10">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-white">
                <Calendar className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white">{t("availability.title")}</h1>
                <p className="mt-1 text-cream/80">{t("availability.subtitle")}</p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-10">
            <AvailabilityManager />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorAvailability;
