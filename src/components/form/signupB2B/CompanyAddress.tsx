"use client";

import { useEffect, useMemo } from "react";
import { useFormContext } from "react-hook-form";
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
import { PincodeLookupInput } from "@/components/form/pincode-lookup-input";

interface CompanyAddressFormProps {
  onNext: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

export function CompanyAddressStep({ onNext, onBack, isLoading }: CompanyAddressFormProps) {
  const { control, setValue } = useFormContext<BusinessRegistrationFormData>();

  return (
    <div className="space-y-6">
      <FormField
        control={control}
        name="streetAddress"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Registered Business Address</FormLabel>
            <FormControl>
              <Input
                placeholder="123 Business Park Ave, Suite 500"
                {...field}
                autoComplete="street-address"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="postalCode"
        render={({ field }) => (
          <FormItem>
            <FormLabel>PIN / Postal code</FormLabel>
            <FormControl>
              <PincodeLookupInput
                value={field.value ?? ""}
                onChange={field.onChange}
                onFilled={(d) => {
                  if (d.country) setValue("country", d.country);
                  if (d.state) setValue("stateProvince", d.state);
                  if (d.city) setValue("city", d.city);
                  if (d.pincode) setValue("postalCode", d.pincode);
                }}
              />
            </FormControl>
            <FormDescription>Use look up to auto-fill country, state, and city when available.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Country</FormLabel>
              <FormControl>
                <Input placeholder="Enter country" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="stateProvince"
          render={({ field }) => (
            <FormItem>
              <FormLabel>State/Province</FormLabel>
              <FormControl>
                <Input placeholder="Enter state/province" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="city"
        render={({ field }) => (
          <FormItem>
            <FormLabel>District / City</FormLabel>
            <FormControl>
              <Input placeholder="Enter city or district" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="landmarkReference"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Location Reference (Optional)</FormLabel>
            <FormControl>
              <Input placeholder="Near Financial District, Opposite City Hall" {...field} />
            </FormControl>
            <FormDescription>Helpful for deliveries and visitors to locate your business</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack} className="min-w-[120px]" disabled={isLoading}>
          Back
        </Button>
        <Button type="button" onClick={onNext} className="min-w-[120px]" disabled={isLoading}>
          {isLoading ? "Saving..." : "Complete Registration"}
        </Button>
      </div>
    </div>
  );
}
