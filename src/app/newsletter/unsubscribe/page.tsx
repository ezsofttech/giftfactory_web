"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_ENDPOINTS, getApiBaseUrl } from "@/constants/api";

type Status = "loading" | "success" | "error";

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid unsubscribe link. The token is missing.");
      return;
    }

    const baseUrl = getApiBaseUrl();
    fetch(`${baseUrl}${API_ENDPOINTS.newsletter.unsubscribe}?token=${encodeURIComponent(token)}`, {
      method: "POST",
    })
      .then(async (res) => {
        const json = await res.json();
        if (res.ok) {
          setStatus("success");
          setMessage(json?.message ?? "You have been unsubscribed.");
        } else {
          setStatus("error");
          setMessage(json?.message ?? "Something went wrong. Please try again.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Something went wrong. Please try again later.");
      });
  }, [token]);

  return (
    <div className="max-w-md w-full text-center space-y-6">
      {status === "loading" && (
        <>
          <Loader2 className="h-12 w-12 animate-spin text-muted-foreground mx-auto" />
          <p className="text-muted-foreground text-sm">Processing your request…</p>
        </>
      )}

      {status === "success" && (
        <>
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-green-50 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Unsubscribed</h1>
            <p className="text-muted-foreground mt-2">{message}</p>
            <p className="text-sm text-muted-foreground mt-1">
              You won't receive any more marketing emails from us.
            </p>
          </div>
          <Button asChild variant="outline" className="rounded-full px-8">
            <Link href="/">Back to Home</Link>
          </Button>
        </>
      )}

      {status === "error" && (
        <>
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center">
              <XCircle className="h-8 w-8 text-red-400" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Something went wrong</h1>
            <p className="text-muted-foreground mt-2">{message}</p>
          </div>
          <Button asChild variant="outline" className="rounded-full px-8">
            <Link href="/">Back to Home</Link>
          </Button>
        </>
      )}
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <main className="min-h-[60vh] flex items-center justify-center px-4">
      <Suspense
        fallback={
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading…</p>
          </div>
        }
      >
        <UnsubscribeContent />
      </Suspense>
    </main>
  );
}
