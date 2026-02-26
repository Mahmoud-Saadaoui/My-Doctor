import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form } from "formik";
import * as yup from "yup";
import { User, Mail, Lock, Phone, Clock, Stethoscope, ArrowRight, Edit, ArrowLeft } from "lucide-react";
import axios from "../lib/axios";
import { PROFILE_URL, UPDATE_PROFILE_URL } from "../lib/urls";
import Loader from "../components/Loader";
import Alert from "../components/Alert";
import Input from "../components/Input";
import Button from "../components/Button";
import LocationPicker from "../components/LocationPicker";

const UpdateProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [alert, setAlert] = useState({ visible: false, title: "", message: "", type: "alert" });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await axios.get(PROFILE_URL);
      setUser(response.data);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const validationSchema = yup.object().shape({
    name: yup.string().required("اسم المستخدم مطلوب"),
    password: yup.string().min(5, "يجب أن تكون كلمة المرور أكثر من خمسة محارف"),
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

  const handleUpdate = async (values) => {
    setLoading(true);
    try {
      const body = {
        name: values.name,
        password: values.password || undefined,
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

      await axios.put(UPDATE_PROFILE_URL, body);
      setAlert({
        visible: true,
        title: "تم بنجاح!",
        message: "تم تعديل حسابك بنجاح",
        type: "success",
      });
    } catch (e) {
      setAlert({
        visible: true,
        title: "خطأ!",
        message: e.response?.data?.errors?.[0]?.message || "حدث خطأ أثناء التحديث",
        type: "alert",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 pt-24 pb-8">
      <Alert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ ...alert, visible: false })}
      />
      <Loader loading={loading} title="جاري تحديث البيانات" />

      {user && (
        <div className="mx-auto max-w-2xl px-4">
          {/* Page Title */}
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg">
              <Edit className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-black text-gray-900">تعديل البيانات الشخصية</h1>
            <p className="mt-2 text-gray-600">حدث معلوماتك الشخصية</p>
          </div>

          {/* Card */}
          <div className="overflow-hidden rounded-3xl bg-white shadow-2xl">
            {/* Form */}
            <div className="p-6 sm:p-8">
              <Formik
                initialValues={{
                  name: user.name || "",
                  email: user.email || "",
                  password: "",
                  userType: user.userType === "doctor",
                  specialization: user.profile?.specialization || "",
                  address: user.profile?.address || "",
                  phone: user.profile?.phone || "",
                  workingHours: user.profile?.workingHours || "",
                  latitude: user.latitude || null,
                  longitude: user.longitude || null,
                }}
                validationSchema={validationSchema}
                onSubmit={handleUpdate}
                enableReinitialize
              >
                {({ handleChange, handleBlur, values, errors, touched, isValid, setFieldValue }) => (
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
                      disabled
                      icon={<Mail className="h-5 w-5" />}
                    />

                    <Input
                      label="كلمة المرور الجديدة (اختياري)"
                      name="password"
                      type="password"
                      placeholder="اتركه فارغاً إذا لم تريد تغييره"
                      value={values.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.password && errors.password}
                      icon={<Lock className="h-5 w-5" />}
                    />

                    <div className="flex items-center gap-3 rounded-xl border-2 border-gray-200 bg-gray-50 p-4">
                      <input
                        type="checkbox"
                        id="userType"
                        checked={values.userType}
                        disabled
                        className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="userType" className="flex cursor-pointer items-center gap-2 text-gray-700">
                        <Stethoscope className="h-5 w-5 text-blue-600" />
                        <span className="font-semibold">نوع الحساب: {values.userType ? "طبيب" : "مستخدم عادي"}</span>
                      </label>
                    </div>

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
                      <span className="flex items-center justify-center gap-2">
                        حفظ التغييرات
                        <ArrowLeft className="h-5 w-5" />
                      </span>
                    </Button>
                  </Form>
                )}
              </Formik>

              {/* Footer */}
              <div className="mt-6">
                <button
                  onClick={() => navigate("/profile")}
                  className="w-full rounded-2xl border-2 border-gray-200 py-3.5 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                >
                  عودة إلى الملف الشخصي
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdateProfile;
