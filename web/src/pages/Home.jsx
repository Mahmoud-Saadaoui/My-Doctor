import React, { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Stethoscope, HeartPulse, MapPin, Shield, ArrowLeft, Sparkles, User } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const features = useMemo(
    () => [
      {
        icon: Stethoscope,
        title: "أفضل الأطباء",
        description: "ابحث عن الطبيب المناسب لك من بين آلاف الأطباء المتخصصين",
      },
      {
        icon: MapPin,
        title: "موقع قريب",
        description: "اعثر على الأطباء القريبين من موقعك بسهولة",
      },
      {
        icon: Shield,
        title: "آمن وموثوق",
        description: "بياناتك محمية بأحدث تقنيات الأمان",
      },
    ],
    []
  );

  const handleNavigateToDoctors = useCallback(() => {
    navigate("/doctors");
  }, [navigate]);

  const handleNavigateToProfile = useCallback(() => {
    navigate("/profile");
  }, [navigate]);

  const handleNavigateToSignUp = useCallback(() => {
    navigate("/signup");
  }, [navigate]);

  const handleNavigateToSignIn = useCallback(() => {
    navigate("/signin");
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden pt-16">
        {/* Background Decorations */}
        <div className="absolute top-20 right-0 h-96 w-96 -translate-y-1/2 translate-x-1/2 rounded-full bg-gradient-to-br from-blue-400/20 to-indigo-400/20 blur-3xl"></div>
        <div className="absolute bottom-20 left-0 h-96 w-96 translate-y-1/2 -translate-x-1/2 rounded-full bg-gradient-to-tr from-indigo-400/20 to-purple-400/20 blur-3xl"></div>

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 px-4 py-2 mb-8">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-700">المنصة الطبية الأولى في المنطقة</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl font-black text-gray-900 sm:text-5xl md:text-6xl lg:text-7xl tracking-tight">
              العناية الصحية
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                بين يديك
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 sm:text-xl">
              تطبيق طبيبي يجمعك مع أفضل الأطباء في تخصصات مختلفة، احجز موعدك أو استشر طبيبك بكل سهولة
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={handleNavigateToDoctors}
                    className="group flex items-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 text-lg font-bold text-white shadow-xl shadow-blue-500/30 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/40"
                  >
                    <Stethoscope className="h-5 w-5 transition-transform group-hover:scale-110" />
                    ابحث عن طبيب
                  </button>
                  <button
                    onClick={handleNavigateToProfile}
                    className="group flex items-center gap-3 rounded-2xl border-2 border-gray-200 bg-white px-8 py-4 text-lg font-bold text-gray-700 shadow-lg transition-all hover:border-blue-300 hover:bg-blue-50 hover:shadow-xl"
                  >
                    <User className="h-5 w-5 text-blue-600 transition-transform group-hover:scale-110" />
                    ملفي الشخصي
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleNavigateToSignUp}
                    className="group flex items-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 text-lg font-bold text-white shadow-xl shadow-blue-500/30 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/40"
                  >
                    ابدأ الآن مجاناً
                    <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
                  </button>
                  <button
                    onClick={handleNavigateToSignIn}
                    className="flex items-center gap-3 rounded-2xl border-2 border-gray-200 bg-white px-8 py-4 text-lg font-bold text-gray-700 shadow-lg transition-all hover:border-blue-300 hover:bg-blue-50"
                  >
                    تسجيل الدخول
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Features Grid */}
          <div className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group rounded-3xl border border-gray-100 bg-white p-6 shadow-lg shadow-gray-100/50 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 group-hover:scale-110 transition-transform">
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="mt-4 text-xl font-bold text-gray-900">{feature.title}</h3>
                <p className="mt-2 text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Stats Section */}
          <div className="mt-20 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white shadow-2xl shadow-blue-500/30 sm:p-12">
            <div className="grid gap-8 sm:grid-cols-3">
              <div className="text-center">
                <p className="text-4xl font-black sm:text-5xl">+500</p>
                <p className="mt-2 text-blue-100">طبيب متخصص</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-black sm:text-5xl">+10K</p>
                <p className="mt-2 text-blue-100">مستخدم فعال</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-black sm:text-5xl">24/7</p>
                <p className="mt-2 text-blue-100">خدمة متواصلة</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white px-4 py-8 text-center sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-2">
          <HeartPulse className="h-5 w-5 text-red-500 fill-red-500" />
          <p className="text-gray-600">
            صنع <span className="font-semibold text-blue-600">بـ</span> لخدمة صحتك
          </p>
        </div>
        <p className="mt-2 text-sm text-gray-400">© 2025 طبيبي. جميع الحقوق محفوظة</p>
      </footer>
    </div>
  );
};

export default Home;
