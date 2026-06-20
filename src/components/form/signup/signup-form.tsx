"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { AddressInfoForm, PersonalInfoForm } from "@/components/form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { SignupFormValues, signupSchema } from "@/schemas";

export function MultiStepSignupForm() {
  const [currentStep, setCurrentStep] = useState(0);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      mobile: "",
      address: "",
      city: "",
      state: "",
      landmark: "",
      pincode: "",
      country: "INDIA",
    },
    mode: "onTouched", // Validate on blur/change for better UX
  });

  const handleNext = async () => {
    let isValid = false;
    if (currentStep === 0) {
      // Validate personal info fields
      isValid = await form.trigger(["name", "email", "mobile"]);
    } else if (currentStep === 1) {
      // Validate address info fields
      isValid = await form.trigger(["address", "city", "state", "country", "landmark", "pincode"]);
    }

    if (isValid) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const onSubmit = (data: SignupFormValues) => {
    // This function is called when the final step's "Confirm & Submit" button is clicked
    // and all form data is valid according to signupSchema.
    toast("You submitted the following values:", {
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-neutral-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
    console.log("Form Data:", data);
    // In a real application, you would typically send this data to your backend.
  };

  const totalSteps = 3; // Personal Info, Address Info, Review

  return (
    <div className="flex flex-col items-center justify-center bg-background p-4 ">
      <div className="w-full max-w-md rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Customer Registration
        </h2>
        <div className="mb-6">
          <div className="flex justify-between text-sm font-medium text-muted-foreground">
            <span className={currentStep === 0 ? "text-primary" : ""}>
              Personal Info
            </span>
            <span className={currentStep === 1 ? "text-primary" : ""}>
              Address Info
            </span>
            <span className={currentStep === 2 ? "text-primary" : ""}>
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
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {currentStep === 0 && (
              <PersonalInfoForm control={form.control} onNext={handleNext} />
            )}
            {currentStep === 1 && (
              <AddressInfoForm onSubmit={handleNext} onBack={handleBack} />
            )}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">
                  Review Your Information
                </h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-medium">Name:</span>{" "}
                    {form.watch("name")}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span>{" "}
                    {form.watch("email")}
                  </p>
                  <p>
                    <span className="font-medium">Mobile:</span>{" "}
                    {form.watch("mobile")}
                  </p>
                  <p>
                    <span className="font-medium">Address:</span>{" "}
                    {form.watch("address")}
                  </p>
                  <p>
                    <span className="font-medium">City:</span>{" "}
                    {form.watch("city")}
                  </p>
                  <p>
                    <span className="font-medium">State:</span>{" "}
                    {form.watch("state")}
                  </p>
                  <p>
                    <span className="font-medium">Country:</span>{" "}
                    {form.watch("country")}
                  </p>
                  {form.watch("pincode") && (
                    <p>
                      <span className="font-medium">PIN code:</span>{" "}
                      {form.watch("pincode")}
                    </p>
                  )}
                  {form.watch("landmark") && (
                    <p>
                      <span className="font-medium">Landmark:</span>{" "}
                      {form.watch("landmark")}
                    </p>
                  )}
                </div>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    className="w-auto text-xl font-sans"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit" // This button triggers the main form's onSubmit
                    className="w-auto text-xl font-sans"
                  >
                    Confirm & Submit
                  </Button>
                </div>
              </div>
            )}
          </form>
        </Form>
      </div>
    </div>
  );
}
