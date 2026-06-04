"use client";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { businessRegistrationSchema } from "@/schemas"; // Import the combined schema
import { BusinessRegistrationFormData } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { CompanyAddressStep } from "./CompanyAddress";
import { CompanyDetailsStep } from "./companyDetails";
import { LegalDocumentsStep } from "./CompanyDocument";

export function BusinessRegistrationForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 4; // Details, Documents, Address, Review

  const form = useForm<BusinessRegistrationFormData>({
    resolver: zodResolver(businessRegistrationSchema), // Use the combined schema here
    defaultValues: {
      companyName: "",
      contactEmail: "",
      primaryContactNumber: "",
      gstNumber: "",
      incorporationNumber: "",
      streetAddress: "",
      city: "",
      stateProvince: "",
      landmarkReference: "",
      postalCode: "",
      country: "INDIA",
    },
    mode: "onTouched",
  });

  const handleNext = async () => {
    let isValid = false;
    if (currentStep === 0) {
      isValid = await form.trigger([
        "companyName",
        "contactEmail",
        "primaryContactNumber",
      ]);
    } else if (currentStep === 1) {
      isValid = await form.trigger(["gstNumber", "incorporationNumber"]);
    } else if (currentStep === 2) {
      isValid = await form.trigger(["streetAddress", "city", "stateProvince", "country", "postalCode"]);
    }

    if (isValid) {
      setCurrentStep((prev) => prev + 1);
    } else {
      toast.error("Please fill in all required fields before proceeding.");
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const onSubmit = (data: BusinessRegistrationFormData) => {
    toast.success("Business registration submitted!", {
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-neutral-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
    console.log("Registration Data:", data);
    // API submission would go here
  };

  return (
    <div className="flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Business Registration
        </h2>
        {/* Progress indicator */}
        <div className="mb-6">
          <div className="flex justify-between text-sm font-medium text-muted-foreground">
            <span className={currentStep >= 0 ? "text-primary" : ""}>
              Company Details
            </span>
            <span className={currentStep >= 1 ? "text-primary" : ""}>
              Legal Documents
            </span>
            <span className={currentStep >= 2 ? "text-primary" : ""}>
              Business Address
            </span>
            <span className={currentStep >= 3 ? "text-primary" : ""}>
              Review
            </span>
          </div>
          <div className="mt-2 h-2 w-full rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {currentStep === 0 && (
              <CompanyDetailsStep control={form.control} onNext={handleNext} />
            )}
            {currentStep === 1 && (
              <LegalDocumentsStep
                onBack={handleBack}
                onNext={handleNext}
                control={form.control}
              />
            )}
            {currentStep === 2 && (
              <CompanyAddressStep onBack={handleBack} onNext={handleNext} />
            )}
            {currentStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">
                  Review Your Information
                </h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-medium">Company Name:</span>{" "}
                    {form.watch("companyName")}
                  </p>
                  <p>
                    <span className="font-medium">Contact Email:</span>{" "}
                    {form.watch("contactEmail")}
                  </p>
                  <p>
                    <span className="font-medium">Primary Contact Number:</span>{" "}
                    {form.watch("primaryContactNumber")}
                  </p>
                  <p>
                    <span className="font-medium">GST Number:</span>{" "}
                    {form.watch("gstNumber")}
                  </p>
                  <p>
                    <span className="font-medium">Incorporation Number:</span>{" "}
                    {form.watch("incorporationNumber")}
                  </p>
                  <p>
                    <span className="font-medium">Street Address:</span>{" "}
                    {form.watch("streetAddress")}
                  </p>
                  <p>
                    <span className="font-medium">City:</span>{" "}
                    {form.watch("city")}
                  </p>
                  <p>
                    <span className="font-medium">State/Province:</span>{" "}
                    {form.watch("stateProvince")}
                  </p>
                  <p>
                    <span className="font-medium">Country:</span>{" "}
                    {form.watch("country")}
                  </p>
                  {form.watch("postalCode") && (
                    <p>
                      <span className="font-medium">PIN / Postal code:</span>{" "}
                      {form.watch("postalCode")}
                    </p>
                  )}
                  {form.watch("landmarkReference") && (
                    <p>
                      <span className="font-medium">Landmark:</span>{" "}
                      {form.watch("landmarkReference")}
                    </p>
                  )}
                </div>
                <div className="flex justify-between pt-4">
                  <Button type="button" variant="outline" onClick={handleBack}>
                    Back
                  </Button>
                  <Button type="submit">Complete Registration</Button>
                </div>
              </div>
            )}
          </form>
        </Form>
      </div>
    </div>
  );
}
