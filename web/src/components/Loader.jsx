import React from "react";

const Loader = ({ loading, title = "جاري التحميل..." }) => {
  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 rounded-2xl bg-white p-8 shadow-2xl">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
        {title && (
          <p className="text-lg font-medium text-gray-700">{title}</p>
        )}
      </div>
    </div>
  );
};

export default Loader;
