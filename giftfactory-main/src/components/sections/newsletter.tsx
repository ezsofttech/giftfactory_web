"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle2, Loader2 } from "lucide-react";
import { subscribeNewsletter } from "@/lib/api";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();

    if (!trimmed) { setError("Please enter your email address."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await subscribeNewsletter(trimmed);
      setSuccess(true);
      setEmail("");
    } catch (err: any) {
      const msg: string = err?.response?.data?.message ?? err?.message ?? "Something went wrong. Please try again.";
      // Treat "already subscribed" as a soft success
      if (msg.toLowerCase().includes("already subscribed")) {
        setError("You're already subscribed! 🎉");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-12 bg-white border-t border-b">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Subscribe to Our Newsletter</h2>
          <p className="text-gray-600 mb-6">
            Get the latest updates on new products and upcoming sales
          </p>

          {success ? (
            <div className="flex flex-col items-center gap-3 py-4 text-green-600">
              <CheckCircle2 className="h-10 w-10" />
              <p className="text-base font-medium">You're subscribed! Check your inbox for a welcome email.</p>
              <button
                onClick={() => setSuccess(false)}
                className="text-sm text-gray-400 hover:text-gray-600 underline mt-1"
              >
                Subscribe another email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
              <Input
                type="email"
                placeholder="Your email address"
                className="flex-1 py-6 px-4"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(null); }}
                disabled={loading}
              />
              <Button type="submit" className="py-6 px-8" disabled={loading}>
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <Mail className="h-5 w-5 mr-2" />
                )}
                {loading ? "Subscribing…" : "Subscribe"}
              </Button>
            </form>
          )}

          {error && (
            <p className="mt-3 text-sm text-red-500">{error}</p>
          )}
        </div>
      </div>
    </section>
  );
}
