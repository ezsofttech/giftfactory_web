import { CustomerSignupForm } from "../form";

interface SignupCardProps {
  /** When provided, called after successful sign-up (e.g. when used in auth modal) */
  onSuccess?: () => void;
}

export const SignupCard = ({ onSuccess }: SignupCardProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-center">Create account</h2>
      <CustomerSignupForm onSuccess={onSuccess} />
    </div>
  );
};
