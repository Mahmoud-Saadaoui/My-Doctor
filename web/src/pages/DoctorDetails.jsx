import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapPin, Phone, Clock, Stethoscope, Navigation, ArrowRight, CalendarDays } from "lucide-react";
import axios from "../lib/axios";
import { APPOINTMENTS_URL, doctorDetailsUrl, doctorAvailabilityUrl } from "../lib/urls";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import MapView from "../components/MapView";

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

const DoctorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [booking, setBooking] = useState({ reason: "" });
  const [bookingState, setBookingState] = useState({ loading: false, message: "", error: "" });

  useEffect(() => {
    const controller = new AbortController();

    const fetchDoctor = async () => {
      try {
        const response = await axios.get(doctorDetailsUrl(id), { signal: controller.signal });
        setDoctor(response.data);
      } catch (requestError) {
        if (requestError.code !== "ERR_CANCELED") {
          setError(requestError.response?.data?.message || t("doctorDetails.loadError"));
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchDoctor();
    return () => controller.abort();
  }, [id, t]);

  // Fetch available slots when a date is selected
  useEffect(() => {
    if (!selectedDate) {
      setAvailableSlots([]);
      return;
    }

    const fetchSlots = async () => {
      setSlotsLoading(true);
      try {
        const startDate = new Date(selectedDate);
        const endDate = new Date(selectedDate);
        endDate.setDate(endDate.getDate() + 1);

        const response = await axios.get(`/doctors/${id}/available-slots`, {
          params: {
            startDate: startDate.toISOString().split("T")[0],
            endDate: endDate.toISOString().split("T")[0],
          },
        });
        setAvailableSlots(response.data.data || []);
      } catch (err) {
        console.error("Failed to fetch slots:", err);
        setAvailableSlots([]);
      } finally {
        setSlotsLoading(false);
      }
    };

    fetchSlots();
  }, [selectedDate, id]);

  const handleSlotSelect = useCallback((slot) => {
    setSelectedSlot(slot);
  }, []);

  const handleBooking = async (event) => {
    event.preventDefault();
    if (!selectedSlot) {
      setBookingState({ loading: false, message: "", error: t("doctorDetails.selectSlot") });
      return;
    }

    setBookingState({ loading: true, message: "", error: "" });

    try {
      await axios.post(APPOINTMENTS_URL, {
        doctorId: Number(id),
        startsAt: selectedSlot.startsAt,
        endsAt: selectedSlot.endsAt,
        reason: booking.reason,
      });
      setSelectedSlot(null);
      setBooking({ reason: "" });
      setBookingState({ loading: false, message: t("doctorDetails.requestSent"), error: "" });
    } catch (requestError) {
      setBookingState({
        loading: false,
        message: "",
        error: requestError.response?.data?.message || t("doctorDetails.requestError"),
      });
    }
  };

  const handleMarkerClick = useCallback(() => {
    // Could open a popup or highlight the doctor card
  }, []);

  // Get minimum date (today) for date input
  const today = new Date().toISOString().split("T")[0];

  if (loading) {
    return (
      <div className="min-h-screen bg-cream pt-16 flex items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-deep border-t-transparent" />
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="min-h-screen bg-cream pt-16 flex items-center justify-center">
        <div className="text-center">
          <Stethoscope className="mx-auto h-16 w-16 text-brand/60" />
          <h2 className="mt-4 text-xl font-bold text-brand-deep">{error || t("doctorDetails.notFound")}</h2>
          <button
            onClick={() => navigate("/doctors")}
            className="mt-4 rounded-xl bg-brand px-6 py-2 font-semibold text-white hover:bg-brand-deep"
          >
            {t("doctorDetails.backToList")}
          </button>
        </div>
      </div>
    );
  }

  const mapCenter = doctor.profile?.latitude && doctor.profile?.longitude
    ? [doctor.profile.latitude, doctor.profile.longitude]
    : [36.8065, 10.1815];

  const markers = doctor.profile?.latitude && doctor.profile?.longitude
    ? [{ id: doctor.id, latitude: doctor.profile.latitude, longitude: doctor.profile.longitude, selected: true }]
    : [];

  return (
    <div className="min-h-screen bg-cream pt-16">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate("/doctors")}
          className="group flex items-center gap-2 text-brand-deep/80 transition-colors hover:text-brand"
        >
          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          <span className="font-semibold">{t("doctorDetails.backToList")}</span>
        </button>
      </div>

      <div className="mx-auto max-w-4xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl bg-white shadow-2xl">
          <div className="bg-brand px-6 py-8 sm:px-10">
            <div className="flex flex-col items-center gap-6 sm:flex-row">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 text-3xl font-bold text-white backdrop-blur-sm">
                {doctor.name?.slice(0, 2)}
              </div>
              <div className="flex-1 text-center sm:text-start">
                <h1 className="text-2xl font-black text-white sm:text-3xl">{doctor.name}</h1>
                <p className="mt-1 text-cream">{doctor.email}</p>
                {doctor.profile?.specialization && (
                  <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5">
                    <Stethoscope className="h-4 w-4 text-white" />
                    <span className="text-sm font-semibold text-white">{doctor.profile.specialization}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-10">
            {doctor.profile && (
              <div className="mb-8 space-y-2">
                <h2 className="mb-4 text-xl font-bold text-brand-deep">{t("doctorDetails.information")}</h2>
                <InfoRow icon={Stethoscope} label={t("doctorDetails.specialization")} value={doctor.profile.specialization} />
                <InfoRow icon={MapPin} label={t("doctorDetails.address")} value={doctor.profile.address} />
                <InfoRow icon={Clock} label={t("doctorDetails.workingHours")} value={doctor.profile.workingHours} />
                <InfoRow icon={Phone} label={t("doctorDetails.phone")} value={doctor.profile.phone} />
              </div>
            )}

            {doctor.profile?.latitude && doctor.profile?.longitude && (
              <div>
                <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-brand-deep">
                  <Navigation className="h-5 w-5 text-brand" />
                  {t("doctorDetails.mapLocation")}
                </h3>
                <div className="h-80 overflow-hidden rounded-2xl border-2 border-mist shadow-lg">
                  <MapView
                    center={mapCenter}
                    zoom={15}
                    height="100%"
                    markers={markers}
                    onMarkerClick={handleMarkerClick}
                  />
                </div>
              </div>
            )}

            <div className="mt-10 border-t border-mist pt-8">
              <div className="mb-5 flex items-center gap-3">
                <CalendarDays className="h-6 w-6 text-brand" />
                <div>
                  <h2 className="text-xl font-bold text-brand-deep">{t("doctorDetails.requestAppointment")}</h2>
                  <p className="text-sm text-brand/70">{t("doctorDetails.requestHint")}</p>
                </div>
              </div>

              {isAuthenticated ? (
                <form onSubmit={handleBooking} className="space-y-4">
                  {/* Date Selection */}
                  <label className="block text-sm font-semibold text-brand-deep">
                    {t("doctorDetails.selectDate")}
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={today}
                      className="mt-2 w-full rounded-xl border-2 border-mist bg-cream px-4 py-3 font-normal outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                    />
                  </label>

                  {/* Available Slots */}
                  {selectedDate && (
                    <div>
                      <p className="mb-2 text-sm font-semibold text-brand-deep">
                        {t("doctorDetails.selectTime")}
                      </p>
                      {slotsLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand border-t-transparent" />
                        </div>
                      ) : availableSlots.length === 0 ? (
                        <p className="rounded-xl bg-mist p-4 text-sm text-brand/70">
                          {t("doctorDetails.noSlots")}
                        </p>
                      ) : (
                        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                          {availableSlots.map((slot, index) => {
                            const slotTime = new Date(slot.startsAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            });
                            const isSelected = selectedSlot?.startsAt === slot.startsAt;
                            return (
                              <button
                                key={index}
                                type="button"
                                onClick={() => handleSlotSelect(slot)}
                                className={`rounded-lg border-2 px-3 py-2 text-sm font-medium transition-colors ${
                                  isSelected
                                    ? "border-brand bg-brand text-white"
                                    : "border-mist bg-white text-brand-deep hover:border-brand/50"
                                }`}
                              >
                                {slotTime}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Reason */}
                  <label className="block text-sm font-semibold text-brand-deep">
                    {t("doctorDetails.reason")}
                    <textarea
                      value={booking.reason}
                      onChange={(event) => setBooking({ ...booking, reason: event.target.value })}
                      rows="3"
                      maxLength="2000"
                      className="mt-2 w-full rounded-xl border-2 border-mist bg-cream px-4 py-3 font-normal outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={bookingState.loading || !selectedSlot}
                    className="w-full rounded-xl bg-brand px-5 py-3.5 font-bold text-brand-deep shadow-lg shadow-brand/20 hover:bg-brand-deep hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {bookingState.loading ? t("doctorDetails.sendingRequest") : t("doctorDetails.sendRequest")}
                  </button>
                  {bookingState.message && <p className="text-sm font-semibold text-brand">{bookingState.message}</p>}
                  {bookingState.error && <p className="text-sm font-semibold text-brand-deep">{bookingState.error}</p>}
                </form>
              ) : (
                <button
                  onClick={() => navigate("/signin")}
                  className="w-full rounded-xl border-2 border-brand px-5 py-3.5 font-bold text-brand-deep hover:bg-cream"
                >
                  {t("doctorDetails.signinToBook")}
                </button>
              )}
            </div>
          </div>

          <div className="border-t border-mist bg-cream px-6 py-5 sm:px-10">
            <button
              onClick={() => navigate("/doctors")}
              className="w-full rounded-2xl bg-brand py-4 font-bold text-brand-deep shadow-lg transition-all hover:bg-brand-deep hover:text-white"
            >
              {t("doctorDetails.backToDoctors")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDetails;
