"use client";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { BusinessRegistrationFormData, CompanyDetailsFormData } from "@/types";
import { Control } from "react-hook-form";

interface CompanyDetailsFormProps {
  control: Control<BusinessRegistrationFormData>;
  onNext: () => void;
  isLoading?: boolean;
}

export function CompanyDetailsStep({
  control,
  onNext,
  isLoading,
}: CompanyDetailsFormProps) {
  return (
    <div className="space-y-6">
      <FormField
        control={control}
        name="companyName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Company Name</FormLabel>
            <FormControl>
              <Input
                placeholder="Acme Corporation"
                {...field}
                autoComplete="organization"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="contactEmail"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Business Email</FormLabel>
            <FormControl>
              <Input
                placeholder="contact@acme.com"
                type="email"
                {...field}
                autoComplete="email"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="primaryContactNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Contact Number</FormLabel>
            <FormControl>
              <Input
                placeholder="+1 (555) 123-4567"
                type="tel"
                {...field}
                autoComplete="tel"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="flex justify-end pt-4">
        <Button
          type="button"
          onClick={onNext}
          className="min-w-[120px]"
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : "Continue"}
        </Button>
      </div>
    </div>
  );
}
