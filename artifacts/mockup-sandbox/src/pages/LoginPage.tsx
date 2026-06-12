import { Link, useLocation } from "wouter";

import { AuthForm } from "@/components/AuthForm";
import { MobileNavBar } from "@/components/MobileNavBar";
import { useAuth } from "@/context/AuthContext";

export function LoginPage() {
  const { login } = useAuth();
  const [, setLocation] = useLocation();

  return (
    <div className="flex min-h-dvh flex-col">
      <MobileNavBar title="Sign in" backTo="/" />
      <div className="flex-1 px-6 py-8">
        <h1 className="mb-2 text-[28px] font-semibold tracking-[-0.03em] text-[#1D1D1F]">
          Welcome back
        </h1>
        <p className="mb-8 text-[17px] text-[#6E6E73]">
          Sign in to save rooms and redesigns.
        </p>
        <AuthForm
          mode="login"
          onSubmit={async ({ email, password }) => {
            await login(email, password);
            setLocation("/rooms");
          }}
        />
        <p className="mt-6 text-center text-[15px] text-[#6E6E73]">
          New here?{" "}
          <Link href="/register" className="text-[#0071E3]">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
