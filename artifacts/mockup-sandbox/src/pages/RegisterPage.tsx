import { Link, useLocation } from "wouter";

import { AuthForm } from "@/components/AuthForm";
import { MobileNavBar } from "@/components/MobileNavBar";
import { useAuth } from "@/context/AuthContext";

export function RegisterPage() {
  const { register } = useAuth();
  const [, setLocation] = useLocation();

  return (
    <div className="flex min-h-dvh flex-col">
      <MobileNavBar title="Create account" backTo="/" />
      <div className="flex-1 px-6 py-8">
        <h1 className="mb-2 text-[28px] font-semibold tracking-[-0.03em] text-[#1D1D1F]">
          Join Atelier
        </h1>
        <p className="mb-8 text-[17px] text-[#6E6E73]">
          Save every room and redesign in one place.
        </p>
        <AuthForm
          mode="register"
          onSubmit={async ({ name, email, password }) => {
            await register(name || "Guest", email, password);
            setLocation("/rooms");
          }}
        />
        <p className="mt-6 text-center text-[15px] text-[#6E6E73]">
          Already have an account?{" "}
          <Link href="/login" className="text-[#0071E3]">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
