"use client";

import { Button } from "@/components/ui/button";
import { useAuthModal } from "@/provider/auth-modal-provider";
import { signOut, useSession } from "next-auth/react";

export default function AuthPage() {
  const { data: session, status } = useSession();
  const { openAuthModal } = useAuthModal();

  if (status === "loading") {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
      {!session ? (
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-center">Welcome</h1>
          <p className="text-gray-600 text-center">Please sign in to continue</p>
          <Button className="w-full" onClick={() => openAuthModal()}>
            Sign in or sign up
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-center">Your Profile</h1>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="font-semibold">Session Data:</h2>
            <pre className="text-sm text-gray-700 mt-2 overflow-x-auto">
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>

          <button
            onClick={() => signOut({ redirectTo: "/" })}
            className="w-full py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
