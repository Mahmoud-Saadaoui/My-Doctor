import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form } from "formik";
import * as yup from "yup";
import { AlertCircle, User, Mail, Lock, Phone, Clock, MapPin, Stethoscope, UserPlus } from "lucide-react";
import axios from "../lib/axios";
import { SIGNUP_URL } from "../lib/urls";
import Loader from "../components/Loader";
import Alert from "../components/Alert";
import Input from "../components/Input";
import Button from "../components/Button";
import LocationPicker from "../components/LocationPicker";
import { useTranslation } from "react-i18next";

const getSignupError = (error, t) => {
  const response = error.response?.data;
  const fieldErrors = {};

  response?.errors?.forEach(({ field, message, messageKey }) => {
    fieldErrors[field] = message || (messageKey ? t(messageKey) : t("auth.genericSignupError"));
  });

  if (error.response?.status === 409) {
    fieldErrors.email = response?.message || t("auth.emailAlreadyUsed");
  }

  return {
    fieldErrors,
    formError: Object.keys(fieldErrors).length === 0
      ? response?.message || t("auth.genericSignupError")
      : "",
  };
};

const SignUp = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ visible: false, title: "", message: "", type: "alert" });
  const [submitError, setSubmitError] = useState("");
  const [serverErrors, setServerErrors] = useState({});
  const [consent, setConsent] = useState(false);

  const validationSchema = yup.object().shape({
    name: yup.string().required(t("validation.nameRequired")),
    email: yup.string().email(t("validation.email")).required(t("validation.emailRequired")),
    password: yup.string().required(t("validation.passwordRequired")).min(8, t("validation.passwordMin")),
    userType: yup.boolean(),
    specialization: yup.string().when("userType", {
      is: true,
      then: (schema) => schema.required(t("validation.specializationRequired")),
    }),
    address: yup.string().when("userType", {
      is: true,
      then: (schema) => schema.required(t("validation.addressRequired")),
    }),
    phone: yup.string().when("userType", {
      is: true,
      then: (schema) => schema.required(t("validation.phoneRequired")),
    }),
    workingHours: yup.string().when("userType", {
      is: true,
      then: (schema) => schema.required(t("validation.workingHoursRequired")),
    }),
  });

  const handleSignUp = async (values) => {
    setLoading(true);
    setSubmitError("");
    setServerErrors({});
    try {
      const body = {
        name: values.name,
        email: values.email,
        password: values.password,
        userType: values.userType ? "doctor" : "normal",
        ...(values.userType && {
          specialization: values.specialization,
          address: values.address,
          phone: values.phone,
          workingHours: values.workingHours,
          location: {
            latitude: values.latitude || null,
            longitude: values.longitude || null,
          },
        }),
      };

      await axios.post(SIGNUP_URL, body);
      setAlert({
        visible: true,
        title: t("auth.signupSuccessTitle"),
        message: t("auth.signupSuccessMessage"),
        type: "question",
      });
    } catch (e) {
      const { fieldErrors, formError } = getSignupError(e, t);
      setServerErrors(fieldErrors);
      setSubmitError(formError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream py-8 pt-24">
      <Loader loading={loading} title={t("auth.signupLoading")} />
      <Alert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ ...alert, visible: false })}
        onClick={() => navigate("/signin")}
      />

      <div className="mx-auto max-w-2xl px-4">
        {/* Card */}
        <div className="overflow-hidden rounded-3xl border border-mist bg-white shadow-lg">
          {/* Header */}
          <div className="border-b border-mist bg-white px-8 py-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky text-brand-deep">
              <UserPlus className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-black text-brand-deep">{t("auth.signupTitle")}</h1>
          </div>

          {/* Form */}
          <div className="p-6 sm:p-8">
            <Formik
              initialValues={{
                name: "",
                email: "",
                password: "",
                userType: false,
                specialization: "",
                address: "",
                phone: "",
                workingHours: "",
                latitude: null,
                longitude: null,
              }}
              validationSchema={validationSchema}
              onSubmit={handleSignUp}
              >
              {({ handleChange, handleBlur, values, errors, touched, setFieldValue, isValid }) => {
                const handleFieldChange = (event) => {
                  handleChange(event);
                  setSubmitError("");
                  setServerErrors((currentErrors) => {
                    if (!currentErrors[event.target.name]) return currentErrors;
                    const nextErrors = { ...currentErrors };
                    delete nextErrors[event.target.name];
                    return nextErrors;
                  });
                };

                return (
                  <Form className="space-y-5">
                    {submitError && (
                      <div
                        className="flex items-start gap-3 rounded-2xl border border-[#f1b6b6] bg-[#fff4f4] px-4 py-3 text-start text-sm text-[#9f3030]"
                        role="alert"
                        aria-live="polite"
                      >
                        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                        <p>{submitError}</p>
                      </div>
                    )}

                  <Input
                    label={t("auth.fullName")}
                    name="name"
                    placeholder={t("auth.namePlaceholder")}
                    value={values.name}
                    onChange={handleFieldChange}
                    onBlur={handleBlur}
                    error={serverErrors.name || (touched.name && errors.name)}
                    icon={<User className="h-5 w-5" />}
                  />

                  <Input
                    label={t("auth.email")}
                    name="email"
                    type="email"
                    placeholder="example@email.com"
                    value={values.email}
                    onChange={handleFieldChange}
                    onBlur={handleBlur}
                    error={serverErrors.email || (touched.email && errors.email)}
                    icon={<Mail className="h-5 w-5" />}
                  />

                  <Input
                    label={t("auth.password")}
                    name="password"
                    type="password"
                    placeholder={t("auth.passwordPlaceholder")}
                    value={values.password}
                    onChange={handleFieldChange}
                    onBlur={handleBlur}
                    error={serverErrors.password || (touched.password && errors.password)}
                    icon={<Lock className="h-5 w-5" />}
                  />

                  {/* User Type Checkbox */}
                  <div className="flex items-center gap-3 rounded-xl border-2 border-mist bg-cream p-4">
                    <input
                      type="checkbox"
                      id="userType"
                      checked={values.userType}
                      onChange={(e) => setFieldValue("userType", e.target.checked)}
                      className="h-5 w-5 rounded border-brand/40 text-brand focus:ring-brand"
                    />
                    <label htmlFor="userType" className="flex cursor-pointer items-center gap-2 text-brand-deep">
                      <Stethoscope className="h-5 w-5 text-brand" />
                      <span className="font-semibold">{t("auth.doctorAccount")}</span>
                    </label>
                  </div>

                  {/* Doctor Fields */}
                  {values.userType && (
                    <div className="space-y-5 rounded-2xl border-2 border-brand/20 bg-cream/70 p-5">
                      <p className="text-lg font-bold text-brand-deep">{t("auth.doctorInformation")}</p>

                      <Input
                        label={t("auth.specialization")}
                        name="specialization"
                        placeholder={t("auth.specializationPlaceholder")}
                        value={values.specialization}
                        onChange={handleFieldChange}
                        onBlur={handleBlur}
                        error={serverErrors.specialization || (touched.specialization && errors.specialization)}
                        icon={<Stethoscope className="h-5 w-5" />}
                      />

                      <Input
                        label={t("auth.workingHours")}
                        name="workingHours"
                        placeholder={t("auth.workingHoursPlaceholder")}
                        value={values.workingHours}
                        onChange={handleFieldChange}
                        onBlur={handleBlur}
                        error={serverErrors.workingHours || (touched.workingHours && errors.workingHours)}
                        icon={<Clock className="h-5 w-5" />}
                      />

                      {/* Location Picker with Map */}
                      <LocationPicker
                        latitude={values.latitude}
                        longitude={values.longitude}
                        onLocationChange={(lat, lng) => {
                          setFieldValue("latitude", lat);
                          setFieldValue("longitude", lng);
                        }}
                        onAddressChange={(address) => {
                          setFieldValue("address", address);
                        }}
                      />

                      <Input
                        label={t("auth.clinicAddress")}
                        name="address"
                        placeholder={t("auth.clinicAddressPlaceholder")}
                        value={values.address}
                        onChange={handleFieldChange}
                        onBlur={handleBlur}
                        error={serverErrors.address || (touched.address && errors.address)}
                        icon={<MapPin className="h-5 w-5" />}
                      />

                      {/* Display selected address */}
                      {values.address && (
                        <div className="rounded-xl bg-mist p-4">
                          <p className="text-sm font-medium text-brand-deep">{t("auth.selectedAddress")}</p>
                          <p className="mt-1 text-sm text-brand">{values.address}</p>
                        </div>
                      )}

                      <Input
                        label={t("auth.phone")}
                        name="phone"
                        placeholder={t("auth.phonePlaceholder")}
                        value={values.phone}
                        onChange={handleFieldChange}
                        onBlur={handleBlur}
                        error={serverErrors.phone || (touched.phone && errors.phone)}
                        icon={<Phone className="h-5 w-5" />}
                      />
                    </div>
                  )}

                  {/* Consent Checkbox */}
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="consent"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="mt-1 h-5 w-5 rounded border-brand/40 text-brand focus:ring-brand"
                    />
                    <label htmlFor="consent" className="text-sm text-brand-deep/80">
                      {t("auth.consentText")}{" "}
                      <a href="/terms" className="text-brand hover:underline">{t("auth.termsLink")}</a>
                      {" "}{t("auth.and")}{" "}
                      <a href="/privacy" className="text-brand hover:underline">{t("auth.privacyLink")}</a>
                    </label>
                  </div>

                  <Button type="primary" fullWidth disabled={!isValid || !consent} className="mt-6">
                    {t("auth.signupButton")}
                  </Button>
                  </Form>
                );
              }}
            </Formik>

            {/* Footer */}
            <p className="mt-6 text-center text-brand-deep/80">
              {t("auth.hasAccount")} {" "}
              <button
                onClick={() => navigate("/signin")}
                className="font-bold text-brand hover:text-brand-deep hover:underline"
              >
                {t("auth.loginHere")}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
