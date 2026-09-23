import React, { useCallback, memo } from "react";
import { ChevronLeft, Stethoscope } from "lucide-react";
import { transformName } from "../lib/helpers";

const DoctorCard = memo(({ doctor, onPress }) => {
  const handlePress = useCallback(() => {
    onPress(doctor.id);
  }, [doctor.id, onPress]);

  return (
    <button
      onClick={handlePress}
      className="group w-full rounded-2xl border border-mist bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
      dir="rtl"
    >
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand text-xl font-bold text-brand-deep shadow-lg shadow-brand/20">
          {transformName(doctor.name)}
        </div>

        {/* Info */}
        <div className="flex-1 text-right">
          <h3 className="text-lg font-bold text-brand-deep group-hover:text-brand transition-colors">
            {doctor.name}
          </h3>
          {doctor.profile?.specialization && (
            <div className="mt-1.5 flex items-center gap-1 text-sm text-brand/70">
              <Stethoscope className="h-3.5 w-3.5" />
              <span>{doctor.profile.specialization}</span>
            </div>
          )}
        </div>

        {/* Chevron */}
        <div className="shrink-0 text-brand/60 group-hover:text-brand transition-colors">
          <ChevronLeft className="h-6 w-6" />
        </div>
      </div>
    </button>
  );
});

DoctorCard.displayName = "DoctorCard";

export default DoctorCard;
