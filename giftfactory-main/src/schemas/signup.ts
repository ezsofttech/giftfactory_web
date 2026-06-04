import * as z from "zod";

// Schemas
export const personalInfoSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    email: z.email({ message: "Please enter a valid email address." }),
    mobile: z.string().min(10, { message: "Mobile number must be at least 10 digits." }),
});

export const addressInfoSchema = z.object({
    address: z.string().min(5, { message: "Address must be at least 5 characters." }),
    city: z.string().min(2, { message: "City must be at least 2 characters." }),
    state: z.string().min(2, { message: "State must be at least 2 characters." }),
    landmark: z.string().optional(),
    pincode: z.string().optional(),
    country: z.string().min(2, { message: "Country is required." }),
});

export const signupSchema = z.intersection(personalInfoSchema, addressInfoSchema);

// This mergedSignupSchema array is not directly used in this multi-step form implementation
// but is kept as it was part of your original types.ts file.
export const mergedSignupSchema = [personalInfoSchema, addressInfoSchema];

export type SignupFormValues = z.infer<typeof signupSchema>;
