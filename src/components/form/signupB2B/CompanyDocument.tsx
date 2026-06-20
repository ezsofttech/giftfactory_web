"use client";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { BusinessRegistrationFormData } from "@/types";
import { Control } from "react-hook-form";

interface CompanyLegalDocumentsFormProps {
  control: Control<BusinessRegistrationFormData>;
  onBack: () => void;
  onNext: () => void;
  isLoading?: boolean;
}

export function LegalDocumentsStep({
  control,
  onBack,
  onNext,
  isLoading,
}: CompanyLegalDocumentsFormProps) {
  return (
    <div className="space-y-6">
      <FormField
        control={control}
        name="gstNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel>GSTIN Number</FormLabel>
            <FormControl>
              <Input placeholder="22ABCDE1234F1Z5" {...field} />
            </FormControl>
            <FormDescription>
              15-digit GST identification number
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="gstCertificate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>GST Certificate</FormLabel>
            <FormControl>
              <Input
                type="file"
                accept=".pdf,.jpg,.png"
                onChange={(e) => field.onChange(e.target.files?.[0])}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="incorporationNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Company Incorporation Number</FormLabel>
            <FormControl>
              <Input placeholder="U72900MH2023PTC123456" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="certificateOfIncorporation"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Certificate of Incorporation</FormLabel>
            <FormControl>
              <Input
                type="file"
                accept=".pdf,.jpg,.png"
                onChange={(e) => field.onChange(e.target.files?.[0])}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="flex justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="min-w-[120px]"
          disabled={isLoading}
        >
          Back
        </Button>

        <Button
          type="button"
          onClick={onNext}
          className="min-w-[120px]"
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Upload Documents"}
        </Button>
      </div>
    </div>
  );
}
