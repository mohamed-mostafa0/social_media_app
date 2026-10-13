"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FiMail, FiLock, FiUser, FiPhone } from "react-icons/fi";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { authService } from "@/features/auth/api/auth.service";
import { RegisterPayload } from "@/features/auth/types/auth.types";
import { useFormik } from "formik";
import { isAxiosError } from "axios";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  const formik = useFormik<RegisterPayload>({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      gender: "male",
      phoneNumber: "",
    },
    onSubmit: async (values, { setSubmitting }) => {
      setError("");
      try {
        await authService.register(values);
        router.push("/login");
      } catch (err: unknown) {
        if (isAxiosError(err)) {
          setError(err.response?.data?.message || err.message || "Something went wrong");
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Something went wrong");
        }
      } finally {
        setSubmitting(false);
      }
    }
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 my-8"
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Create an account</h1>
        <p className="text-sm text-gray-500">Enter your details to get started.</p>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100 text-center">
          {error}
        </div>
      )}

      <form onSubmit={formik.handleSubmit} className="space-y-4">
        <div className="flex gap-4">
          <Input
            label="First Name"
            name="firstName"
            placeholder="John"
            value={formik.values.firstName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            icon={<FiUser className="w-4 h-4" />}
            required
          />
          <Input
            label="Last Name"
            name="lastName"
            placeholder="Doe"
            value={formik.values.lastName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            icon={<FiUser className="w-4 h-4" />}
            required
          />
        </div>

        <Input
          label="Email address"
          type="email"
          name="email"
          placeholder="john@example.com"
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          icon={<FiMail className="w-4 h-4" />}
          required
        />
        
        <Input
          label="Password"
          type="password"
          name="password"
          placeholder="••••••••"
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          icon={<FiLock className="w-4 h-4" />}
          required
        />

        <div className="flex gap-4">
          <Input
            label="Phone Number"
            type="tel"
            name="phoneNumber"
            placeholder="+1 234 567 890"
            value={formik.values.phoneNumber}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            icon={<FiPhone className="w-4 h-4" />}
            required
          />
          
          <div className="w-full">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Gender
            </label>
            <div className="relative">
              <select
                name="gender"
                value={formik.values.gender}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 px-4 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors appearance-none"
                required
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full py-3 cursor-pointer text-sm mt-6 shadow-lg shadow-blue-500/30"
          disabled={formik.isSubmitting}
        >
          {formik.isSubmitting ? "Creating account..." : "Sign up"}
        </Button>
      </form>

      <p className="text-center text-sm text-gray-600 mt-8 font-medium">
        Already have an account?{" "}
        <Link href="/login" className="text-blue-600 hover:text-blue-700 font-bold">
          Sign in
        </Link>
      </p>
    </motion.div>
  );
}
