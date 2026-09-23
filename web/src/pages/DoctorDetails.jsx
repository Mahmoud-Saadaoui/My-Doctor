import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapPin, Phone, Clock, Stethoscope, Navigation, ArrowRight, CalendarDays } from "lucide-react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "../lib/axios";
import { APPOINTMENTS_URL, doctorDetailsUrl } from "../lib/urls";
import { useAuth } from "../contexts/AuthContext";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const MapView = ({ latitude, longitude }) => {
  const map = useMap();

  useEffect(() => {
    if (latitude && longitude) {
      map.setView([latitude, longitude], 15);
    }
  }, [latitude, longitude, map]);

  return null;
};

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

const DoctorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [booking, setBooking] = useState({ startsAt: "", endsAt: "", reason: "" });
  const [bookingState, setBookingState] = useState({ loading: false, message: "", error: "" });

  useEffect(() => {
    const controller = new AbortController();

    const fetchDoctor = async () => {
      try {
        const response = await axios.get(doctorDetailsUrl(id), { signal: controller.signal });
        setDoctor(response.data);
      } catch (requestError) {
        if (requestError.code !== "ERR_CANCELED") {
          setError(requestError.response?.data?.message || "تعذر تحميل بيانات الطبيب.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchDoctor();
    return () => controller.abort();
  }, [id]);

  const handleBooking = async (event) => {
    event.preventDefault();
    setBookingState({ loading: true, message: "", error: "" });

    try {
      await axios.post(APPOINTMENTS_URL, {
        doctorId: Number(id),
        startsAt: new Date(booking.startsAt).toISOString(),
        endsAt: new Date(booking.endsAt).toISOString(),
        reason: booking.reason,
      });
      setBooking({ startsAt: "", endsAt: "", reason: "" });
      setBookingState({ loading: false, message: "تم إرسال طلب الموعد للطبيب بنجاح.", error: "" });
    } catch (requestError) {
      setBookingState({
        loading: false,
        message: "",
        error: requestError.response?.data?.message || "تعذر إرسال طلب الموعد.",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream pt-16 flex items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-deep border-t-transparent"></div>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="min-h-screen bg-cream pt-16 flex items-center justify-center">
        <div className="text-center">
          <Stethoscope className="mx-auto h-16 w-16 text-brand/60" />
          <h2 className="mt-4 text-xl font-bold text-brand-deep">{error || "الطبيب غير موجود"}</h2>
          <button
            onClick={() => navigate("/doctors")}
            className="mt-4 rounded-xl bg-brand px-6 py-2 font-semibold text-white hover:bg-brand-deep"
          >
            العودة للقائمة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream pt-16">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate("/doctors")}
          className="group flex items-center gap-2 text-brand-deep/80 transition-colors hover:text-brand"
        >
          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          <span className="font-semibold">العودة للقائمة</span>
        </button>
      </div>

      <div className="mx-auto max-w-4xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl bg-white shadow-2xl">
          <div className="bg-brand px-6 py-8 sm:px-10">
            <div className="flex flex-col items-center gap-6 sm:flex-row">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 text-3xl font-bold text-white backdrop-blur-sm">
                {doctor.name?.slice(0, 2)}
              </div>
              <div className="flex-1 text-center sm:text-right">
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
                <h2 className="mb-4 text-xl font-bold text-brand-deep">معلومات الطبيب</h2>
                <InfoRow icon={Stethoscope} label="التخصص" value={doctor.profile.specialization} />
                <InfoRow icon={MapPin} label="العنوان" value={doctor.profile.address} />
                <InfoRow icon={Clock} label="ساعات العمل" value={doctor.profile.workingHours} />
                <InfoRow icon={Phone} label="رقم الهاتف" value={doctor.profile.phone} />
              </div>
            )}

            {(doctor.latitude || doctor.longitude) && (
              <div>
                <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-brand-deep">
                  <Navigation className="h-5 w-5 text-brand" />
                  الموقع على الخريطة
                </h3>
                <div className="h-80 overflow-hidden rounded-2xl border-2 border-mist shadow-lg">
                  <MapContainer center={[doctor.latitude || 0, doctor.longitude || 0]} zoom={15} style={{ height: "100%", width: "100%" }}>
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    />
                    <MapView latitude={doctor.latitude} longitude={doctor.longitude} />
                    {doctor.latitude && doctor.longitude && <Marker position={[doctor.latitude, doctor.longitude]} />}
                  </MapContainer>
                </div>
              </div>
            )}

            <div className="mt-10 border-t border-mist pt-8">
              <div className="mb-5 flex items-center gap-3">
                <CalendarDays className="h-6 w-6 text-brand" />
                <div>
                  <h2 className="text-xl font-bold text-brand-deep">طلب موعد</h2>
                  <p className="text-sm text-brand/70">اختر الوقت المناسب وسيؤكد الطبيب الطلب.</p>
                </div>
              </div>

              {isAuthenticated ? (
                <form onSubmit={handleBooking} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="text-sm font-semibold text-brand-deep">
                      بداية الموعد
                      <input
                        required
                        type="datetime-local"
                        value={booking.startsAt}
                        onChange={(event) => setBooking({ ...booking, startsAt: event.target.value })}
                        className="mt-2 w-full rounded-xl border-2 border-mist bg-cream px-4 py-3 font-normal outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                      />
                    </label>
                    <label className="text-sm font-semibold text-brand-deep">
                      نهاية الموعد
                      <input
                        required
                        type="datetime-local"
                        value={booking.endsAt}
                        onChange={(event) => setBooking({ ...booking, endsAt: event.target.value })}
                        className="mt-2 w-full rounded-xl border-2 border-mist bg-cream px-4 py-3 font-normal outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                      />
                    </label>
                  </div>
                  <label className="block text-sm font-semibold text-brand-deep">
                    Motif de consultation
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
                    disabled={bookingState.loading}
                    className="w-full rounded-xl bg-brand px-5 py-3.5 font-bold text-brand-deep shadow-lg shadow-brand/20 hover:bg-brand-deep hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {bookingState.loading ? "جاري إرسال الطلب..." : "إرسال طلب الموعد"}
                  </button>
                  {bookingState.message && <p className="text-sm font-semibold text-brand">{bookingState.message}</p>}
                  {bookingState.error && <p className="text-sm font-semibold text-brand-deep">{bookingState.error}</p>}
                </form>
              ) : (
                <button
                  onClick={() => navigate("/signin")}
                  className="w-full rounded-xl border-2 border-brand px-5 py-3.5 font-bold text-brand-deep hover:bg-cream"
                >
                  سجل الدخول لحجز موعد
                </button>
              )}
            </div>
          </div>

          <div className="border-t border-mist bg-cream px-6 py-5 sm:px-10">
            <button
              onClick={() => navigate("/doctors")}
              className="w-full rounded-2xl bg-brand py-4 font-bold text-brand-deep shadow-lg transition-all hover:bg-brand-deep hover:text-white"
            >
              العودة لقائمة الأطباء
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDetails;
