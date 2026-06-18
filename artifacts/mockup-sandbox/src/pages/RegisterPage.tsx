import { Link, Redirect, useLocation } from "wouter";

import { AuthForm } from "@/components/AuthForm";
import { MobileNavBar } from "@/components/MobileNavBar";
import { PageFrame, Surface } from "@/components/WebLayout";
import { useAuth } from "@/context/AuthContext";

export function RegisterPage() {
  const { register, user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (!isLoading && user) {
    return <Redirect to="/rooms" />;
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <MobileNavBar title="Create account" backTo="/" />
      <PageFrame className="flex flex-1 items-center sm:justify-center">
        <Surface className="w-full max-w-[358px] p-6 sm:max-w-md sm:p-8">
          <h1 className="mb-2 text-[28px] font-semibold text-[#1D1D1F]">
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
        </Surface>
      </PageFrame>
    </div>
  );
}
