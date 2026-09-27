import { z } from "zod";
import { TabType } from "../components/EditProfileModal";
import { UpdateProfilePayload, UserSocialLink } from "@/types/user.types";

export interface ProfileFormValues {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  gender: "male" | "female";
  dob: string;
  country: string;
  city: string;
  governrate: string;
  street: string;
  university: string;
  college: string;
  major: string;
  graduationYear: string;
  socialLinks: UserSocialLink[];
}

export interface SocialLinkErrors {
  platformName?: string;
  link?: string;
}

export interface ProfileValidationErrors {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  gender?: string;
  dob?: string;
  country?: string;
  city?: string;
  governrate?: string;
  street?: string;
  university?: string;
  college?: string;
  major?: string;
  graduationYear?: string;
  socialLinks?: Record<number, SocialLinkErrors>;
}

export type TabErrorCounts = Record<TabType, number>;

export interface ValidationResult {
  isValid: boolean;
  errors: ProfileValidationErrors;
  tabErrors: TabErrorCounts;
  firstErrorTab: TabType | null;
}

export const NAME_REGEX = /^[\p{L}\s'-]+$/u;
export const PHONE_REGEX = /^\+?[0-9]{11,15}$/;


export const firstNameSchema = z
  .string()
  .trim()
  .superRefine((val, ctx) => {
    if (!val) {
      ctx.addIssue({
        code: "custom",
        message: "First name is required",
      });
      return;
    }
    if (val.length < 3) {
      ctx.addIssue({
        code: "custom",
        message: "First name must be at least 3 characters",
      });
      return;
    }
    if (val.length > 20) {
      ctx.addIssue({
        code: "custom",
        message: "First name cannot exceed 20 characters",
      });
      return;
    }
    if (!NAME_REGEX.test(val)) {
      ctx.addIssue({
        code: "custom",
        message: "First name can only contain letters, spaces, and hyphens",
      });
      return;
    }
  });

export const lastNameSchema = z
  .string()
  .trim()
  .superRefine((val, ctx) => {
    if (!val) {
      ctx.addIssue({
        code: "custom",
        message: "Last name is required",
      });
      return;
    }
    if (val.length < 3) {
      ctx.addIssue({
        code: "custom",
        message: "Last name must be at least 3 characters",
      });
      return;
    }
    if (val.length > 20) {
      ctx.addIssue({
        code: "custom",
        message: "Last name cannot exceed 20 characters",
      });
      return;
    }
    if (!NAME_REGEX.test(val)) {
      ctx.addIssue({
        code: "custom",
        message: "Last name can only contain letters, spaces, and hyphens",
      });
      return;
    }
  });

export const phoneNumberSchema = z
  .string()
  .trim()
  .superRefine((val, ctx) => {
    if (!val) return; 
    const digitsOnly = val.replace(/\D/g, "");
    if (!PHONE_REGEX.test(val) || digitsOnly.length < 11 || digitsOnly.length > 15) {
      ctx.addIssue({
        code: "custom",
        message: "Phone number must be between 11 and 15 digits (e.g. 01012345678 or +201012345678)",
      });
      return;
    }
  });

export const genderSchema = z
  .string()
  .superRefine((val, ctx) => {
    if (val !== "male" && val !== "female") {
      ctx.addIssue({
        code: "custom",
        message: "Gender must be either male or female",
      });
      return;
    }
  });

export const dobSchema = z
  .string()
  .trim()
  .superRefine((val, ctx) => {
    if (!val) return; 

    const date = new Date(val);
    if (isNaN(date.getTime())) {
      ctx.addIssue({
        code: "custom",
        message: "Please enter a valid date",
      });
      return;
    }

    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (date > today) {
      ctx.addIssue({
        code: "custom",
        message: "Date of birth cannot be in the future",
      });
      return;
    }

    if (date.getFullYear() < 1900) {
      ctx.addIssue({
        code: "custom",
        message: "Please enter a valid birth year (1900 or later)",
      });
      return;
    }

    let age = today.getFullYear() - date.getFullYear();
    const m = today.getMonth() - date.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < date.getDate())) {
      age--;
    }

    if (age < 5) {
      ctx.addIssue({
        code: "custom",
        message: "User must be at least 5 years old",
      });
      return;
    }
  });

export const locationTextSchema = (fieldLabel: string, max: number = 50) =>
  z
    .string()
    .trim()
    .superRefine((val, ctx) => {
      if (!val) return; 
      if (val.length < 2) {
        ctx.addIssue({
          code: "custom",
          message: `${fieldLabel} must be at least 2 characters`,
        });
        return;
      }
      if (val.length > max) {
        ctx.addIssue({
          code: "custom",
          message: `${fieldLabel} cannot exceed ${max} characters`,
        });
        return;
      }
    });

export const graduationYearSchema = z
  .string()
  .trim()
  .superRefine((val, ctx) => {
    if (!val) return; 
    const year = Number(val);
    if (!Number.isInteger(year) || year < 1950 || year > 2100) {
      ctx.addIssue({
        code: "custom",
        message: "Graduation year must be a whole year between 1950 and 2100",
      });
      return;
    }
  });

export const socialLinkSchema = z
  .object({
    platformName: z.string().optional(),
    link: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const platform = (data.platformName || "").trim();
    const rawUrl = (data.link || "").trim();

    if (!platform && !rawUrl) {
      return;
    }

    if (!platform) {
      ctx.addIssue({
        code: "custom",
        path: ["platformName"],
        message: "Platform name is required (e.g. GitHub)",
      });
    } else if (platform.length > 30) {
      ctx.addIssue({
        code: "custom",
        path: ["platformName"],
        message: "Platform name cannot exceed 30 characters",
      });
    }

    if (!rawUrl) {
      ctx.addIssue({
        code: "custom",
        path: ["link"],
        message: "URL link is required",
      });
    } else {
      let candidate = rawUrl;
      if (!/^https?:\/\//i.test(candidate)) {
        candidate = `https://${candidate}`;
      }
      try {
        const parsed = new URL(candidate);
        if (!parsed.hostname || (!parsed.hostname.includes(".") && parsed.hostname !== "localhost")) {
          ctx.addIssue({
            code: "custom",
            path: ["link"],
            message: "Please enter a valid website URL (e.g. https://github.com/username)",
          });
        }
      } catch {
        ctx.addIssue({
          code: "custom",
          path: ["link"],
          message: "Please enter a valid URL (e.g. https://github.com/username)",
        });
      }
    }
  });

export const profileFormSchema = z.object({
  firstName: firstNameSchema,
  lastName: lastNameSchema,
  phoneNumber: phoneNumberSchema,
  gender: genderSchema,
  dob: dobSchema,
  country: locationTextSchema("Country", 50),
  city: locationTextSchema("City", 50),
  governrate: locationTextSchema("Governorate / State", 50),
  street: locationTextSchema("Street address", 100),
  university: locationTextSchema("University / School", 100),
  college: locationTextSchema("College / Faculty", 100),
  major: locationTextSchema("Major", 100),
  graduationYear: graduationYearSchema,
  socialLinks: z.array(socialLinkSchema).optional(),
});

export type ProfileFormSchemaType = z.infer<typeof profileFormSchema>;


export function validateFirstName(value: string): string | undefined {
  const result = firstNameSchema.safeParse(value);
  return result.success ? undefined : result.error.issues[0]?.message;
}

export function validateLastName(value: string): string | undefined {
  const result = lastNameSchema.safeParse(value);
  return result.success ? undefined : result.error.issues[0]?.message;
}

export function validatePhoneNumber(value: string): string | undefined {
  const result = phoneNumberSchema.safeParse(value);
  return result.success ? undefined : result.error.issues[0]?.message;
}

export function validateGender(value: string): string | undefined {
  const result = genderSchema.safeParse(value);
  return result.success ? undefined : result.error.issues[0]?.message;
}

export function validateDob(value: string): string | undefined {
  const result = dobSchema.safeParse(value);
  return result.success ? undefined : result.error.issues[0]?.message;
}

export function validateLocationField(value: string, fieldLabel: string, max: number = 50): string | undefined {
  const result = locationTextSchema(fieldLabel, max).safeParse(value);
  return result.success ? undefined : result.error.issues[0]?.message;
}

export function validateEducationField(value: string, fieldLabel: string, max: number = 100): string | undefined {
  const result = locationTextSchema(fieldLabel, max).safeParse(value);
  return result.success ? undefined : result.error.issues[0]?.message;
}

export function validateGraduationYear(value: string): string | undefined {
  const result = graduationYearSchema.safeParse(value);
  return result.success ? undefined : result.error.issues[0]?.message;
}

export function validateSocialLinkItem(
  linkItem: UserSocialLink
): { error?: SocialLinkErrors; isEmpty: boolean } {
  const platform = (linkItem.platformName || "").trim();
  const rawUrl = (linkItem.link || "").trim();

  if (!platform && !rawUrl) {
    return { isEmpty: true };
  }

  const result = socialLinkSchema.safeParse(linkItem);
  if (result.success) {
    return { error: undefined, isEmpty: false };
  }

  const errors: SocialLinkErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as "platformName" | "link";
    if (field) {
      errors[field] = issue.message;
    }
  }

  return {
    error: Object.keys(errors).length > 0 ? errors : undefined,
    isEmpty: false,
  };
}

export function validateProfileForm(values: ProfileFormValues): ValidationResult {
  const result = profileFormSchema.safeParse(values);
  const errors: ProfileValidationErrors = {};
  const tabErrors: TabErrorCounts = {
    general: 0,
    location: 0,
    education: 0,
    socials: 0,
  };

  if (!result.success) {
    for (const issue of result.error.issues) {
      const path = issue.path;

      if (path.length === 1) {
        const field = path[0] as keyof ProfileValidationErrors;
        if (!errors[field]) {
          (errors as any)[field] = issue.message;

          if (["firstName", "lastName", "phoneNumber", "gender", "dob"].includes(field)) {
            tabErrors.general++;
          } else if (["country", "city", "governrate", "street"].includes(field)) {
            tabErrors.location++;
          } else if (["university", "college", "major", "graduationYear"].includes(field)) {
            tabErrors.education++;
          }
        }
      } else if (path[0] === "socialLinks" && typeof path[1] === "number" && path[2]) {
        const idx = path[1];
        const prop = path[2] as "platformName" | "link";
        if (!errors.socialLinks) errors.socialLinks = {};
        if (!errors.socialLinks[idx]) {
          errors.socialLinks[idx] = {};
          tabErrors.socials++;
        }
        errors.socialLinks[idx][prop] = issue.message;
      }
    }
  }

  const totalErrors =
    tabErrors.general + tabErrors.location + tabErrors.education + tabErrors.socials;

  let firstErrorTab: TabType | null = null;
  if (tabErrors.general > 0) firstErrorTab = "general";
  else if (tabErrors.location > 0) firstErrorTab = "location";
  else if (tabErrors.education > 0) firstErrorTab = "education";
  else if (tabErrors.socials > 0) firstErrorTab = "socials";

  return {
    isValid: totalErrors === 0,
    errors,
    tabErrors,
    firstErrorTab,
  };
}

export function buildUpdateProfilePayload(values: ProfileFormValues): UpdateProfilePayload {
  const trimmedCountry = values.country.trim();
  const trimmedCity = values.city.trim();
  const trimmedGovernrate = values.governrate.trim();
  const trimmedStreet = values.street.trim();

  const hasLocation = trimmedCountry || trimmedCity || trimmedGovernrate || trimmedStreet;
  const location = hasLocation
    ? {
        country: trimmedCountry || undefined,
        city: trimmedCity || undefined,
        governrate: trimmedGovernrate || undefined,
        street: trimmedStreet || undefined,
      }
    : undefined;

  const trimmedUniversity = values.university.trim();
  const trimmedCollege = values.college.trim();
  const trimmedMajor = values.major.trim();
  const numGraduationYear = values.graduationYear ? Number(values.graduationYear) : undefined;

  const hasEducation =
    trimmedUniversity || trimmedCollege || trimmedMajor || numGraduationYear !== undefined;
  const education = hasEducation
    ? {
        university: trimmedUniversity || undefined,
        college: trimmedCollege || undefined,
        major: trimmedMajor || undefined,
        graduationYear: numGraduationYear,
      }
    : undefined;

  const socialLinks: UserSocialLink[] = [];
  for (const s of values.socialLinks) {
    const platform = (s.platformName || "").trim();
    let url = (s.link || "").trim();
    if (platform && url) {
      if (!/^https?:\/\//i.test(url)) {
        url = `https://${url}`;
      }
      socialLinks.push({
        platformName: platform,
        link: url,
      });
    }
  }

  const trimmedPhone = values.phoneNumber.trim();

  return {
    firstName: values.firstName.trim() || undefined,
    lastName: values.lastName.trim() || undefined,
    gender: values.gender,
    phoneNumber: trimmedPhone || undefined,
    DOB: values.dob ? new Date(values.dob).toISOString() : undefined,
    location,
    education,
    socialLinks,
  };
}


export function extractBackendErrors(err: any): {
  message: string;
  fieldErrors: ProfileValidationErrors;
  firstErrorTab: TabType | null;
} {
  const fieldErrors: ProfileValidationErrors = {};
  let message =
    err.response?.data?.error?.message ||
    err.response?.data?.message ||
    err.response?.data?.data?.message ||
    err.message ||
    "Failed to update profile";

  const validationErrors =
    err.response?.data?.error?.validationErrors ||
    err.response?.data?.data?.validationErrors ||
    err.response?.data?.validationErrors;

  if (Array.isArray(validationErrors)) {
    for (const group of validationErrors) {
      if (Array.isArray(group.issues)) {
        for (const issue of group.issues) {
          const path = issue.path;
          if (Array.isArray(path) && path.length > 0) {
            const root = String(path[0]);
            if (root === "firstName") fieldErrors.firstName = issue.message;
            else if (root === "lastName") fieldErrors.lastName = issue.message;
            else if (root === "phoneNumber") fieldErrors.phoneNumber = issue.message;
            else if (root === "gender") fieldErrors.gender = issue.message;
            else if (root === "DOB") fieldErrors.dob = issue.message;
            else if (root === "location" && path[1]) {
              const sub = String(path[1]) as keyof ProfileValidationErrors;
              fieldErrors[sub] = issue.message;
            } else if (root === "education" && path[1]) {
              const sub = String(path[1]) as keyof ProfileValidationErrors;
              fieldErrors[sub] = issue.message;
            } else if (root === "socialLinks" && typeof path[1] === "number" && path[2]) {
              if (!fieldErrors.socialLinks) fieldErrors.socialLinks = {};
              const idx = path[1];
              const prop = String(path[2]) as "platformName" | "link";
              if (!fieldErrors.socialLinks[idx]) fieldErrors.socialLinks[idx] = {};
              fieldErrors.socialLinks[idx][prop] = issue.message;
            }
          }
        }
      }
    }
  }

  let firstErrorTab: TabType | null = null;
  if (
    fieldErrors.firstName ||
    fieldErrors.lastName ||
    fieldErrors.phoneNumber ||
    fieldErrors.gender ||
    fieldErrors.dob
  ) {
    firstErrorTab = "general";
  } else if (
    fieldErrors.country ||
    fieldErrors.city ||
    fieldErrors.governrate ||
    fieldErrors.street
  ) {
    firstErrorTab = "location";
  } else if (
    fieldErrors.university ||
    fieldErrors.college ||
    fieldErrors.major ||
    fieldErrors.graduationYear
  ) {
    firstErrorTab = "education";
  } else if (fieldErrors.socialLinks) {
    firstErrorTab = "socials";
  }

  return { message, fieldErrors, firstErrorTab };
}
