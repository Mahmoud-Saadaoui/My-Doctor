import React from "react";
import { useTranslation } from "react-i18next";

const Loader = ({ loading, title }) => {
  const { t } = useTranslation();
  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 rounded-2xl bg-white p-8 shadow-2xl">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand border-t-transparent"></div>
        {(title || t("common.loading")) && (
          <p className="text-lg font-medium text-brand-deep">{title || t("common.loading")}</p>
        )}
      </div>
    </div>
  );
};

export default Loader;
