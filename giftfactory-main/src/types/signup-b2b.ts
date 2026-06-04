import {
    businessRegistrationSchema,
    companyAddressSchema,
    companyDetailsSchema,
    companyLegalDocumentsSchema
} from "@/schemas/signup-b2b";
import { Control } from "react-hook-form";
import { z } from "zod";

// Business Registration Types
export type CompanyDetailsFormData = z.infer<typeof companyDetailsSchema>;
export type CompanyAddressFormData = z.infer<typeof companyAddressSchema>;
export type companyLegalDocumentFormData = z.infer<typeof companyLegalDocumentsSchema>;
export type BusinessRegistrationFormData = z.infer<typeof businessRegistrationSchema>;
export type bb = [CompanyDetailsFormData, CompanyAddressFormData, companyLegalDocumentFormData]
// Form Control Props with Business Context
export type BusinessFormControllerProps<T extends Record<string, any>> = {
    control: Control<T>;
    className?: string;
    disabled?: boolean;
    // Additional business-specific props can be added here
    isVerified?: boolean; // For verified business data
    isEditable?: boolean; // For form edit states
};