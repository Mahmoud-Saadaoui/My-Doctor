import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { X, MapPin, Phone, Clock, Stethoscope, Navigation, ArrowRight } from "lucide-react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { transformName } from "../lib/helpers";

// Fix for default marker icon in Leaflet
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

const DoctorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, you would fetch the doctor details by ID
    // For now, we'll get it from the localStorage or navigate back
    const storedDoctor = localStorage.getItem("selectedDoctor");
    if (storedDoctor) {
      setDoctor(JSON.parse(storedDoctor));
      setLoading(false);
    } else {
      // If no stored doctor, navigate back
      navigate("/doctors");
    }
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 pt-16 flex items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 pt-16 flex items-center justify-center">
        <div className="text-center">
          <Stethoscope className="mx-auto h-16 w-16 text-gray-400" />
          <h2 className="mt-4 text-xl font-bold text-gray-900">الطبيب غير موجود</h2>
          <button
            onClick={() => navigate("/doctors")}
            className="mt-4 rounded-xl bg-blue-600 px-6 py-2 text-white font-semibold hover:bg-blue-700"
          >
            العودة للقائمة
          </button>
        </div>
      </div>
    );
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
      {/* Back Button */}
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate("/doctors")}
          className="group flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
        >
          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          <span className="font-semibold">العودة للقائمة</span>
        </button>
      </div>

      {/* Doctor Card */}
      <div className="mx-auto max-w-4xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl bg-white shadow-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 sm:px-10">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 text-3xl font-bold text-white backdrop-blur-sm">
                {transformName(doctor.name)}
              </div>
              <div className="text-center sm:text-right flex-1">
                <h1 className="text-2xl sm:text-3xl font-black text-white">{doctor.name}</h1>
                <p className="mt-1 text-blue-100">{doctor.email}</p>
                {doctor.profile?.specialization && (
                  <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5">
                    <Stethoscope className="h-4 w-4 text-white" />
                    <span className="text-sm font-semibold text-white">{doctor.profile.specialization}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-10">
            {doctor.profile && (
              <div className="mb-8 space-y-2">
                <h2 className="mb-4 text-xl font-bold text-gray-900">معلومات الطبيب</h2>
                <InfoRow
                  icon={Stethoscope}
                  label="التخصص"
                  value={doctor.profile.specialization}
                />
                <InfoRow
                  icon={MapPin}
                  label="العنوان"
                  value={doctor.profile.address}
                />
                <InfoRow
                  icon={Clock}
                  label="ساعات العمل"
                  value={doctor.profile.workingHours}
                />
                <InfoRow
                  icon={Phone}
                  label="رقم الهاتف"
                  value={doctor.profile.phone}
                />
              </div>
            )}

            {/* Map */}
            {(doctor.latitude || doctor.longitude) && (
              <div>
                <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
                  <Navigation className="h-5 w-5 text-blue-600" />
                  الموقع على الخريطة
                </h3>
                <div className="h-80 overflow-hidden rounded-2xl border-2 border-gray-100 shadow-lg">
                  <MapContainer
                    center={[doctor.latitude || 0, doctor.longitude || 0]}
                    zoom={15}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    />
                    <MapView latitude={doctor.latitude} longitude={doctor.longitude} />
                    {doctor.latitude && doctor.longitude && (
                      <Marker position={[doctor.latitude, doctor.longitude]} />
                    )}
                  </MapContainer>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 bg-gray-50 px-6 py-5 sm:px-10">
            <button
              onClick={() => navigate("/doctors")}
              className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-4 font-bold text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl"
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
