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
import { useTranslation } from "react-i18next";

const features = [
  { icon: Search, key: "find" },
  { icon: CalendarCheck, key: "book" },
  { icon: Clock3, key: "save" },
  { icon: Video, key: "remote" },
  { icon: FileText, key: "follow" },
  { icon: ShieldCheck, key: "privacy" },
];

const steps = [
  { number: "01", key: "search", icon: Search },
  { number: "02", key: "time", icon: CalendarDays },
  { number: "03", key: "follow", icon: MonitorSmartphone },
];

const faqs = [
  "nearby",
  "edit",
  "protected",
  "account",
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
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => revealOnScroll(), []);

  const handleSearch = (event) => {
    event.preventDefault();
    const query = new URLSearchParams();
    if (searchTerm.trim()) query.set("q", searchTerm.trim());
    // Location text is kept for future geocoding support.
    // For now, we pass it as a query param that the Doctors page can use.
    if (location.trim()) query.set("location", location.trim());
    const suffix = query.toString();
    navigate(suffix ? `/doctors?${suffix}` : "/doctors");
  };

  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="home-shell home-hero__content">
          <div className="home-hero__copy reveal-on-scroll">
            <h1>{t("home.title")}</h1>
            <form className="home-doctolib-search" onSubmit={handleSearch}>
              <label>
                <Search aria-hidden="true" />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder={t("home.searchDoctor")}
                  aria-label={t("home.searchDoctorAria")}
                />
              </label>
              <label>
                <MapPin aria-hidden="true" />
                <input
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder={t("home.where")}
                  aria-label={t("home.whereAria")}
                />
              </label>
              <button type="submit">{t("home.search")} <ArrowLeft aria-hidden="true" /></button>
            </form>
          </div>

          <div className="home-hero__media reveal-on-scroll">
            <div className="home-hero__shape" />
            <img
              src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=900&q=85"
              alt={t("home.doctorImageAlt")}
            />
            <div className="home-hero__badge">
              <span><CalendarCheck /></span>
              <strong>{t("home.appointmentConfirmed")}</strong>
              <small>{t("home.careOnTime")}</small>
            </div>
          </div>
        </div>
        <div className="home-hero__curve" />
      </section>

      <section className="home-quick-links home-shell reveal-on-scroll" aria-label={t("home.healthInfo")}>
        <article>
          <div className="home-quick-links__icon"><Stethoscope /></div>
          <div><h2>{t("home.needDoctor")}</h2><p>{t("home.browseTrustedDoctors")}</p></div>
          <button type="button" onClick={() => navigate("/doctors")}>{t("home.findDoctor")} <ArrowLeft /></button>
        </article>
        <article>
          <div className="home-quick-links__icon"><HeartPulse /></div>
          <div><h2>{t("home.careForHealth")}</h2><p>{t("home.startBetterCare")}</p></div>
          <button type="button" onClick={() => navigate(isAuthenticated ? "/appointments" : "/signup")}>{t("home.startNow")} <ArrowLeft /></button>
        </article>
      </section>

      <section className="home-section home-section--features reveal-on-scroll">
        <div className="home-shell">
          <div className="home-section-heading">
             <span>{t("home.featuresLabel")}</span>
             <h2>{t("home.featuresTitle")}</h2>
             <p>{t("home.featuresText")}</p>
          </div>
          <div className="home-feature-grid">
             {features.map(({ icon, key }) => (
              <article className="home-feature" key={key}>
                <div className="home-feature__icon">{createElement(icon)}</div>
                <h3>{t(`home.feature.${key}.title`)}</h3>
                <p>{t(`home.feature.${key}.text`)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section home-section--steps reveal-on-scroll">
        <div className="home-shell">
          <div className="home-section-heading home-section-heading--center">
             <span>{t("home.stepsLabel")}</span>
             <h2>{t("home.stepsTitle")}</h2>
             <p>{t("home.stepsText")}</p>
          </div>
          <div className="home-steps">
             {steps.map(({ number, key, icon }, index) => (
               <article className="home-step" key={number}>
                <div className="home-step__number">{number}</div>
                <div className="home-step__icon">{createElement(icon)}</div>
                 <h3>{t(`home.step.${key}.title`)}</h3>
                 <p>{t(`home.step.${key}.text`)}</p>
                {index < steps.length - 1 && <span className="home-step__connector" />}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section home-section--showcase reveal-on-scroll">
        <div className="home-shell">
          <div className="home-section-heading">
             <span>{t("home.spaceLabel")}</span>
             <h2>{t("home.spaceTitle")}</h2>
             <p>{t("home.spaceText")}</p>
          </div>
          <div className="home-showcase__row">
            <div className="home-showcase__copy">
               <small>{t("home.showcaseOneSmall")}</small>
               <h3>{t("home.showcaseOneTitle")}</h3>
               <p>{t("home.showcaseOneText")}</p>
               <button type="button" onClick={() => navigate(isAuthenticated ? "/appointments" : "/signin")}>{t("home.showcaseOneButton")} <ArrowLeft /></button>
            </div>
            <div className="home-dashboard home-dashboard--appointments" aria-hidden="true">
              <div className="home-dashboard__top"><span /><span /><span /></div>
              <div className="home-dashboard__title"><i /><i /><i /></div>
              <div className="home-dashboard__table"><b /><b /><b /><b /><b /><b /><b /><b /></div>
            </div>
          </div>
          <div className="home-showcase__row home-showcase__row--reverse">
            <div className="home-showcase__copy">
               <small>{t("home.showcaseTwoSmall")}</small>
               <h3>{t("home.showcaseTwoTitle")}</h3>
               <p>{t("home.showcaseTwoText")}</p>
               <button type="button" onClick={() => navigate(isAuthenticated ? "/profile" : "/signup")}>{t("home.showcaseTwoButton")} <ArrowLeft /></button>
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
           <div><span>{t("home.proofLabel")}</span><h2>{t("home.proofTitle")}</h2></div>
           <div className="home-proof__metrics"><div><strong>+500</strong><small>{t("home.specializedDoctors")}</small></div><div><strong>+10K</strong><small>{t("home.usersWithUs")}</small></div><div><strong>24/7</strong><small>{t("home.availableExperience")}</small></div></div>
        </div>
      </section>

      <section className="home-section home-section--faq reveal-on-scroll">
        <div className="home-shell home-faq-layout">
           <div className="home-section-heading"><span>{t("home.faqLabel")}</span><h2>{t("home.faqTitle")}</h2><p>{t("home.faqText")}</p></div>
           <div className="home-faq-list">
             {faqs.map((key, index) => (
               <div className={openFaq === index ? "home-faq home-faq--open" : "home-faq"} key={key}>
                 <button type="button" onClick={() => setOpenFaq(openFaq === index ? -1 : index)} aria-expanded={openFaq === index}>
                   {t(`home.faq.${key}.question`)}<ChevronDown aria-hidden="true" />
                 </button>
                 {openFaq === index && <p>{t(`home.faq.${key}.answer`)}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="home-cta reveal-on-scroll">
        <div className="home-shell home-cta__inner">
           <div><span>{t("home.ctaLabel")}</span><h2>{isAuthenticated ? t("home.ctaReady") : t("home.ctaStart")}</h2></div>
           <button type="button" onClick={() => navigate(isAuthenticated ? "/doctors" : "/signup")}>{isAuthenticated ? t("home.ctaSearch") : t("home.ctaSignup")}<ArrowLeft /></button>
        </div>
      </section>

      <footer className="home-footer">
         <div className="home-shell"><strong>{t("header.brand")}</strong><span>{t("home.footerTagline")}</span><small>© 2026 {t("header.brand")}</small></div>
      </footer>
    </main>
  );
};

export default Home;
