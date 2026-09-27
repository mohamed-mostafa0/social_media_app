"use client";

import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiX,
  FiUser,
  FiMapPin,
  FiBookOpen,
  FiShare2,
  FiPlus,
  FiTrash2,
  FiLoader,
  FiAlertCircle,
} from "react-icons/fi";
import { useEscapeKey, useLockBodyScroll } from "@/hooks";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { useUpdateProfile } from "../hooks/useUpdateProfile";
import { UserSocialLink } from "@/types/user.types";
import {
  validateProfileForm,
  buildUpdateProfilePayload,
  extractBackendErrors,
  ProfileValidationErrors,
} from "../validators/profile.validator";

export type TabType = "general" | "location" | "education" | "socials";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: TabType;
}

export function EditProfileModal({ isOpen, onClose, initialTab = "general" }: EditProfileModalProps) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const user = useAuthStore((state) => state.user);
  const { mutate: updateProfile, isPending } = useUpdateProfile();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [backendErrors, setBackendErrors] = useState<ProfileValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [touchedAll, setTouchedAll] = useState(false);

  // Form Fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [dob, setDob] = useState("");

  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [governrate, setGovernrate] = useState("");
  const [street, setStreet] = useState("");

  const [university, setUniversity] = useState("");
  const [college, setCollege] = useState("");
  const [major, setMajor] = useState("");
  const [graduationYear, setGraduationYear] = useState<string>("");

  const [socialLinks, setSocialLinks] = useState<UserSocialLink[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setPhoneNumber(user.phoneNumber || "");
      setGender(user.gender === "female" ? "female" : "male");
      setDob(user.DOB ? user.DOB.substring(0, 10) : "");

      setCountry(user.location?.country || "");
      setCity(user.location?.city || "");
      setGovernrate(user.location?.governrate || "");
      setStreet(user.location?.street || "");

      setUniversity(user.education?.university || "");
      setCollege(user.education?.college || "");
      setMajor(user.education?.major || "");
      setGraduationYear(user.education?.graduationYear ? String(user.education.graduationYear) : "");

      setSocialLinks(user.socialLinks?.length ? [...user.socialLinks] : []);
      setErrorMessage(null);
      setBackendErrors({});
      setTouched({});
      setTouchedAll(false);
      setActiveTab(initialTab);
    }
  }, [isOpen, user, initialTab]);

  useEscapeKey(onClose, isOpen);
  useLockBodyScroll(isOpen);

  const formValues = useMemo(
    () => ({
      firstName,
      lastName,
      phoneNumber,
      gender,
      dob,
      country,
      city,
      governrate,
      street,
      university,
      college,
      major,
      graduationYear,
      socialLinks,
    }),
    [
      firstName,
      lastName,
      phoneNumber,
      gender,
      dob,
      country,
      city,
      governrate,
      street,
      university,
      college,
      major,
      graduationYear,
      socialLinks,
    ]
  );

  const validation = useMemo(() => validateProfileForm(formValues), [formValues]);

  const activeErrors: ProfileValidationErrors = useMemo(() => {
    return {
      ...backendErrors,
      ...validation.errors,
      socialLinks: {
        ...(backendErrors.socialLinks || {}),
        ...(validation.errors.socialLinks || {}),
      },
    };
  }, [backendErrors, validation.errors]);

  const tabErrors = useMemo(() => {
    if (!touchedAll) {
      let general = 0;
      if (touched.firstName && activeErrors.firstName) general++;
      if (touched.lastName && activeErrors.lastName) general++;
      if (touched.phoneNumber && activeErrors.phoneNumber) general++;
      if (touched.gender && activeErrors.gender) general++;
      if (touched.dob && activeErrors.dob) general++;

      let location = 0;
      if (touched.country && activeErrors.country) location++;
      if (touched.city && activeErrors.city) location++;
      if (touched.governrate && activeErrors.governrate) location++;
      if (touched.street && activeErrors.street) location++;

      let education = 0;
      if (touched.university && activeErrors.university) education++;
      if (touched.college && activeErrors.college) education++;
      if (touched.major && activeErrors.major) education++;
      if (touched.graduationYear && activeErrors.graduationYear) education++;

      let socials = 0;
      if (activeErrors.socialLinks) {
        Object.keys(activeErrors.socialLinks).forEach((idx) => {
          if (touched[`social_${idx}`]) socials++;
        });
      }

      return { general, location, education, socials };
    }
    return validation.tabErrors;
  }, [touchedAll, touched, activeErrors, validation.tabErrors]);

  if (!mounted || !isOpen) return null;

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  type SimpleFieldKey = Exclude<keyof ProfileValidationErrors, "socialLinks">;

  const clearBackendError = (field: SimpleFieldKey) => {
    if (backendErrors[field]) {
      setBackendErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const handleAddSocialLink = () => {
    setSocialLinks((prev) => [...prev, { platformName: "", link: "" }]);
  };

  const handleRemoveSocialLink = (index: number) => {
    setSocialLinks((prev) => prev.filter((_, i) => i !== index));
    setTouched((prev) => {
      const updated = { ...prev };
      delete updated[`social_${index}`];
      return updated;
    });
  };

  const handleSocialLinkChange = (index: number, field: "platformName" | "link", val: string) => {
    setSocialLinks((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: val };
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validation.isValid) {
      setTouchedAll(true);
      setErrorMessage("Please correct the highlighted errors before saving.");
      if (validation.firstErrorTab) {
        setActiveTab(validation.firstErrorTab);
      }
      return;
    }

    const payload = buildUpdateProfilePayload(formValues);

    updateProfile(payload, {
      onSuccess: () => {
        onClose();
      },
      onError: (err: any) => {
        const { message, fieldErrors, firstErrorTab } = extractBackendErrors(err);
        setErrorMessage(message);
        if (Object.keys(fieldErrors).length > 0) {
          setBackendErrors(fieldErrors);
          setTouchedAll(true);
          if (firstErrorTab) {
            setActiveTab(firstErrorTab);
          }
        }
      },
    });
  };

  const isFieldInvalid = (fieldName: SimpleFieldKey): boolean => {
    const isTouched = touched[fieldName] || touchedAll;
    return Boolean(isTouched && activeErrors[fieldName]);
  };

  const getFieldError = (fieldName: SimpleFieldKey): string | undefined => {
    const isTouched = touched[fieldName] || touchedAll;
    const err = activeErrors[fieldName];
    return isTouched && typeof err === "string" ? err : undefined;
  };

  const getInputClasses = (hasError: boolean) =>
    `w-full px-3.5 py-2.5 rounded-xl text-sm transition-colors focus:outline-none ${
      hasError
        ? "bg-red-50/30 border border-red-400 text-gray-900 focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
        : "bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
    }`;

  const tabs: { key: TabType; label: string; icon: React.ReactNode }[] = [
    { key: "general", label: "General", icon: <FiUser className="w-4 h-4" /> },
    { key: "location", label: "Location", icon: <FiMapPin className="w-4 h-4" /> },
    { key: "education", label: "Education", icon: <FiBookOpen className="w-4 h-4" /> },
    { key: "socials", label: "Social Links", icon: <FiShare2 className="w-4 h-4" /> },
  ];

  const modalContent = (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Edit Profile</h2>
              <p className="text-xs text-gray-500">Update your account information and preferences</p>
            </div>
            <button
              onClick={onClose}
              type="button"
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          <div className="flex border-b border-gray-100 bg-gray-50/60 px-6 gap-2 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const hasErrors = tabErrors[tab.key] > 0;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.key
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-800"
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  {hasErrors && (
                    <span className="inline-flex items-center justify-center min-w-4.5 h-4.5 px-1.5 text-[10px] font-bold text-white bg-red-500 rounded-full shadow-xs animate-pulse">
                      {tabErrors[tab.key]}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
            {errorMessage && (
              <div className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
                <FiAlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            {activeTab === "general" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => {
                        setFirstName(e.target.value);
                        clearBackendError("firstName");
                      }}
                      onBlur={() => handleBlur("firstName")}
                      placeholder="e.g. John"
                      className={getInputClasses(isFieldInvalid("firstName"))}
                      maxLength={20}
                    />
                    {isFieldInvalid("firstName") && (
                      <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-500">
                        <FiAlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{getFieldError("firstName")}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => {
                        setLastName(e.target.value);
                        clearBackendError("lastName");
                      }}
                      onBlur={() => handleBlur("lastName")}
                      placeholder="e.g. Doe"
                      className={getInputClasses(isFieldInvalid("lastName"))}
                      maxLength={20}
                    />
                    {isFieldInvalid("lastName") && (
                      <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-500">
                        <FiAlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{getFieldError("lastName")}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Phone Number <span className="text-gray-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => {
                        setPhoneNumber(e.target.value);
                        clearBackendError("phoneNumber");
                      }}
                      onBlur={() => handleBlur("phoneNumber")}
                      placeholder="01xxxxxxxxx or +20..."
                      className={getInputClasses(isFieldInvalid("phoneNumber"))}
                      maxLength={16}
                    />
                    {isFieldInvalid("phoneNumber") && (
                      <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-500">
                        <FiAlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{getFieldError("phoneNumber")}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => {
                        setGender(e.target.value as "male" | "female");
                        clearBackendError("gender");
                      }}
                      onBlur={() => handleBlur("gender")}
                      className={getInputClasses(isFieldInvalid("gender"))}
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                    {isFieldInvalid("gender") && (
                      <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-500">
                        <FiAlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{getFieldError("gender")}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Date of Birth <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="date"
                    value={dob}
                    max={new Date().toISOString().split("T")[0]}
                    min="1900-01-01"
                    onChange={(e) => {
                      setDob(e.target.value);
                      clearBackendError("dob");
                    }}
                    onBlur={() => handleBlur("dob")}
                    className={getInputClasses(isFieldInvalid("dob"))}
                  />
                  {isFieldInvalid("dob") && (
                    <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-500">
                      <FiAlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{getFieldError("dob")}</span>
                    </p>
                  )}
                </div>
              </div>
            )}

            {activeTab === "location" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Country</label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => {
                        setCountry(e.target.value);
                        clearBackendError("country");
                      }}
                      onBlur={() => handleBlur("country")}
                      placeholder="e.g. Egypt"
                      className={getInputClasses(isFieldInvalid("country"))}
                      maxLength={50}
                    />
                    {isFieldInvalid("country") && (
                      <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-500">
                        <FiAlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{getFieldError("country")}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => {
                        setCity(e.target.value);
                        clearBackendError("city");
                      }}
                      onBlur={() => handleBlur("city")}
                      placeholder="e.g. Cairo"
                      className={getInputClasses(isFieldInvalid("city"))}
                      maxLength={50}
                    />
                    {isFieldInvalid("city") && (
                      <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-500">
                        <FiAlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{getFieldError("city")}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Governorate / State
                    </label>
                    <input
                      type="text"
                      value={governrate}
                      onChange={(e) => {
                        setGovernrate(e.target.value);
                        clearBackendError("governrate");
                      }}
                      onBlur={() => handleBlur("governrate")}
                      placeholder="e.g. Giza"
                      className={getInputClasses(isFieldInvalid("governrate"))}
                      maxLength={50}
                    />
                    {isFieldInvalid("governrate") && (
                      <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-500">
                        <FiAlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{getFieldError("governrate")}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Street Address
                    </label>
                    <input
                      type="text"
                      value={street}
                      onChange={(e) => {
                        setStreet(e.target.value);
                        clearBackendError("street");
                      }}
                      onBlur={() => handleBlur("street")}
                      placeholder="e.g. Street 9, Maadi"
                      className={getInputClasses(isFieldInvalid("street"))}
                      maxLength={100}
                    />
                    {isFieldInvalid("street") && (
                      <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-500">
                        <FiAlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{getFieldError("street")}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "education" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      University / School
                    </label>
                    <input
                      type="text"
                      value={university}
                      onChange={(e) => {
                        setUniversity(e.target.value);
                        clearBackendError("university");
                      }}
                      onBlur={() => handleBlur("university")}
                      placeholder="e.g. Helwan University"
                      className={getInputClasses(isFieldInvalid("university"))}
                      maxLength={100}
                    />
                    {isFieldInvalid("university") && (
                      <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-500">
                        <FiAlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{getFieldError("university")}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      College / Faculty
                    </label>
                    <input
                      type="text"
                      value={college}
                      onChange={(e) => {
                        setCollege(e.target.value);
                        clearBackendError("college");
                      }}
                      onBlur={() => handleBlur("college")}
                      placeholder="e.g. Computer Science & AI"
                      className={getInputClasses(isFieldInvalid("college"))}
                      maxLength={100}
                    />
                    {isFieldInvalid("college") && (
                      <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-500">
                        <FiAlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{getFieldError("college")}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Major / Field of Study
                    </label>
                    <input
                      type="text"
                      value={major}
                      onChange={(e) => {
                        setMajor(e.target.value);
                        clearBackendError("major");
                      }}
                      onBlur={() => handleBlur("major")}
                      placeholder="e.g. Information Systems"
                      className={getInputClasses(isFieldInvalid("major"))}
                      maxLength={100}
                    />
                    {isFieldInvalid("major") && (
                      <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-500">
                        <FiAlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{getFieldError("major")}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Graduation Year
                    </label>
                    <input
                      type="number"
                      value={graduationYear}
                      onChange={(e) => {
                        setGraduationYear(e.target.value);
                        clearBackendError("graduationYear");
                      }}
                      onBlur={() => handleBlur("graduationYear")}
                      placeholder="e.g. 2026"
                      min={1950}
                      max={2100}
                      className={getInputClasses(isFieldInvalid("graduationYear"))}
                    />
                    {isFieldInvalid("graduationYear") && (
                      <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-500">
                        <FiAlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{getFieldError("graduationYear")}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "socials" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">Add links to your social media profiles</p>
                  <button
                    type="button"
                    onClick={handleAddSocialLink}
                    className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 px-2.5 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <FiPlus className="w-4 h-4" />
                    Add Link
                  </button>
                </div>

                {socialLinks.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-gray-200 rounded-xl text-gray-400 text-xs">
                    No social links added yet. Click &quot;Add Link&quot; above to add one.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {socialLinks.map((link, idx) => {
                      const itemErrors = activeErrors.socialLinks?.[idx];
                      const isItemTouched = touched[`social_${idx}`] || touchedAll;
                      const hasPlatformErr = isItemTouched && !!itemErrors?.platformName;
                      const hasLinkErr = isItemTouched && !!itemErrors?.link;

                      return (
                        <div
                          key={idx}
                          className="p-3 bg-gray-50/70 border border-gray-100 rounded-xl space-y-2"
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="text"
                              value={link.platformName || ""}
                              onChange={(e) => handleSocialLinkChange(idx, "platformName", e.target.value)}
                              onBlur={() => handleBlur(`social_${idx}`)}
                              placeholder="Platform (e.g. GitHub)"
                              maxLength={30}
                              className={`w-1/3 px-3 py-2 rounded-xl text-xs sm:text-sm focus:outline-none transition-colors ${
                                hasPlatformErr
                                  ? "bg-red-50/40 border border-red-400 focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                                  : "bg-white border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                              }`}
                            />
                            <input
                              type="text"
                              value={link.link || ""}
                              onChange={(e) => handleSocialLinkChange(idx, "link", e.target.value)}
                              onBlur={() => handleBlur(`social_${idx}`)}
                              placeholder="https://github.com/username"
                              className={`flex-1 px-3 py-2 rounded-xl text-xs sm:text-sm focus:outline-none transition-colors ${
                                hasLinkErr
                                  ? "bg-red-50/40 border border-red-400 focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                                  : "bg-white border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                              }`}
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveSocialLink(idx)}
                              className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                              title="Remove link"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                          {(hasPlatformErr || hasLinkErr) && (
                            <div className="space-y-1 pl-1">
                              {hasPlatformErr && (
                                <p className="flex items-center gap-1 text-xs font-medium text-red-500">
                                  <FiAlertCircle className="w-3.5 h-3.5 shrink-0" />
                                  <span>{itemErrors?.platformName}</span>
                                </p>
                              )}
                              {hasLinkErr && (
                                <p className="flex items-center gap-1 text-xs font-medium text-red-500">
                                  <FiAlertCircle className="w-3.5 h-3.5 shrink-0" />
                                  <span>{itemErrors?.link}</span>
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                disabled={isPending}
                className="px-4 py-2 text-xs sm:text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors cursor-pointer shadow-sm disabled:opacity-50"
              >
                {isPending && <FiLoader className="w-4 h-4 animate-spin" />}
                Save Changes
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
