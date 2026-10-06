import { useTranslation } from "react-i18next";

const Privacy = () => {
  const { t } = useTranslation();

  return (
    <main className="min-h-screen bg-cream pt-20 pb-16">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-brand mb-8">{t("privacy.title")}</h1>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-brand mb-3">{t("privacy.section1.title")}</h2>
          <p className="text-gray-700 leading-relaxed">{t("privacy.section1.content")}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-brand mb-3">{t("privacy.section2.title")}</h2>
          <p className="text-gray-700 leading-relaxed">{t("privacy.section2.content")}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-brand mb-3">{t("privacy.section3.title")}</h2>
          <p className="text-gray-700 leading-relaxed">{t("privacy.section3.content")}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-brand mb-3">{t("privacy.section4.title")}</h2>
          <p className="text-gray-700 leading-relaxed">{t("privacy.section4.content")}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-brand mb-3">{t("privacy.section5.title")}</h2>
          <p className="text-gray-700 leading-relaxed">{t("privacy.section5.content")}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-brand mb-3">{t("privacy.section6.title")}</h2>
          <p className="text-gray-700 leading-relaxed">{t("privacy.section6.content")}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-brand mb-3">{t("privacy.section7.title")}</h2>
          <p className="text-gray-700 leading-relaxed">{t("privacy.section7.content")}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-brand mb-3">{t("privacy.section8.title")}</h2>
          <p className="text-gray-700 leading-relaxed">{t("privacy.section8.content")}</p>
        </section>

        <p className="text-sm text-gray-500 mt-12">{t("privacy.lastUpdated")}</p>
      </div>
    </main>
  );
};

export default Privacy;
