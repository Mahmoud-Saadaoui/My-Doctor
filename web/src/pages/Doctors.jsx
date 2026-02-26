import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../lib/axios";
import { DOCTORS_URL } from "../lib/urls";
import Loader from "../components/Loader";
import DoctorCard from "../components/DoctorCard";
import { Search, Stethoscope, Users } from "lucide-react";

const Doctors = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [allDoctors, setAllDoctors] = useState([]);
  const [searchValue, setSearchValue] = useState("");

  // Fetch all doctors once on mount
  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const response = await axios.get(DOCTORS_URL);
      setAllDoctors(response.data);
    } catch (e) {
      console.log("Error fetching doctors:", e);
    } finally {
      setLoading(false);
    }
  };

  // Filter doctors locally based on search (case-insensitive)
  const filteredDoctors = useMemo(() => {
    if (!searchValue.trim()) {
      return allDoctors;
    }

    const query = searchValue.trim().toLowerCase();

    return allDoctors.filter((doctor) => {
      // Search in name
      const nameMatch = doctor.name?.toLowerCase().includes(query);
      // Search in specialization
      const specMatch = doctor.profile?.specialization?.toLowerCase().includes(query);
      // Search in email
      const emailMatch = doctor.email?.toLowerCase().includes(query);

      return nameMatch || specMatch || emailMatch;
    });
  }, [allDoctors, searchValue]);

  const handleDoctorPress = useCallback(
    (doctorId) => {
      const doctor = allDoctors.find((d) => d.id === doctorId);
      if (doctor) {
        localStorage.setItem("selectedDoctor", JSON.stringify(doctor));
        navigate(`/doctor/${doctorId}`);
      }
    },
    [allDoctors, navigate]
  );

  const handleSearchChange = useCallback((e) => {
    setSearchValue(e.target.value);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchValue("");
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 pt-16">
      <Loader loading={loading} title="جاري تحميل قائمة الأطباء..." />

      {/* Page Header */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg">
            <Users className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 sm:text-4xl">ابحث عن طبيبك</h1>
          <p className="mt-2 text-gray-600">استعرض قائمة الأطباء المتخصصين واختر الأنسب لك</p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="ابحث باسم الطبيب أو التخصص..."
              value={searchValue}
              onChange={handleSearchChange}
              dir="rtl"
              className="w-full rounded-2xl border-2 border-gray-200 bg-white py-4 pr-14 pl-14 text-gray-900 placeholder-gray-400 shadow-lg outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
            <Search className="absolute right-5 top-1/2 h-6 w-6 -translate-y-1/2 text-gray-400" />
            {searchValue && (
              <button
                onClick={handleClearSearch}
                className="absolute left-5 top-1/2 -translate-y-1/2 rounded-full bg-gray-100 p-1 text-gray-500 hover:bg-gray-200 transition-colors"
                aria-label="مسح البحث"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Results Count */}
        {!loading && (
          <div className="mb-6 text-center">
            {searchValue ? (
              <p className="text-sm font-medium text-gray-500">
                <span className="font-bold text-blue-600">{filteredDoctors.length}</span> نتيجة للبحث عن <span className="font-semibold text-gray-700">"{searchValue}"</span>
              </p>
            ) : allDoctors.length > 0 && (
              <p className="text-sm font-medium text-gray-500">
                جميع الأطباء <span className="font-bold text-blue-600">({allDoctors.length})</span>
              </p>
            )}
          </div>
        )}

        {/* Doctors Grid */}
        {!loading && filteredDoctors.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredDoctors.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} onPress={handleDoctorPress} />
            ))}
          </div>
        ) : (
          !loading && (
            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl bg-white p-12 text-center shadow-xl">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100">
                <Stethoscope className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="mt-6 text-xl font-bold text-gray-900">
                {searchValue ? "لا توجد نتائج مطابقة" : "لا يوجد أطباء لعرضهم"}
              </h3>
              <p className="mt-2 text-gray-500">
                {searchValue ? "جرب البحث بكلمات مختلفة" : "سجل كطبيب للبدء"}
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Doctors;
