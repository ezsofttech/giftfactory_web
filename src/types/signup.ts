import { Control } from "react-hook-form";
import { z } from "zod";
import { personalInfoSchema, addressInfoSchema, signupSchema } from "@/schemas/signup";

// Types
export type PersonalInfoFormValues = z.infer<typeof personalInfoSchema>;
export type AddressInfoFormValues = z.infer<typeof addressInfoSchema>;
export type SignupFormValues = z.infer<typeof signupSchema>;

// Utility type for form control with specific values
export type FormControlProps<T extends Record<string, any>> = {
    control: Control<T>;
};
