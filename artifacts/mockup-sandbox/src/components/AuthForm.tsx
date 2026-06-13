import { useState } from "react";

interface AuthFormProps {
  mode: "login" | "register";
  onSubmit: (values: {
    name?: string;
    email: string;
    password: string;
  }) => Promise<void>;
}

export function AuthForm({ mode, onSubmit }: AuthFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        setIsSubmitting(true);
        setError(null);
        void onSubmit({
          name: mode === "register" ? name : undefined,
          email,
          password,
        })
          .catch((err: unknown) => {
            setError(err instanceof Error ? err.message : "Something went wrong.");
          })
          .finally(() => setIsSubmitting(false));
      }}
    >
      {mode === "register" ? (
        <label className="block">
          <span className="mb-2 block text-[14px] text-[#6E6E73]">Name</span>
          <input
            className="w-full rounded-lg border border-black/[0.08] bg-white px-4 py-3 text-[16px] outline-none focus:border-[#0071E3]"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </label>
      ) : null}

      <label className="block">
        <span className="mb-2 block text-[14px] text-[#6E6E73]">Email</span>
        <input
          type="email"
          className="w-full rounded-lg border border-black/[0.08] bg-white px-4 py-3 text-[16px] outline-none focus:border-[#0071E3]"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-[14px] text-[#6E6E73]">Password</span>
        <input
          type="password"
          minLength={8}
          className="w-full rounded-lg border border-black/[0.08] bg-white px-4 py-3 text-[16px] outline-none focus:border-[#0071E3]"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </label>

      {error ? <p className="text-[14px] text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full bg-[#0071E3] px-4 py-3.5 text-[15px] font-medium text-white disabled:opacity-60"
      >
        {isSubmitting
          ? "Please wait..."
          : mode === "login"
            ? "Sign in"
            : "Create account"}
      </button>
    </form>
  );
}
