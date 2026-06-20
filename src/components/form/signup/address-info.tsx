"use client";

import { useEffect, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SignupFormValues } from "@/schemas/signup";
import { PincodeLookupInput } from "@/components/form/pincode-lookup-input";

interface AddressInfoFormProps {
  onSubmit: () => void;
  onBack: () => void;
}

export function AddressInfoForm({ onSubmit, onBack }: AddressInfoFormProps) {
  const { control, setValue } = useFormContext<SignupFormValues>();

  return (
    <div className="space-y-8">
      <FormField
        control={control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Address</FormLabel>
            <FormControl>
              <Input placeholder="123 Main Street" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="pincode"
        render={({ field }) => (
          <FormItem>
            <FormLabel>PIN code (look up to fill location)</FormLabel>
            <FormControl>
              <PincodeLookupInput
                value={field.value ?? ""}
                onChange={field.onChange}
                onFilled={(d) => {
                  if (d.country) setValue("country", d.country);
                  if (d.state) setValue("state", d.state);
                  if (d.city) setValue("city", d.city);
                  if (d.pincode) setValue("pincode", d.pincode);
                }}
              />
            </FormControl>
            <FormDescription>Optional; helps auto-fill country, state, and city.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
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
          name="state"
          render={({ field }) => (
            <FormItem>
              <FormLabel>State</FormLabel>
              <FormControl>
                <Input placeholder="Enter state" {...field} />
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
              <Input placeholder="Enter city" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="landmark"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Landmark (Optional)</FormLabel>
            <FormControl>
              <Input placeholder="Near Central Park" {...field} />
            </FormControl>
            <FormDescription>A nearby landmark to help with delivery.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="flex gap-4">
        <Button type="button" variant="outline" onClick={onBack} className="w-auto text-xl font-sans">
          Back
        </Button>
        <Button type="button" onClick={onSubmit} className="w-auto text-xl font-sans">
          Submit
        </Button>
      </div>
    </div>
  );
}
