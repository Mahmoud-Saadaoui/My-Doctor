import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, User, Stethoscope, Check, X, AlertCircle, Ban } from "lucide-react";
import axios from "../lib/axios";
import { APPOINTMENTS_URL, appointmentCancelUrl, appointmentStatusUrl } from "../lib/urls";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import Loader from "../components/Loader";
import Alert from "../components/Alert";

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  completed: "bg-blue-100 text-blue-800",
  no_show: "bg-gray-100 text-gray-800",
};

const Appointments = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [alert, setAlert] = useState({ visible: false, title: "", message: "", type: "alert" });
  const [actionLoading, setActionLoading] = useState(null);

  const isDoctor = user?.userType === "doctor";

  const fetchAppointments = useCallback(async () => {
    try {
      const response = await axios.get(APPOINTMENTS_URL);
      setAppointments(response.data);
    } catch (err) {
      setError(err.response?.data?.message || t("appointments.loadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleCancel = async (appointmentId) => {
    if (!window.confirm(t("appointments.cancelConfirm"))) return;

    setActionLoading(appointmentId);
    try {
      await axios.patch(appointmentCancelUrl(appointmentId));
      await fetchAppointments();
    } catch (err) {
      setAlert({
        visible: true,
        title: t("common.error"),
        message: err.response?.data?.message || t("appointments.cancelError"),
        type: "alert",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleStatusUpdate = async (appointmentId, status) => {
    setActionLoading(appointmentId);
    try {
      await axios.patch(appointmentStatusUrl(appointmentId), { status });
      await fetchAppointments();
    } catch (err) {
      setAlert({
        visible: true,
        title: t("common.error"),
        message: err.response?.data?.message || t("appointments.updateError"),
        type: "alert",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream pt-16 flex items-center justify-center">
        <Loader loading={true} title={t("appointments.loading")} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream pt-16">
      <Alert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ ...alert, visible: false })}
      />

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-brand-deep">{t("appointments.title")}</h1>
          <p className="mt-2 text-brand-deep/80">{t("appointments.subtitle")}</p>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {appointments.length === 0 ? (
          <div className="rounded-3xl bg-white p-12 text-center shadow-xl">
            <Calendar className="mx-auto h-16 w-16 text-brand/40" />
            <h3 className="mt-4 text-xl font-bold text-brand-deep">
              {t("appointments.emptyTitle")}
            </h3>
            <p className="mt-2 text-brand/70">{t("appointments.emptyText")}</p>
            <button
              onClick={() => navigate("/doctors")}
              className="mt-6 rounded-xl bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-deep"
            >
              {t("doctors.title")}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => {
              const otherUser = isDoctor ? appointment.patient : appointment.doctor;
              const canCancel = ["pending", "confirmed"].includes(appointment.status);
              const canUpdateStatus = isDoctor && appointment.status === "pending";

              return (
                <div
                  key={appointment.id}
                  className="rounded-2xl border border-mist bg-white p-6 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand text-white">
                        {isDoctor ? (
                          <User className="h-6 w-6" />
                        ) : (
                          <Stethoscope className="h-6 w-6" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-brand-deep">
                          {isDoctor
                            ? `${otherUser?.name || t("appointments.patient")}`
                            : `${otherUser?.name || t("appointments.doctor")}`}
                        </p>
                        <p className="text-sm text-brand/70">
                          {isDoctor
                            ? t("appointments.patient")
                            : otherUser?.profile?.specialization || t("appointments.doctor")}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        STATUS_COLORS[appointment.status]
                      }`}
                    >
                      {t(`appointments.${appointment.status}`)}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center gap-4 text-sm text-brand/70">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(appointment.startsAt)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>
                        {formatTime(appointment.startsAt)} - {formatTime(appointment.endsAt)}
                      </span>
                    </div>
                  </div>

                  {appointment.reason && (
                    <p className="mt-3 text-sm text-brand/70">
                      <span className="font-medium">{t("appointments.reason")}:</span>{" "}
                      {appointment.reason}
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2">
                    {canCancel && (
                      <button
                        onClick={() => handleCancel(appointment.id)}
                        disabled={actionLoading === appointment.id}
                        className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
                      >
                        <Ban className="h-4 w-4" />
                        {t("appointments.cancel")}
                      </button>
                    )}

                    {canUpdateStatus && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(appointment.id, "confirmed")}
                          disabled={actionLoading === appointment.id}
                          className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                        >
                          <Check className="h-4 w-4" />
                          {t("appointments.confirm")}
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(appointment.id, "cancelled")}
                          disabled={actionLoading === appointment.id}
                          className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                        >
                          <X className="h-4 w-4" />
                          {t("appointments.reject")}
                        </button>
                      </>
                    )}

                    {isDoctor && appointment.status === "confirmed" && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(appointment.id, "completed")}
                          disabled={actionLoading === appointment.id}
                          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                          <Check className="h-4 w-4" />
                          {t("appointments.complete")}
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(appointment.id, "no_show")}
                          disabled={actionLoading === appointment.id}
                          className="flex items-center gap-2 rounded-lg bg-gray-600 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-50"
                        >
                          <AlertCircle className="h-4 w-4" />
                          {t("appointments.markNoShow")}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Appointments;
