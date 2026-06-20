import * as z from "zod";

// Business Entity Schemas
export const companyDetailsSchema = z.object({
    companyName: z.string().min(2, { message: "Company name must be at least 2 characters." }),
    contactEmail: z.email({ message: "Please enter a valid business email address." }),
    primaryContactNumber: z.string().min(10, { message: "Contact number must be at least 10 digits." }),
});

export const companyAddressSchema = z.object({
    streetAddress: z.string().min(5, { message: "Street address must be at least 5 characters." }),
    city: z.string().min(2, { message: "City must be at least 2 characters." }),
    stateProvince: z.string().min(2, { message: "State/Province must be at least 2 characters." }),
    landmarkReference: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().min(2, { message: "Country is required." }),
});

export const companyLegalDocumentsSchema = z.object({
    gstNumber: z.string().min(5, { message: "GST number must be at least 5 characters." }),
    gstCertificate: z.string().optional(),
    incorporationNumber: z.string().min(2, { message: "Incorporation number must be at least 2 characters." }),
    certificateOfIncorporation: z.string().optional(),
});

export const businessRegistrationSchema2 = z.intersection(
    companyDetailsSchema,
    companyAddressSchema,);
export const businessRegistrationSchema = z.intersection(businessRegistrationSchema2, companyLegalDocumentsSchema)

// Schema collection for multi-step business registration process
export const businessRegistrationStepSchemas = [
    companyDetailsSchema, companyLegalDocumentsSchema,
    companyAddressSchema,
    businessRegistrationSchema
];

