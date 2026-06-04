"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { sendSignupOtp, verifyOtpSignup } from "@/lib/api";
import { Eye, EyeOff } from "lucide-react";

const step1Schema = z.object({
  email: z.string().email("Enter a valid email"),
});

const step2Schema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, "OTP must be 6 digits"),
  name: z.string().min(1, "Name is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type Step1Values = z.infer<typeof step1Schema>;
type Step2Values = z.infer<typeof step2Schema>;

interface CustomerSignupFormProps {
  /** When provided, called after successful sign-up instead of redirecting (e.g. when used in auth modal) */
  onSuccess?: () => void;
}

export function CustomerSignupForm({ onSuccess }: CustomerSignupFormProps = {}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [emailSent, setEmailSent] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const OTP_LENGTH = 6;

  const form1 = useForm<Step1Values>({
    resolver: zodResolver(step1Schema),
    defaultValues: { email: "" },
  });

  const form2 = useForm<Step2Values>({
    resolver: zodResolver(step2Schema),
    defaultValues: { email: "", otp: "", name: "", password: "", confirmPassword: "" },
  });

  const isEmailAlreadyExistsError = (message: string) => {
    const m = message.toLowerCase();
    return (
      m.includes("email already exists") ||
      m.includes("email exists") ||
      m.includes("already registered") ||
      m.includes("already used") ||
      m.includes("already exist")
    );
  };

  const onSendOtp = async () => {
    const ok = await form1.trigger("email");
    if (!ok) return;
    const email = form1.getValues("email");
    setSendingOtp(true);
    try {
      await sendSignupOtp(email);
      setEmailSent(email);
      form2.setValue("email", email);
      setStep(2);
      toast.success("OTP sent to your email.");
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to send OTP";
      if (isEmailAlreadyExistsError(String(msg))) {
        const signinMsg = "Email already exists. Please sign in.";
        form1.setError("email", { type: "manual", message: signinMsg });
        toast.error(signinMsg);
      } else {
        toast.error(msg);
      }
    } finally {
      setSendingOtp(false);
    }
  };

  const updateOtpAtIndex = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const current = form2.getValues("otp") ?? "";
    const digits = Array.from({ length: OTP_LENGTH }, (_, i) => current[i] ?? "");
    digits[index] = digit;
    const nextOtp = digits.join("");
    form2.setValue("otp", nextOtp, { shouldDirty: true, shouldValidate: true });
    if (digit && index < OTP_LENGTH - 1) {
      const nextInput = document.getElementById(`signup-otp-${index + 1}`) as HTMLInputElement | null;
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace") {
      const current = form2.getValues("otp") ?? "";
      if (!current[index] && index > 0) {
        const prevInput = document.getElementById(`signup-otp-${index - 1}`) as HTMLInputElement | null;
        prevInput?.focus();
      }
    }
  };

  const handleOtpPaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    form2.setValue("otp", pasted, { shouldDirty: true, shouldValidate: true });
    const focusIndex = Math.max(0, Math.min(pasted.length, OTP_LENGTH - 1));
    const focusInput = document.getElementById(`signup-otp-${focusIndex}`) as HTMLInputElement | null;
    focusInput?.focus();
  };

  const onSubmitStep2 = async (values: Step2Values) => {
    setSubmitting(true);
    try {
      const res = await verifyOtpSignup({
        email: values.email,
        otp: values.otp,
        name: values.name,
        password: values.password,
      });
      // Backend returns { message, data: { data: { id, email }, accessToken, refreshToken } }
      const inner = (res as any)?.data ?? res;
      const customer = inner?.data;
      const accessToken = inner?.accessToken ?? (res as any)?.accessToken;
      const refreshToken = inner?.refreshToken ?? (res as any)?.refreshToken;
      const userId = customer?.id ?? customer?._id;

      if (!accessToken || !refreshToken || !values.email) {
        toast.error("Registration failed. Please try again.");
        return;
      }

      const result = await signIn("credentials", {
        email: values.email,
        accessToken,
        refreshToken,
        userId: userId ?? "",
        name: values.email,
        _signup: "1",
        redirect: false,
      });

      if (result?.error) {
        toast.error(result.error as string);
        return;
      }
      if (result?.ok) {
        toast.success("Account created. Welcome!");
        if (onSuccess) onSuccess();
        else window.location.href = "/";
      }
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Registration failed";
      if (String(msg).toLowerCase().includes("otp")) {
        form2.setError("otp", { type: "manual", message: String(msg) });
        toast.error(msg);
      } else if (isEmailAlreadyExistsError(String(msg))) {
        const email = form2.getValues("email");
        const signinMsg = "Email already exists. Please sign in.";
        form1.setValue("email", email);
        form1.setError("email", { type: "manual", message: signinMsg });
        setStep(1);
        toast.error(signinMsg);
      } else {
        toast.error(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (step === 1) {
    return (
      <div className="space-y-6">
        <Form {...form1}>
          <form className="space-y-6" autoComplete="off">
            <FormField
              control={form1.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="you@example.com" autoComplete="off" autoCapitalize="none" autoCorrect="off" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="button"
              className="w-full"
              onClick={onSendOtp}
              disabled={sendingOtp}
            >
              {sendingOtp ? "Sending…" : "Send OTP"}
            </Button>
          </form>
        </Form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        OTP sent to <strong>{emailSent}</strong>. Complete details to create account.
      </p>
      <Form {...form2}>
        <form onSubmit={form2.handleSubmit(onSubmitStep2)} className="space-y-6" autoComplete="off">
          <FormField
            control={form2.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    readOnly
                    disabled
                    autoComplete="off"
                    value={field.value ?? ""}
                    className="bg-muted text-foreground/80"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form2.control}
            name="otp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>OTP</FormLabel>
                <FormControl>
                  <div className="space-y-2">
                    <input type="hidden" name={field.name} value={field.value ?? ""} readOnly />
                    <div className="flex gap-2 justify-between">
                      {Array.from({ length: OTP_LENGTH }).map((_, index) => {
                        const otpValue = String(form2.watch("otp") ?? "");
                        return (
                          <Input
                            key={index}
                            id={`signup-otp-${index}`}
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            autoComplete="one-time-code"
                            maxLength={1}
                            value={otpValue[index] ?? ""}
                            onChange={(event) => updateOtpAtIndex(index, event.target.value)}
                            onKeyDown={(event) => handleOtpKeyDown(index, event)}
                            onPaste={index === 0 ? handleOtpPaste : undefined}
                            onBlur={field.onBlur}
                            aria-label={`OTP digit ${index + 1}`}
                            className="h-11 w-11 sm:h-12 sm:w-12 text-center text-lg font-semibold"
                          />
                        );
                      })}
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form2.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="John Doe"
                    autoComplete="name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form2.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Min 6 characters"
                      className="pr-10"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form2.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Repeat password"
                      className="pr-10"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setStep(1)}
              disabled={submitting}
            >
              Back
            </Button>
            <Button type="submit" className="flex-1" disabled={submitting}>
              {submitting ? "Creating account…" : "Create account"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
