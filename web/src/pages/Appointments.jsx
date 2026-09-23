import React, { useCallback, useEffect, useState } from "react";
import axios from "../lib/axios";
import { APPOINTMENTS_URL, appointmentCancelUrl } from "../lib/urls";
import Loader from "../components/Loader";
import { CalendarDays, Clock3, Stethoscope } from "lucide-react";

const statusLabels = {
  pending: "في انتظار تأكيد الطبيب",
  confirmed: "مؤكد",
  cancelled: "ملغى",
  completed: "مكتمل",
  no_show: "لم يحضر",
};

const dateFormatter = new Intl.DateTimeFormat("ar-TN", {
  dateStyle: "medium",
  timeStyle: "short",
});

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAppointments = useCallback(async (signal) => {
    try {
      const response = await axios.get(APPOINTMENTS_URL, { signal });
      setAppointments(response.data);
    } catch (requestError) {
      if (requestError.code !== "ERR_CANCELED") {
        setError(requestError.response?.data?.message || "تعذر تحميل المواعيد.");
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    // The request owns the loading/appointment state for this screen.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async data fetch
    fetchAppointments(controller.signal);
    return () => controller.abort();
  }, [fetchAppointments]);

  const cancelAppointment = async (appointmentId) => {
    if (!window.confirm("هل تريد إلغاء هذا الموعد؟")) return;

    try {
      await axios.patch(appointmentCancelUrl(appointmentId));
      setAppointments((current) => current.map((appointment) => (
        appointment.id === appointmentId
          ? { ...appointment, status: "cancelled" }
          : appointment
      )));
    } catch (requestError) {
      setError(requestError.response?.data?.message || "تعذر إلغاء الموعد.");
    }
  };

  return (
    <div className="min-h-screen bg-cream pt-16">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand text-brand-deep shadow-lg">
            <CalendarDays className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-black text-brand-deep">مواعيدي</h1>
          <p className="mt-2 text-brand-deep/80">تابع طلباتك ومواعيدك الطبية من مكان واحد</p>
        </div>

        <Loader loading={loading} title="جاري تحميل المواعيد..." />

        {error && (
          <div className="mb-5 rounded-2xl border border-brand-deep/30 bg-cream p-4 text-center font-semibold text-brand-deep">
            {error}
          </div>
        )}

        {!loading && appointments.length === 0 && (
          <div className="rounded-3xl bg-white p-12 text-center shadow-xl">
            <CalendarDays className="mx-auto h-14 w-14 text-brand/60" />
            <h2 className="mt-4 text-xl font-bold text-brand-deep">لا توجد مواعيد بعد</h2>
            <p className="mt-2 text-brand/70">ابحث عن طبيب مناسب وأرسل أول طلب موعد.</p>
          </div>
        )}

        <div className="space-y-4">
          {appointments.map((appointment) => {
            const doctor = appointment.doctor;
            const isActive = !["cancelled", "completed", "no_show"].includes(appointment.status);

            return (
              <article key={appointment.id} className="rounded-3xl border border-mist bg-white p-5 shadow-lg sm:p-6">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-mist text-brand-deep">
                      <Stethoscope className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-brand-deep">د. {doctor?.name || "طبيب"}</h2>
                      <p className="mt-1 text-sm text-brand/70">{doctor?.profile?.specialization || "استشارة طبية"}</p>
                    </div>
                  </div>
                  <span className="w-fit rounded-full bg-cream px-3 py-1 text-sm font-semibold text-brand-deep">
                    {statusLabels[appointment.status] || appointment.status}
                  </span>
                </div>

                <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-brand-deep/80">
                  <Clock3 className="h-4 w-4 text-brand" />
                  {dateFormatter.format(new Date(appointment.startsAt))}
                </div>
                {appointment.reason && <p className="mt-3 text-sm leading-relaxed text-brand-deep/80">{appointment.reason}</p>}

                {isActive && (
                  <button
                    onClick={() => cancelAppointment(appointment.id)}
                    className="mt-5 rounded-xl border-2 border-brand-deep/30 px-4 py-2 text-sm font-semibold text-brand-deep hover:bg-cream"
                  >
                    Annuler le rendez-vous
                  </button>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Appointments;
