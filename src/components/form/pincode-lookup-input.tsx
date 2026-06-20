"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchPincodeDetails, type PincodeLocationData } from "@/lib/pincode";
import { toast } from "sonner";

export function PincodeLookupInput({
  value,
  onChange,
  onFilled,
  disabled,
  id,
  placeholder = "PIN / Postal code",
}: {
  value: string;
  onChange: (v: string) => void;
  onFilled: (data: PincodeLocationData) => void;
  disabled?: boolean;
  id?: string;
  placeholder?: string;
}) {
  const [loading, setLoading] = useState(false);

  const lookup = async () => {
    const digits = value.replace(/\D/g, "");
    if (digits.length < 6) {
      toast.error("Enter a valid PIN code (at least 6 digits)");
      return;
    }
    setLoading(true);
    try {
      const data = await fetchPincodeDetails(digits);
      if (!data) {
        toast.error("Could not find this PIN code");
        return;
      }
      onFilled(data);
      toast.success("Location filled from PIN code");
    } catch {
      toast.error("PIN lookup failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled || loading}
        autoComplete="postal-code"
        className="flex-1"
      />
      <Button
        type="button"
        variant="default"
        className="shrink-0 bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90"
        onClick={lookup}
        disabled={disabled || loading}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : "Look up"}
      </Button>
    </div>
  );
}
