import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form } from "formik";
import * as yup from "yup";
import { User, Lock, ArrowRight, LogIn, ArrowLeft } from "lucide-react";
import axios from "../lib/axios";
import { SIGNIN_URL } from "../lib/urls";
import { useAuth } from "../contexts/AuthContext";
import Loader from "../components/Loader";
import Alert from "../components/Alert";
import Input from "../components/Input";
import Button from "../components/Button";

const SignIn = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ visible: false, title: "", message: "", type: "alert" });

  const signInValidationSchema = yup.object().shape({
    email: yup.string().email("يجب إدخال بريد إلكتروني صحيح").required("البريد الإلكتروني مطلوب"),
    password: yup.string().required("يجب عليك إدخال كلمة مرور صالحة"),
  });

  const handleSignIn = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post(SIGNIN_URL, {
        email: values.email,
        password: values.password,
      });
      login(response.data.accessToken);
      navigate("/");
    } catch (e) {
      setAlert({
        visible: true,
        title: "تنبيه",
        message: e.response?.data?.message || "حدث خطأ أثناء تسجيل الدخول",
        type: "alert",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 pt-16">
      <Loader loading={loading} title="جاري تسجيل الدخول" />
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
          <div className="overflow-hidden rounded-3xl bg-white shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-10 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-white backdrop-blur-sm">
                <LogIn className="h-8 w-8" />
              </div>
              <h1 className="text-2xl font-black text-white">مرحباً بعودتك</h1>
              <p className="mt-2 text-blue-100">سجل دخولك للمتابعة</p>
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
                      label="البريد الإلكتروني"
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
                      label="كلمة المرور"
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
                        دخول
                        <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
                      </span>
                    </Button>
                  </Form>
                )}
              </Formik>

              {/* Footer */}
              <p className="mt-6 text-center text-gray-600">
                ليس لديك حساب؟{" "}
                <button
                  onClick={() => navigate("/signup")}
                  className="font-bold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  إنشاء حساب جديد
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
