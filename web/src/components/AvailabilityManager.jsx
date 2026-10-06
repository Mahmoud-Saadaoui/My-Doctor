import React, { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Edit2, Check, X, Clock, Calendar } from "lucide-react";
import axios from "../lib/axios";
import { useTranslation } from "react-i18next";

const DAYS_OF_WEEK = [0, 1, 2, 3, 4, 5, 6];

const AvailabilityManager = () => {
  const { t } = useTranslation();
  const [availabilities, setAvailabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    dayOfWeek: 1,
    startTime: "09:00",
    endTime: "17:00",
    timezone: "Africa/Tunis",
  });
  const [saving, setSaving] = useState(false);

  const fetchAvailabilities = useCallback(async () => {
    try {
      const response = await axios.get("/doctors/me/availability");
      setAvailabilities(response.data);
    } catch (err) {
      setError(err.response?.data?.message || t("availability.loadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchAvailabilities();
  }, [fetchAvailabilities]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (editingId) {
        await axios.put(`/doctors/me/availability/${editingId}`, formData);
      } else {
        await axios.post("/doctors/me/availability", formData);
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({ dayOfWeek: 1, startTime: "09:00", endTime: "17:00", timezone: "Africa/Tunis" });
      await fetchAvailabilities();
    } catch (err) {
      setError(err.response?.data?.message || t("availability.saveError"));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (availability) => {
    setEditingId(availability.id);
    setFormData({
      dayOfWeek: availability.dayOfWeek,
      startTime: availability.startTime,
      endTime: availability.endTime,
      timezone: availability.timezone,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("availability.deleteConfirm"))) return;

    try {
      await axios.delete(`/doctors/me/availability/${id}`);
      await fetchAvailabilities();
    } catch (err) {
      setError(err.response?.data?.message || t("availability.deleteError"));
    }
  };

  const handleToggleActive = async (availability) => {
    try {
      await axios.patch(`/doctors/me/availability/${availability.id}`, {
        isActive: !availability.isActive,
      });
      await fetchAvailabilities();
    } catch (err) {
      setError(err.response?.data?.message || t("availability.updateError"));
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ dayOfWeek: 1, startTime: "09:00", endTime: "17:00", timezone: "Africa/Tunis" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-brand-deep">{t("availability.title")}</h2>
          <p className="text-sm text-brand/70">{t("availability.subtitle")}</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-xl bg-brand px-4 py-2 font-semibold text-white hover:bg-brand-deep transition-colors"
        >
          <Plus className="h-4 w-4" />
          {t("availability.addSlot")}
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl border-2 border-brand/20 bg-cream/70 p-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold text-brand-deep">
              {t("availability.dayOfWeek")}
              <select
                value={formData.dayOfWeek}
                onChange={(e) => setFormData({ ...formData, dayOfWeek: Number(e.target.value) })}
                className="mt-2 w-full rounded-xl border-2 border-mist bg-white px-4 py-3 font-normal outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              >
                {DAYS_OF_WEEK.map((day) => (
                  <option key={day} value={day}>
                    {t(`availability.days.${day}`)}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-semibold text-brand-deep">
              {t("availability.timezone")}
              <input
                type="text"
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                className="mt-2 w-full rounded-xl border-2 border-mist bg-white px-4 py-3 font-normal outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </label>

            <label className="text-sm font-semibold text-brand-deep">
              {t("availability.startTime")}
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="mt-2 w-full rounded-xl border-2 border-mist bg-white px-4 py-3 font-normal outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </label>

            <label className="text-sm font-semibold text-brand-deep">
              {t("availability.endTime")}
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="mt-2 w-full rounded-xl border-2 border-mist bg-white px-4 py-3 font-normal outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </label>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 font-semibold text-white hover:bg-brand-deep disabled:opacity-50 transition-colors"
            >
              <Check className="h-4 w-4" />
              {saving ? t("common.saving") : t("availability.save")}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex items-center gap-2 rounded-xl border-2 border-mist bg-white px-5 py-2.5 font-semibold text-brand-deep hover:bg-cream transition-colors"
            >
              <X className="h-4 w-4" />
              {t("availability.cancel")}
            </button>
          </div>
        </form>
      )}

      {/* Availability List */}
      {availabilities.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-mist bg-white p-12 text-center">
          <Calendar className="mx-auto h-12 w-12 text-brand/40" />
          <h3 className="mt-4 text-lg font-bold text-brand-deep">{t("availability.noSlots")}</h3>
          <p className="mt-2 text-sm text-brand/70">{t("availability.noSlotsHint")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {availabilities.map((availability) => (
            <div
              key={availability.id}
              className={`flex items-center justify-between rounded-2xl border-2 p-4 transition-colors ${
                availability.isActive
                  ? "border-brand/20 bg-white"
                  : "border-mist bg-cream/50 opacity-60"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                  availability.isActive ? "bg-brand text-white" : "bg-mist text-brand-deep"
                }`}>
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold text-brand-deep">
                    {t(`availability.days.${availability.dayOfWeek}`)}
                  </p>
                  <p className="text-sm text-brand/70">
                    {availability.startTime} - {availability.endTime}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleActive(availability)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    availability.isActive
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-mist text-brand-deep hover:bg-mist/80"
                  }`}
                >
                  {availability.isActive ? t("availability.active") : t("availability.inactive")}
                </button>
                <button
                  onClick={() => handleEdit(availability)}
                  className="rounded-lg bg-mist p-2 text-brand-deep hover:bg-mist/80 transition-colors"
                  aria-label={t("availability.edit")}
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(availability.id)}
                  className="rounded-lg bg-red-100 p-2 text-red-600 hover:bg-red-200 transition-colors"
                  aria-label={t("availability.delete")}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AvailabilityManager;
