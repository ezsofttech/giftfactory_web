"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { signIn } from "next-auth/react";
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
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

const otpSchema = z.object({
  identifier: z.string().min(1, "Enter email address or mobile number"),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

const passwordSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Enter your password"),
});
const OTP_LENGTH = 6;

interface SignInProps {
  callbackUrl?: string;
  /** When provided, called after successful sign-in instead of redirecting (e.g. when used in auth modal) */
  onSuccess?: () => void;
}

function getFriendlyAuthError(mode: "otp" | "password", rawError?: string | null): string {
  const error = String(rawError ?? "").toLowerCase();

  if (
    !rawError ||
    rawError === "CredentialsSignin" ||
    error.includes("configuration") ||
    error.includes("credential")
  ) {
    return mode === "otp"
      ? "Wrong OTP. Please try again."
      : "Email or password is incorrect.";
  }

  return mode === "otp"
    ? "Wrong OTP. Please try again."
    : "Email or password is incorrect.";
}

export function SignIn({ callbackUrl, onSuccess }: SignInProps = {}) {
  const [mode, setMode] = useState<"otp" | "password" | "forgot_password">("otp");
  const [otpMode, setOtpMode] = useState<"email" | "phone">("email");
  const [otpStep, setOtpStep] = useState<"email" | "verify">("email");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [forgotStep, setForgotStep] = useState<"email" | "reset">("email");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotPassword, setForgotPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);

  const handleFirebaseSignIn = async (providerName: "google" | "facebook") => {
    setSocialLoading(true);
    try {
      const { auth, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup } = await import("@/lib/firebase");
      const provider = providerName === "google" ? new GoogleAuthProvider() : new FacebookAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const idToken = await user.getIdToken();
      
      const res = await signIn("credentials", {
        idToken,
        email: user.email || "",
        name: user.displayName || "",
        avtar: user.photoURL || "",
        provider: providerName === "google" ? "google.com" : "facebook.com",
        redirect: false,
      });

      if (res?.error) {
        toast.error("Authentication failed: " + res.error);
        return;
      }
      if (res?.ok) {
        toast.success(`Successfully signed in with ${providerName === "google" ? "Google" : "Facebook"}!`);
        if (onSuccess) onSuccess();
        else window.location.href = callbackUrl ?? "/";
      }
    } catch (err: any) {
      console.error(`${providerName} login failed:`, err);
      toast.error(`${providerName === "google" ? "Google" : "Facebook"} sign-in failed: ${err.message}`);
    } finally {
      setSocialLoading(false);
    }
  };

  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: { identifier: "", otp: "" },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { email: "", password: "" },
  });

  const updateOtpAtIndex = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const current = otpForm.getValues("otp") ?? "";
    const digits = Array.from({ length: OTP_LENGTH }, (_, i) => current[i] ?? "");
    digits[index] = digit;
    const nextOtp = digits.join("");
    otpForm.setValue("otp", nextOtp, { shouldDirty: true, shouldValidate: true });
    if (digit && index < OTP_LENGTH - 1) {
      const nextInput = document.getElementById(`signin-otp-${index + 1}`) as HTMLInputElement | null;
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace") {
      const current = otpForm.getValues("otp") ?? "";
      if (!current[index] && index > 0) {
        const prevInput = document.getElementById(`signin-otp-${index - 1}`) as HTMLInputElement | null;
        prevInput?.focus();
      }
    }
  };

  const handleOtpPaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    otpForm.setValue("otp", pasted, { shouldDirty: true, shouldValidate: true });
    const focusIndex = Math.max(0, Math.min(pasted.length, OTP_LENGTH - 1));
    const focusInput = document.getElementById(`signin-otp-${focusIndex}`) as HTMLInputElement | null;
    focusInput?.focus();
  };

  async function onOtpSubmit(values: z.infer<typeof otpSchema>) {
    const result = await signIn("credentials", {
      email: values.identifier,
      otp: values.otp,
      redirect: false,
    });
    if (result?.error) {
      const msg = getFriendlyAuthError("otp", result.error);
      otpForm.setError("otp", { type: "manual", message: msg });
      return;
    }
    if (result?.ok) {
      if (onSuccess) onSuccess();
      else window.location.href = callbackUrl ?? "/";
    }
  }
 
  async function onSendOtpEmail() {
    const ok = await otpForm.trigger("identifier");
    if (!ok) return;
    const identifier = otpForm.getValues("identifier");
    
    if (otpMode === "email") {
      const isEmail = z.string().email().safeParse(identifier).success;
      if (!isEmail) {
        otpForm.setError("identifier", { type: "manual", message: "Invalid email address" });
        return;
      }
    } else {
      const isPhone = /^[6-9]\d{9}$/.test(identifier);
      if (!isPhone) {
        otpForm.setError("identifier", { type: "manual", message: "Invalid 10-digit mobile number" });
        return;
      }
    }
 
    setSendingOtp(true);
    try {
      const { sendOtp } = await import("@/lib/api");
      await sendOtp(identifier, otpMode);
      setOtpStep("verify");
      otpForm.setValue("otp", "");
    } catch (err: unknown) {
      const msg = (err as any)?.response?.data?.message ?? "Failed to send OTP";
      otpForm.setError("identifier", { type: "manual", message: String(msg) });
    } finally {
      setSendingOtp(false);
    }
  }

  async function onPasswordSubmit(values: z.infer<typeof passwordSchema>) {
    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });
    if (result?.error) {
      const msg = getFriendlyAuthError("password", result.error);
      passwordForm.setError("password", { type: "manual", message: msg });
      return;
    }
    if (result?.ok) {
      if (onSuccess) onSuccess();
      else window.location.href = callbackUrl ?? "/";
    }
  }

  return (
    <div className="space-y-4">
      {mode !== "forgot_password" && (
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant={mode === "otp" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("otp")}
          >
            Sign in with OTP
          </Button>
          <Button
            type="button"
            variant={mode === "password" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("password")}
          >
            Sign in with password
          </Button>
        </div>
      )}

      {mode === "otp" ? (
        <Form {...otpForm}>
          {otpStep === "email" ? (
            <form className="space-y-6" autoComplete="off">
              {/* segmented controls / choice buttons */}
              <div className="flex gap-2 p-1 bg-gray-100 rounded-xl border border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setOtpMode("email");
                    otpForm.setValue("identifier", "");
                    otpForm.clearErrors("identifier");
                  }}
                  className={`flex-1 text-center py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    otpMode === "email" ? "bg-white shadow text-pink-600" : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOtpMode("phone");
                    otpForm.setValue("identifier", "");
                    otpForm.clearErrors("identifier");
                  }}
                  className={`flex-1 text-center py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    otpMode === "phone" ? "bg-white shadow text-pink-600" : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  Phone
                </button>
              </div>
 
              <FormField
                control={otpForm.control}
                name="identifier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{otpMode === "email" ? "Email Address" : "Mobile Number"}</FormLabel>
                    <FormControl>
                      <Input
                        type={otpMode === "email" ? "email" : "tel"}
                        placeholder={otpMode === "email" ? "Enter your email" : "Enter 10-digit mobile number"}
                        autoComplete="off"
                        autoCapitalize="none"
                        autoCorrect="off"
                        className="text-foreground"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2 pt-2">
                <Button type="button" className="w-full" onClick={onSendOtpEmail} disabled={sendingOtp}>
                  {sendingOtp ? "Sending…" : "Send OTP"}
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-6" autoComplete="off">
              <FormField
                control={otpForm.control}
                name="identifier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{otpMode === "email" ? "Email Address" : "Mobile Number"}</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        readOnly
                        disabled
                        autoComplete="off"
                        value={field.value ?? ""}
                        className="bg-muted text-foreground disabled:opacity-100"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={otpForm.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>OTP</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <input type="hidden" name={field.name} value={field.value ?? ""} readOnly />
                        <div className="flex gap-2 justify-between">
                          {Array.from({ length: OTP_LENGTH }).map((_, index) => {
                            const otpValue = String(otpForm.watch("otp") ?? "");
                            return (
                              <Input
                                key={index}
                                id={`signin-otp-${index}`}
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
                    <p className="text-xs text-muted-foreground mt-1"></p>
                  </FormItem>
                )}
              />
              <div className="flex gap-2 pt-1">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setOtpStep("email")} disabled={sendingOtp}>
                  Back
                </Button>
                <Button type="submit" className="flex-1">Sign In</Button>
              </div>
            </form>
          )}
        </Form>
      ) : mode === "password" ? (
        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6" autoComplete="off">
          <div>
            <label className="text-sm font-medium block mb-2">Email</label>
            <Input type="email" placeholder="Enter your email" autoComplete="off" autoCapitalize="none" autoCorrect="off" className="text-foreground" {...passwordForm.register("email")} />
            {passwordForm.formState.errors.email && (
              <p className="text-destructive text-sm mt-1">{String(passwordForm.formState.errors.email.message)}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">Password</label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="pr-10"
                {...passwordForm.register("password")}
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
            {passwordForm.formState.errors.password && (
              <p className="text-destructive text-sm mt-1">{String(passwordForm.formState.errors.password.message)}</p>
            )}
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => {
                  setMode("forgot_password");
                  setForgotStep("email");
                  setForgotError("");
                  setForgotEmail(passwordForm.getValues("email") || "");
                }}
                className="text-xs text-primary hover:underline font-medium"
              >
                Forgot password?
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full">Sign In</Button>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="space-y-2 text-center">
            <h3 className="font-semibold text-lg">Reset Password</h3>
            <p className="text-xs text-muted-foreground">
              {forgotStep === "email"
                ? "Enter your email to receive a password reset OTP"
                : `Enter the OTP sent to ${forgotEmail} and your new password`}
            </p>
          </div>
          {forgotStep === "email" ? (
            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!forgotEmail || !z.string().email().safeParse(forgotEmail).success) {
                  setForgotError("Please enter a valid email address.");
                  return;
                }
                setForgotLoading(true);
                setForgotError("");
                try {
                  const { forgotPassword } = await import("@/lib/api");
                  await forgotPassword(forgotEmail);
                  setForgotStep("reset");
                  toast.success("OTP sent to your email!");
                } catch (err: any) {
                  setForgotError(err?.response?.data?.message ?? err?.message ?? "Failed to send OTP.");
                } finally {
                  setForgotLoading(false);
                }
              }}
            >
              <div>
                <label className="text-sm font-medium block mb-2">Email Address</label>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="text-foreground"
                  value={forgotEmail}
                  onChange={(e) => {
                    setForgotEmail(e.target.value);
                    setForgotError("");
                  }}
                  required
                />
              </div>
              {forgotError && <p className="text-sm text-destructive font-medium">{forgotError}</p>}
              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setMode("password")}
                  disabled={forgotLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={forgotLoading}>
                  {forgotLoading ? "Sending OTP…" : "Send OTP"}
                </Button>
              </div>
            </form>
          ) : (
            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!forgotOtp || forgotOtp.length !== 6) {
                  setForgotError("OTP must be 6 digits.");
                  return;
                }
                if (forgotPassword.length < 6) {
                  setForgotError("Password must be at least 6 characters.");
                  return;
                }
                if (forgotPassword.length > 12) {
                  setForgotError("Password must be at most 12 characters.");
                  return;
                }
                if (forgotPassword !== forgotConfirmPassword) {
                  setForgotError("Passwords do not match.");
                  return;
                }
                setForgotLoading(true);
                setForgotError("");
                try {
                  const { resetPassword } = await import("@/lib/api");
                  await resetPassword(forgotEmail, {
                    otp: forgotOtp,
                    password: forgotPassword,
                    confirmPassword: forgotConfirmPassword,
                  });
                  toast.success("Password reset successfully! Please sign in.");
                  setMode("password");
                  passwordForm.setValue("email", forgotEmail);
                  passwordForm.setValue("password", "");
                } catch (err: any) {
                  setForgotError(err?.response?.data?.message ?? err?.message ?? "Failed to reset password.");
                } finally {
                  setForgotLoading(false);
                }
              }}
            >
              <div>
                <label className="text-sm font-medium block mb-2">Email Address</label>
                <Input
                  type="email"
                  value={forgotEmail}
                  readOnly
                  disabled
                  className="bg-muted text-foreground disabled:opacity-100"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">OTP</label>
                <Input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit OTP"
                  value={forgotOtp}
                  onChange={(e) => {
                    setForgotOtp(e.target.value.replace(/\D/g, ""));
                    setForgotError("");
                  }}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">New Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    className="pr-10"
                    value={forgotPassword}
                    onChange={(e) => {
                      setForgotPassword(e.target.value);
                      setForgotError("");
                    }}
                    required
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
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Confirm Password</label>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={forgotConfirmPassword}
                  onChange={(e) => {
                    setForgotConfirmPassword(e.target.value);
                    setForgotError("");
                  }}
                  required
                />
              </div>
              {forgotError && <p className="text-sm text-destructive font-medium">{forgotError}</p>}
              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setForgotStep("email")}
                  disabled={forgotLoading}
                >
                  Back
                </Button>
                <Button type="submit" className="flex-1" disabled={forgotLoading}>
                  {forgotLoading ? "Resetting…" : "Change Password"}
                </Button>
              </div>
            </form>
          )}
        </div>
      )}

      {mode !== "forgot_password" && (
        <div className="space-y-4 pt-2">
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-border"></div>
            <span className="flex-shrink mx-4 text-muted-foreground text-xs font-semibold">Or continue with</span>
            <div className="flex-grow border-t border-border"></div>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 gap-2 rounded-xl"
              onClick={() => handleFirebaseSignIn("google")}
              disabled={socialLoading}
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              Google
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1 gap-2 rounded-xl"
              onClick={() => handleFirebaseSignIn("facebook")}
              disabled={socialLoading}
            >
              <svg className="h-4 w-4 shrink-0 fill-current text-[#1877F2]" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
