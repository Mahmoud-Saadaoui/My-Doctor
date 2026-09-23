import { createElement, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarCheck,
  CalendarDays,
  ChevronDown,
  Clock3,
  FileText,
  HeartPulse,
  MapPin,
  MonitorSmartphone,
  Search,
  ShieldCheck,
  Stethoscope,
  UserRound,
  Video,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const features = [
  { icon: Search, title: "اعثر على طبيبك", text: "ابحث حسب التخصص أو الاسم أو المنطقة بكل سهولة." },
  { icon: CalendarCheck, title: "احجز موعدك", text: "اختر الموعد الذي يناسبك من بين الأوقات المتاحة." },
  { icon: Clock3, title: "وفّر وقتك", text: "لا مزيد من المكالمات أو الانتظار، كل شيء واضح أمامك." },
  { icon: Video, title: "استشر عن بعد", text: "تواصل مع طبيبك بالطريقة الأقرب إلى احتياجك." },
  { icon: FileText, title: "تابع مواعيدك", text: "احتفظ بكل تفاصيل مواعيدك في مساحة واحدة." },
  { icon: ShieldCheck, title: "خصوصية موثوقة", text: "تجربة صحية تحترم بياناتك في كل خطوة." },
];

const steps = [
  { number: "01", title: "ابحث عن الطبيب المناسب", text: "أدخل التخصص أو اسم الطبيب والمدينة لتظهر لك النتائج الأقرب.", icon: Search },
  { number: "02", title: "اختر الوقت المناسب", text: "استعرض الأيام والأوقات المتاحة واحجز في لحظات.", icon: CalendarDays },
  { number: "03", title: "تابع رحلتك الصحية", text: "راجع بياناتك ومواعيدك من لوحة بسيطة ومريحة.", icon: MonitorSmartphone },
];

const faqs = [
  ["كيف أجد طبيباً قريباً مني؟", "اكتب التخصص أو اسم الطبيب في حقل البحث، ثم اختر المدينة أو الحي لتظهر لك الخيارات المناسبة."],
  ["هل يمكنني تعديل موعدي؟", "نعم، يمكنك مراجعة تفاصيل مواعيدك من صفحة مواعيدي وتعديلها حسب الخيارات المتاحة."],
  ["هل بياناتي الصحية محمية؟", "نحرص على أن تبقى المعلومات التي تقدمها داخل تجربة واضحة ومحترمة لخصوصيتك."],
  ["هل أحتاج إلى حساب للحجز؟", "يمكنك البحث وتصفح الأطباء دون حساب، لكن يلزم تسجيل الدخول لتأكيد الموعد وحفظه."],
];

const revealOnScroll = () => {
  const elements = document.querySelectorAll(".reveal-on-scroll");
  if (!("IntersectionObserver" in window)) {
    elements.forEach((element) => element.classList.add("is-visible"));
    return undefined;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  elements.forEach((element) => observer.observe(element));
  return () => observer.disconnect();
};

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => revealOnScroll(), []);

  const handleSearch = (event) => {
    event.preventDefault();
    const query = new URLSearchParams();
    if (searchTerm.trim()) query.set("q", searchTerm.trim());
    if (location.trim()) query.set("location", location.trim());
    const suffix = query.toString();
    navigate(suffix ? `/doctors?${suffix}` : "/doctors");
  };

  return (
    <main className="home-page" dir="rtl">
      <section className="home-hero">
        <div className="home-shell home-hero__content">
          <div className="home-hero__copy reveal-on-scroll">
            <h1>عش حياة صحية أفضل</h1>
            <form className="home-doctolib-search" onSubmit={handleSearch}>
              <label>
                <Search aria-hidden="true" />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="اسم الطبيب، التخصص، المؤسسة..."
                  aria-label="اسم الطبيب أو التخصص"
                />
              </label>
              <label>
                <MapPin aria-hidden="true" />
                <input
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="أين؟"
                  aria-label="المدينة أو المكان"
                />
              </label>
              <button type="submit">ابحث <ArrowLeft aria-hidden="true" /></button>
            </form>
          </div>

          <div className="home-hero__media reveal-on-scroll">
            <div className="home-hero__shape" />
            <img
              src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=900&q=85"
              alt="طبيبة تستقبل مريضاً"
            />
            <div className="home-hero__badge">
              <span><CalendarCheck /></span>
              <strong>موعدك مؤكد</strong>
              <small>رعاية في الوقت المناسب</small>
            </div>
          </div>
        </div>
        <div className="home-hero__curve" />
      </section>

      <section className="home-quick-links home-shell reveal-on-scroll" aria-label="معلومات صحية">
        <article>
          <div className="home-quick-links__icon"><Stethoscope /></div>
          <div><h2>تحتاج إلى طبيب؟</h2><p>تصفح أطباء موثوقين في تخصصات مختلفة.</p></div>
          <button type="button" onClick={() => navigate("/doctors")}>اعثر على طبيب <ArrowLeft /></button>
        </article>
        <article>
          <div className="home-quick-links__icon"><HeartPulse /></div>
          <div><h2>اهتم بصحتك اليوم</h2><p>ابدأ بخطوة صغيرة نحو متابعة صحية أفضل.</p></div>
          <button type="button" onClick={() => navigate(isAuthenticated ? "/appointments" : "/signup")}>ابدأ الآن <ArrowLeft /></button>
        </article>
      </section>

      <section className="home-section home-section--features reveal-on-scroll">
        <div className="home-shell">
          <div className="home-section-heading">
            <span>كل ما تحتاجه في مكان واحد</span>
            <h2>طبيبي يساعدك في كل خطوة</h2>
            <p>من البحث الأول إلى متابعة موعدك، صممنا تجربة واضحة حول احتياجاتك.</p>
          </div>
          <div className="home-feature-grid">
            {features.map(({ icon, title, text }) => (
              <article className="home-feature" key={title}>
                <div className="home-feature__icon">{createElement(icon)}</div>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section home-section--steps reveal-on-scroll">
        <div className="home-shell">
          <div className="home-section-heading home-section-heading--center">
            <span>كيف تعمل المنصة؟</span>
            <h2>ثلاث خطوات وتبدأ رعايتك</h2>
            <p>لا تحتاج إلى خبرة تقنية، كل شيء مصمم ليكون مفهوماً من أول مرة.</p>
          </div>
          <div className="home-steps">
            {steps.map(({ number, title, text, icon }, index) => (
              <article className="home-step" key={number}>
                <div className="home-step__number">{number}</div>
                <div className="home-step__icon">{createElement(icon)}</div>
                <h3>{title}</h3>
                <p>{text}</p>
                {index < steps.length - 1 && <span className="home-step__connector" />}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section home-section--showcase reveal-on-scroll">
        <div className="home-shell">
          <div className="home-section-heading">
            <span>مساحتك الصحية</span>
            <h2>كل مواعيدك أمامك</h2>
            <p>لوحة بسيطة تساعدك على تنظيم مواعيدك والعودة إلى تفاصيلك متى احتجت.</p>
          </div>
          <div className="home-showcase__row">
            <div className="home-showcase__copy">
              <small>نظرة واحدة تكفي</small>
              <h3>رتب مواعيدك بدون تعقيد</h3>
              <p>اعرف موعدك القادم، الطبيب الذي ستقابله، وكل التفاصيل المهمة من شاشة واحدة.</p>
              <button type="button" onClick={() => navigate(isAuthenticated ? "/appointments" : "/signin")}>شاهد مواعيدك <ArrowLeft /></button>
            </div>
            <div className="home-dashboard home-dashboard--appointments" aria-hidden="true">
              <div className="home-dashboard__top"><span /><span /><span /></div>
              <div className="home-dashboard__title"><i /><i /><i /></div>
              <div className="home-dashboard__table"><b /><b /><b /><b /><b /><b /><b /><b /></div>
            </div>
          </div>
          <div className="home-showcase__row home-showcase__row--reverse">
            <div className="home-showcase__copy">
              <small>ملفك معك</small>
              <h3>بيانات واضحة، قرار أفضل</h3>
              <p>احتفظ بمعلوماتك الأساسية وسجل مواعيدك في تجربة هادئة وسهلة القراءة.</p>
              <button type="button" onClick={() => navigate(isAuthenticated ? "/profile" : "/signup")}>أنشئ ملفك <ArrowLeft /></button>
            </div>
            <div className="home-dashboard home-dashboard--profile" aria-hidden="true">
              <div className="home-dashboard__top"><span /><span /><span /></div>
              <div className="home-profile-mock"><div /><span><i /><i /><i /></span></div>
              <div className="home-profile-mock__rows"><b /><b /><b /></div>
            </div>
          </div>
        </div>
      </section>

      <section className="home-proof reveal-on-scroll">
        <div className="home-shell home-proof__inner">
          <div><span>اختيارك الصحي يستحق الأفضل</span><h2>رعاية أقرب، في كل يوم.</h2></div>
          <div className="home-proof__metrics"><div><strong>+500</strong><small>طبيب متخصص</small></div><div><strong>+10K</strong><small>مستخدم معنا</small></div><div><strong>24/7</strong><small>تجربة متاحة</small></div></div>
        </div>
      </section>

      <section className="home-section home-section--faq reveal-on-scroll">
        <div className="home-shell home-faq-layout">
          <div className="home-section-heading"><span>الأسئلة الشائعة</span><h2>هل لديك سؤال؟</h2><p>إجابات بسيطة على أكثر الأسئلة التي تهمك.</p></div>
          <div className="home-faq-list">
            {faqs.map(([question, answer], index) => (
              <div className={openFaq === index ? "home-faq home-faq--open" : "home-faq"} key={question}>
                <button type="button" onClick={() => setOpenFaq(openFaq === index ? -1 : index)} aria-expanded={openFaq === index}>
                  {question}<ChevronDown aria-hidden="true" />
                </button>
                {openFaq === index && <p>{answer}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="home-cta reveal-on-scroll">
        <div className="home-shell home-cta__inner">
          <div><span>خطوتك الأولى تبدأ هنا</span><h2>{isAuthenticated ? "جاهز لموعدك القادم؟" : "ابدأ رحلتك الصحية اليوم"}</h2></div>
          <button type="button" onClick={() => navigate(isAuthenticated ? "/doctors" : "/signup")}>{isAuthenticated ? "ابحث عن طبيب" : "إنشاء حساب"}<ArrowLeft /></button>
        </div>
      </section>

      <footer className="home-footer">
        <div className="home-shell"><strong>طبيبي</strong><span>رعاية صحية أقرب إليك</span><small>© 2026 طبيبي</small></div>
      </footer>
    </main>
  );
};

export default Home;
