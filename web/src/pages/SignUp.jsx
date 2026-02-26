import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form } from "formik";
import * as yup from "yup";
import { User, Mail, Lock, Phone, Clock, Stethoscope, UserPlus } from "lucide-react";
import axios from "../lib/axios";
import { SIGNUP_URL } from "../lib/urls";
import Loader from "../components/Loader";
import Alert from "../components/Alert";
import Input from "../components/Input";
import Button from "../components/Button";
import LocationPicker from "../components/LocationPicker";

const SignUp = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ visible: false, title: "", message: "", type: "alert" });

  const validationSchema = yup.object().shape({
    name: yup.string().required("اسم المستخدم مطلوب"),
    email: yup.string().email("يجب إدخال بريد إلكتروني صحيح").required("البريد الإلكتروني مطلوب"),
    password: yup.string().required("يجب عليك إدخال كلمة مرور صالحة").min(5, "يجب أن تكون كلمة المرور أكثر من خمسة محارف"),
    userType: yup.boolean(),
    specialization: yup.string().when("userType", {
      is: true,
      then: (schema) => schema.required("يجب عليك ادخال التخصص"),
    }),
    address: yup.string().when("userType", {
      is: true,
      then: (schema) => schema.required("يجب عليك تحديد العنوان من الخريطة"),
    }),
    phone: yup.string().when("userType", {
      is: true,
      then: (schema) => schema.required("يجب عليك إدخال رقم الهاتف"),
    }),
    workingHours: yup.string().when("userType", {
      is: true,
      then: (schema) => schema.required("يجب عليك إدخال ساعات العمل"),
    }),
  });

  const handleSignUp = async (values) => {
    setLoading(true);
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
        title: "تسجيل ناجح",
        message: "لقد قمت بتسجيل حساب بشكل صحيح ويمكنك الانتقال إلى صفحة تسجيل الدخول، هل تريد الانتقال إلى صفحة تسجيل الدخول؟",
        type: "question",
      });
    } catch (e) {
      setAlert({
        visible: true,
        title: "تنبيه",
        message: e.response?.data?.errors?.[0]?.message || "حدث خطأ أثناء التسجيل",
        type: "alert",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 pt-24">
      <Loader loading={loading} title="جاري إنشاء حساب جديد" />
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
        <div className="overflow-hidden rounded-3xl bg-white shadow-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-10 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-white backdrop-blur-sm">
              <UserPlus className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-black text-white">إنشاء حساب جديد</h1>
            <p className="mt-2 text-blue-100">انضم إلى مجتمع طبيبي</p>
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
              {({ handleChange, handleBlur, values, errors, touched, setFieldValue, isValid }) => (
                <Form className="space-y-5">
                  <Input
                    label="الاسم الكامل"
                    name="name"
                    placeholder="أدخل اسمك الكامل"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.name && errors.name}
                    icon={<User className="h-5 w-5" />}
                  />

                  <Input
                    label="البريد الإلكتروني"
                    name="email"
                    type="email"
                    placeholder="example@email.com"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.email && errors.email}
                    icon={<Mail className="h-5 w-5" />}
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

                  {/* User Type Checkbox */}
                  <div className="flex items-center gap-3 rounded-xl border-2 border-gray-200 bg-gray-50 p-4">
                    <input
                      type="checkbox"
                      id="userType"
                      checked={values.userType}
                      onChange={(e) => setFieldValue("userType", e.target.checked)}
                      className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="userType" className="flex cursor-pointer items-center gap-2 text-gray-700">
                      <Stethoscope className="h-5 w-5 text-blue-600" />
                      <span className="font-semibold">أنا طبيب</span>
                    </label>
                  </div>

                  {/* Doctor Fields */}
                  {values.userType && (
                    <div className="space-y-5 rounded-2xl border-2 border-blue-100 bg-blue-50/50 p-5">
                      <p className="text-lg font-bold text-blue-900">معلومات الطبيب</p>

                      <Input
                        label="التخصص"
                        name="specialization"
                        placeholder="مثال: قلبية، عامة..."
                        value={values.specialization}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.specialization && errors.specialization}
                        icon={<Stethoscope className="h-5 w-5" />}
                      />

                      <Input
                        label="ساعات العمل"
                        name="workingHours"
                        placeholder="مثال: 9 صباحاً - 5 مساءً"
                        value={values.workingHours}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.workingHours && errors.workingHours}
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

                      {/* Hidden input for address (filled by LocationPicker) */}
                      <input
                        type="hidden"
                        name="address"
                        value={values.address}
                        onChange={handleChange}
                      />
                      {errors.address && touched.address && (
                        <p className="text-right text-sm text-red-500">{errors.address}</p>
                      )}

                      {/* Display selected address */}
                      {values.address && (
                        <div className="rounded-xl bg-green-50 p-4">
                          <p className="text-sm font-medium text-green-700">العنوان المحدد:</p>
                          <p className="mt-1 text-sm text-green-600">{values.address}</p>
                        </div>
                      )}

                      <Input
                        label="رقم الهاتف"
                        name="phone"
                        placeholder="أدخل رقم الهاتف"
                        value={values.phone}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.phone && errors.phone}
                        icon={<Phone className="h-5 w-5" />}
                      />
                    </div>
                  )}

                  <Button type="primary" fullWidth disabled={!isValid} className="mt-6">
                    إنشاء حساب
                  </Button>
                </Form>
              )}
            </Formik>

            {/* Footer */}
            <p className="mt-6 text-center text-gray-600">
              لديك حساب بالفعل؟{" "}
              <button
                onClick={() => navigate("/signin")}
                className="font-bold text-blue-600 hover:text-blue-700 hover:underline"
              >
                تسجيل الدخول
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
