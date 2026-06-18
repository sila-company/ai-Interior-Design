import { Link, Redirect, useLocation } from "wouter";

import { AuthForm } from "@/components/AuthForm";
import { MobileNavBar } from "@/components/MobileNavBar";
import { PageFrame, Surface } from "@/components/WebLayout";
import { useAuth } from "@/context/AuthContext";

export function LoginPage() {
  const { login, user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (!isLoading && user) {
    return <Redirect to="/rooms" />;
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <MobileNavBar title="Sign in" backTo="/" />
      <PageFrame className="flex flex-1 items-center sm:justify-center">
        <Surface className="w-full max-w-[358px] p-6 sm:max-w-md sm:p-8">
          <h1 className="mb-2 text-[28px] font-semibold text-[#1D1D1F]">
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
        </Surface>
      </PageFrame>
    </div>
  );
}
