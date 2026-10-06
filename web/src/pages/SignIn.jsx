import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form } from "formik";
import * as yup from "yup";
import { User, Lock, ArrowRight, LogIn, ArrowLeft, Mail } from "lucide-react";
import axios from "../lib/axios";
import { SIGNIN_URL } from "../lib/urls";
import { useAuth } from "../contexts/AuthContext";
import Loader from "../components/Loader";
import Alert from "../components/Alert";
import Input from "../components/Input";
import Button from "../components/Button";
import { useTranslation } from "react-i18next";

const SignIn = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ visible: false, title: "", message: "", type: "alert" });
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const signInValidationSchema = yup.object().shape({
    email: yup.string().email(t("validation.email")).required(t("validation.emailRequired")),
    password: yup.string().required(t("validation.passwordRequired")),
  });

  const handleSignIn = async (values) => {
    setLoading(true);
    setEmailNotVerified(false);
    try {
      const response = await axios.post(SIGNIN_URL, {
        email: values.email,
        password: values.password,
      });
      login(response.data.accessToken);
      navigate("/");
    } catch (error) {
      const isEmailNotVerified = error.response?.data?.messageKey === "auth.emailNotVerified";
      setEmailNotVerified(isEmailNotVerified);
      setAlert({
        visible: true,
        title: t("auth.alert"),
        message: error.response?.data?.message || t("auth.signinError"),
        type: "alert",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResendLoading(true);
    try {
      await axios.post("/account/resend-verification", { email: alert.email });
      setAlert({
        visible: true,
        title: t("common.success"),
        message: t("auth.verificationEmailSent"),
        type: "success",
      });
    } catch {
      // Silently fail - don't reveal if email exists
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream pt-16">
      <Loader loading={loading} title={t("auth.signinLoading")} />
      <Alert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ ...alert, visible: false })}
      />

      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="overflow-hidden rounded-3xl border border-mist bg-white shadow-lg">
            {/* Header */}
            <div className="border-b border-mist bg-white px-8 py-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky text-brand-deep">
                <LogIn className="h-8 w-8" />
              </div>
              <h1 className="text-2xl font-black text-brand-deep">{t("auth.signinTitle")}</h1>
            </div>

            {/* Form */}
            <div className="p-8">
              <Formik
                initialValues={{ email: "", password: "" }}
                validationSchema={signInValidationSchema}
                onSubmit={handleSignIn}
              >
                {({ handleChange, handleBlur, values, errors, touched, isValid }) => (
                  <Form className="space-y-5">
                    <Input
                      label={t("auth.email")}
                      name="email"
                      type="email"
                      placeholder="example@email.com"
                      value={values.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.email && errors.email}
                      icon={<User className="h-5 w-5" />}
                    />

                    <Input
                      label={t("auth.password")}
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      value={values.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.password && errors.password}
                      icon={<Lock className="h-5 w-5" />}
                    />

                    <Button
                      type="primary"
                      fullWidth
                      disabled={!isValid}
                      className="group mt-6"
                    >
                      <span className="flex items-center justify-center gap-2">
                        {t("auth.signinButton")}
                        <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
                      </span>
                    </Button>

                    {emailNotVerified && (
                      <button
                        type="button"
                        onClick={handleResendVerification}
                        disabled={resendLoading}
                        className="mt-3 flex w-full items-center justify-center gap-2 text-sm font-semibold text-brand hover:text-brand-deep disabled:opacity-50"
                      >
                        <Mail className="h-4 w-4" />
                        {resendLoading ? t("common.loading") : t("auth.resendVerification")}
                      </button>
                    )}
                  </Form>
                )}
              </Formik>

              {/* Footer */}
              <div className="mt-6 space-y-3 text-center">
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-sm font-semibold text-brand hover:text-brand-deep hover:underline"
                >
                  {t("auth.forgotPassword")}
                </button>
                <p className="text-brand-deep/80">
                  {t("auth.noAccount")} {" "}
                  <button
                    onClick={() => navigate("/signup")}
                    className="font-bold text-brand hover:text-brand-deep hover:underline"
                  >
                    {t("auth.createNewAccount")}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
