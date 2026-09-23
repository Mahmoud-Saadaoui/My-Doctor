import React, { useState, useEffect, useDeferredValue, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "../lib/axios";
import { DOCTORS_URL } from "../lib/urls";
import Loader from "../components/Loader";
import DoctorCard from "../components/DoctorCard";
import { Search, Stethoscope, Users } from "lucide-react";

const Doctors = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState([]);
  const [searchValue, setSearchValue] = useState(() => searchParams.get("q") || "");
  const [resultMeta, setResultMeta] = useState({ total: 0 });
  const [error, setError] = useState("");
  const deferredSearch = useDeferredValue(searchValue);

  const fetchDoctors = useCallback(async (signal) => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(DOCTORS_URL, {
        params: { q: deferredSearch.trim() || undefined },
        signal,
      });
      setDoctors(response.data.data);
      setResultMeta(response.data.meta);
    } catch (requestError) {
      if (requestError.code !== "ERR_CANCELED") {
        setError("تعذر تحميل قائمة الأطباء. حاول مرة أخرى.");
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [deferredSearch]);

  useEffect(() => {
    const controller = new AbortController();
    // The request owns the loading/data state for this screen.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async data fetch
    fetchDoctors(controller.signal);
    return () => controller.abort();
  }, [fetchDoctors]);

  const handleDoctorPress = useCallback((doctorId) => {
    navigate(`/doctor/${doctorId}`);
  }, [navigate]);

  const handleSearchChange = useCallback((e) => {
    setSearchValue(e.target.value);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchValue("");
  }, []);

  return (
    <div className="min-h-screen bg-cream pt-16">
      <Loader loading={loading} title="جاري تحميل قائمة الأطباء..." />

      {/* Page Header */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand text-brand-deep shadow-lg">
            <Users className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-black text-brand-deep sm:text-4xl">ابحث عن طبيبك</h1>
          <p className="mt-2 text-brand-deep/80">استعرض قائمة الأطباء المتخصصين واختر الأنسب لك</p>
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
              className="w-full rounded-2xl border-2 border-mist bg-white py-4 pr-14 pl-14 text-brand-deep placeholder-brand/60 shadow-lg outline-none transition-all focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
            <Search className="absolute right-5 top-1/2 h-6 w-6 -translate-y-1/2 text-brand/60" />
            {searchValue && (
              <button
                onClick={handleClearSearch}
                className="absolute left-5 top-1/2 -translate-y-1/2 rounded-full bg-mist p-1 text-brand/70 hover:bg-cream transition-colors"
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
        {!loading && !error && (
          <div className="mb-6 text-center">
            {searchValue ? (
              <p className="text-sm font-medium text-brand/70">
                <span className="font-bold text-brand">{resultMeta.total}</span> نتيجة للبحث عن <span className="font-semibold text-brand-deep">"{searchValue}"</span>
              </p>
            ) : resultMeta.total > 0 && (
              <p className="text-sm font-medium text-brand/70">
                جميع الأطباء <span className="font-bold text-brand">({resultMeta.total})</span>
              </p>
            )}
          </div>
        )}

        {error && (
          <div className="rounded-3xl bg-white p-12 text-center shadow-xl">
            <p className="font-semibold text-brand-deep">{error}</p>
            <button onClick={() => fetchDoctors()} className="mt-4 rounded-xl bg-brand px-5 py-3 font-semibold text-white hover:bg-brand-deep">
              إعادة المحاولة
            </button>
          </div>
        )}

        {/* Doctors Grid */}
        {!loading && !error && doctors.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {doctors.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} onPress={handleDoctorPress} />
            ))}
          </div>
        ) : (
          !loading && !error && (
              <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl bg-white p-12 text-center shadow-xl">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-mist">
                <Stethoscope className="h-12 w-12 text-brand" />
              </div>
              <h3 className="mt-6 text-xl font-bold text-brand-deep">
                {searchValue ? "لا توجد نتائج مطابقة" : "لا يوجد أطباء لعرضهم"}
              </h3>
              <p className="mt-2 text-brand/70">
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
