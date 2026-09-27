import { z } from 'zod';
import { GenderEnum } from '../../Common/index.js';

export const signUpValidator = {
  body: z.strictObject({
    firstName:z.string().min(3).max(20),
    lastName:z.string().min(3).max(20),
    email:z.email(),
    password:z.string(),
    gender:z.enum(GenderEnum),
    phoneNumber:z.string().min(11).max(11)
  }),
};


export const updateUserValidator = {
  body: z.strictObject({
    firstName: z.string().trim().min(3).max(20).optional(),
    lastName: z.string().trim().min(3).max(20).optional(),
    gender: z.enum(GenderEnum).optional(),
    phoneNumber: z.string().min(11).max(15).optional(),
    DOB: z.coerce.date().optional(),
    location: z.object({
      country: z.string().trim().min(2).max(50).optional(),
      city: z.string().trim().min(2).max(50).optional(),
      governrate: z.string().trim().min(2).max(50).optional(),
      street: z.string().trim().min(2).max(100).optional(),
    }).optional(),
    education: z.object({
      university: z.string().trim().min(2).max(100).optional(),
      college: z.string().trim().min(2).max(100).optional(),
      major: z.string().trim().min(2).max(100).optional(),
      graduationYear: z.number().int().min(1950).max(2100).optional(),
    }).optional(),
    socialLinks: z.array(
      z.object({
        platformName: z.string().trim().min(1).max(30).optional(),
        link: z.string().url().optional(),
      })
    ).optional(),
  }),
};