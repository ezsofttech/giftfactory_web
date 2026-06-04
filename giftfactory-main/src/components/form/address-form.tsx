"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PincodeLookupInput } from "@/components/form/pincode-lookup-input";
import { useCountriesNowLocation } from "@/hooks/use-countries-now-location";
import { mergeLocationOptions } from "@/lib/location-options";

const formSchema = z.object({
  type: z.enum(["billing", "shipping"]),
  fullName: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().min(2, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zipCode: z.string().min(2, "Postal code is required"),
  country: z.string().min(2, "Country is required"),
  isDefault: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export type AddressFormSubmitData = FormValues & { line: string; postal_code: string };

function normalizeAddressFormType(t?: string): "billing" | "shipping" {
  if (!t || String(t).toLowerCase() === "billing") return "billing";
  return "shipping";
}

export function AddressForm({
  initialData,
  onCancel,
  onSubmit: onSubmitProp,
}: {
  initialData?: Partial<FormValues>;
  onCancel?: () => void;
  onSubmit?: (data: AddressFormSubmitData) => void;
} = {}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: normalizeAddressFormType(initialData?.type),
      fullName: initialData?.fullName ?? "",
      phone: initialData?.phone ?? "",
      address: initialData?.address ?? "",
      city: initialData?.city ?? "",
      state: initialData?.state ?? "",
      zipCode: initialData?.zipCode ?? "",
      country: initialData?.country ?? "INDIA",
      isDefault: initialData?.isDefault ?? false,
    },
  });

  function onSubmit(values: FormValues) {
    if (onSubmitProp) {
      onSubmitProp({
        ...values,
        line: values.address,
        postal_code: values.zipCode,
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="billing">Billing</SelectItem>
                  <SelectItem value="shipping">Shipping</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder="+1234567890" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="123 Main St" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="zipCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>PIN / Postal code</FormLabel>
              <FormControl>
                <PincodeLookupInput
                  value={field.value}
                  onChange={field.onChange}
                  onFilled={(d) => {
                    if (d.country) form.setValue("country", d.country);
                    if (d.state) form.setValue("state", d.state);
                    if (d.city) form.setValue("city", d.city);
                    if (d.pincode) form.setValue("zipCode", d.pincode);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
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
            control={form.control}
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
          control={form.control}
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
          control={form.control}
          name="isDefault"
          render={({ field }) => (
            <FormItem className="flex items-center gap-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value ?? false}
                  onCheckedChange={field.onChange}
                  id="addr-isDefault"
                />
              </FormControl>
              <FormLabel htmlFor="addr-isDefault" className="font-normal cursor-pointer">
                Set as default address
              </FormLabel>
            </FormItem>
          )}
        />

        <div className="flex gap-2 mt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
          )}
          <Button type="submit" className="flex-1">
            Save Address
          </Button>
        </div>
      </form>
    </Form>
  );
}
