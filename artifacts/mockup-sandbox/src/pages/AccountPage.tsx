import { useQuery } from "@tanstack/react-query";
import {
  ChevronRight,
  CreditCard,
  FileText,
  HelpCircle,
  Lock,
  LogOut,
  Shield,
  Trash2,
  User,
} from "lucide-react";
import { useState, type FormEvent, type ReactNode } from "react";
import { Link, Redirect, useLocation } from "wouter";

import { MobileNavBar } from "@/components/MobileNavBar";
import { PageFrame, Surface } from "@/components/WebLayout";
import { useAuth } from "@/context/AuthContext";
import { listRedesigns, listRooms, type MembershipStatus } from "@/lib/api";

function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function membershipSummary(membership: MembershipStatus | null): string {
  if (!membership) return "Checking membership...";
  if (membership.isActive) {
    if (membership.expiresAt) {
      return `Member - renews ${new Date(
        membership.expiresAt,
      ).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`;
    }
    return "Atelier Member";
  }

  if (membership.freeRemaining > 0) {
    const total = Math.max(
      membership.redesignCount + membership.freeRemaining,
      2,
    );
    return `${membership.freeRemaining} of ${total} free redesigns remaining`;
  }

  return "Subscribe for unlimited redesigns";
}

export function AccountPage() {
  const {
    user,
    membership,
    isLoading,
    logout,
    updateName,
    changePassword,
    deleteAccount,
  } = useAuth();
  const [, setLocation] = useLocation();
  const [sheet, setSheet] = useState<"name" | "password" | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const roomsQuery = useQuery({
    queryKey: ["rooms"],
    queryFn: listRooms,
    enabled: Boolean(user),
  });
  const redesignsQuery = useQuery({
    queryKey: ["redesigns"],
    queryFn: listRedesigns,
    enabled: Boolean(user),
  });

  if (!isLoading && !user) {
    return <Redirect to="/login" />;
  }

  if (!user) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0071E3] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <MobileNavBar title="Account" backTo="/rooms" />
      <PageFrame className="flex-1">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-6 hidden text-[34px] font-semibold tracking-[-0.01em] text-[#1D1D1F] lg:block">
            Account
          </h1>

          <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
            <Surface className="p-5 lg:col-span-2">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#0071E3] text-[21px] font-semibold text-white">
                  {initials(user.name)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[20px] font-semibold text-[#1D1D1F]">
                    {user.name}
                  </p>
                  <p className="truncate text-[15px] text-[#6E6E73]">
                    {user.email}
                  </p>
                </div>
              </div>
            </Surface>

            <Surface className="p-5">
              <SectionTitle>Settings</SectionTitle>
              <div className="mt-2 divide-y divide-black/[0.06]">
                <ActionRow
                  icon={<User className="h-4 w-4" />}
                  label="Edit name"
                  onClick={() => setSheet("name")}
                />
                <ActionRow
                  icon={<Lock className="h-4 w-4" />}
                  label="Change password"
                  onClick={() => setSheet("password")}
                />
              </div>
            </Surface>

            <Surface className="p-5">
              <SectionTitle>Membership</SectionTitle>
              <p className="mt-3 text-[15px] leading-6 text-[#6E6E73]">
                {membershipSummary(membership)}
              </p>
              <Link
                href="/membership"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0071E3] px-4 py-3 text-[15px] font-medium text-white"
              >
                <CreditCard className="h-4 w-4" />
                {membership?.isActive ? "Manage membership" : "View membership"}
              </Link>
            </Surface>

            <Surface className="p-5">
              <SectionTitle>Your library</SectionTitle>
              <div className="mt-5 grid grid-cols-2 gap-4">
                <LibraryStat
                  label="Rooms"
                  value={
                    roomsQuery.isLoading
                      ? "..."
                      : String(roomsQuery.data?.length ?? 0)
                  }
                />
                <LibraryStat
                  label="Redesigns"
                  value={
                    redesignsQuery.isLoading
                      ? "..."
                      : String(redesignsQuery.data?.length ?? 0)
                  }
                />
              </div>
            </Surface>

            <Surface className="p-5">
              <SectionTitle>Legal</SectionTitle>
              <div className="mt-2 divide-y divide-black/[0.06]">
                <LinkRow
                  href="/privacy"
                  icon={<Shield className="h-4 w-4" />}
                  label="Privacy Policy"
                />
                <LinkRow
                  href="/terms"
                  icon={<FileText className="h-4 w-4" />}
                  label="Terms of Use"
                />
                <LinkRow
                  href="/support"
                  icon={<HelpCircle className="h-4 w-4" />}
                  label="Support"
                />
              </div>
            </Surface>
          </div>

          {actionError ? (
            <p className="mt-5 rounded-[16px] bg-red-50 px-4 py-3 text-[14px] text-red-700">
              {actionError}
            </p>
          ) : null}

          <div className="mt-6 space-y-3">
            <button
              type="button"
              disabled={isSigningOut}
              onClick={() => {
                setIsSigningOut(true);
                setActionError(null);
                void logout()
                  .then(() => setLocation("/"))
                  .catch((error: unknown) =>
                    setActionError(
                      error instanceof Error
                        ? error.message
                        : "Could not sign out.",
                    ),
                  )
                  .finally(() => setIsSigningOut(false));
              }}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-red-500/[0.08] px-4 py-3.5 text-[15px] font-medium text-red-700"
            >
              <LogOut className="h-4 w-4" />
              {isSigningOut ? "Signing out..." : "Sign out"}
            </button>

            {confirmDelete ? (
              <Surface className="p-4">
                <p className="text-[15px] font-semibold text-[#1D1D1F]">
                  Delete your Atelier account?
                </p>
                <p className="mt-1 text-[13px] leading-5 text-[#6E6E73]">
                  This permanently deletes your rooms, redesigns, and account
                  data. Apple subscriptions must be canceled separately.
                </p>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="flex-1 rounded-full bg-black/[0.04] px-4 py-3 text-[14px] font-medium text-[#1D1D1F]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => {
                      setIsDeleting(true);
                      setActionError(null);
                      void deleteAccount()
                        .then(() => setLocation("/"))
                        .catch((error: unknown) =>
                          setActionError(
                            error instanceof Error
                              ? error.message
                              : "Could not delete account.",
                          ),
                        )
                        .finally(() => setIsDeleting(false));
                    }}
                    className="flex-1 rounded-full bg-red-500 px-4 py-3 text-[14px] font-medium text-white disabled:opacity-60"
                  >
                    {isDeleting ? "Deleting account..." : "Delete account"}
                  </button>
                </div>
              </Surface>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="flex w-full items-center justify-center gap-2 rounded-full px-4 py-3.5 text-[15px] font-medium text-red-700"
              >
                <Trash2 className="h-4 w-4" />
                Delete account
              </button>
            )}
          </div>
        </div>
      </PageFrame>

      {sheet === "name" ? (
        <EditNameSheet
          currentName={user.name}
          onClose={() => setSheet(null)}
          onSave={async (name) => {
            await updateName(name);
            setSheet(null);
          }}
        />
      ) : null}

      {sheet === "password" ? (
        <ChangePasswordSheet
          onClose={() => setSheet(null)}
          onSave={async (currentPassword, newPassword) => {
            await changePassword(currentPassword, newPassword);
            setSheet(null);
          }}
        />
      ) : null}
    </div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-[17px] font-semibold text-[#1D1D1F]">{children}</h2>
  );
}

function ActionRow({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 py-3 text-left"
    >
      <span className="flex h-8 w-8 items-center justify-center text-[#0071E3]">
        {icon}
      </span>
      <span className="flex-1 text-[16px] text-[#1D1D1F]">{label}</span>
      <ChevronRight className="h-4 w-4 text-[#86868B]" />
    </button>
  );
}

function LinkRow({
  href,
  icon,
  label,
}: {
  href: string;
  icon: ReactNode;
  label: string;
}) {
  return (
    <Link href={href} className="flex items-center gap-3 py-3">
      <span className="flex h-8 w-8 items-center justify-center text-[#0071E3]">
        {icon}
      </span>
      <span className="flex-1 text-[16px] text-[#1D1D1F]">{label}</span>
      <ChevronRight className="h-4 w-4 text-[#86868B]" />
    </Link>
  );
}

function LibraryStat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-[26px] font-semibold leading-none text-[#1D1D1F]">
        {value}
      </p>
      <p className="mt-1 text-[14px] text-[#6E6E73]">{label}</p>
    </div>
  );
}

function SheetFrame({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/25 px-4 pb-4 backdrop-blur-sm sm:items-center sm:justify-center sm:p-6">
      <div className="w-full max-w-md rounded-[24px] bg-white p-5 shadow-[0_24px_70px_rgba(0,0,0,0.18)]">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-[22px] font-semibold text-[#1D1D1F]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-black/[0.04] px-3 py-1.5 text-[14px] font-medium text-[#1D1D1F]"
          >
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function EditNameSheet({
  currentName,
  onClose,
  onSave,
}: {
  currentName: string;
  onClose: () => void;
  onSave: (name: string) => Promise<void>;
}) {
  const [name, setName] = useState(currentName);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    void onSave(name.trim())
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Could not update name."),
      )
      .finally(() => setIsSubmitting(false));
  }

  return (
    <SheetFrame title="Edit name" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="mb-2 block text-[14px] text-[#6E6E73]">Name</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-[16px] border border-black/[0.08] bg-white px-4 py-3 text-[16px] outline-none transition focus:border-[#0071E3] focus:ring-4 focus:ring-[#0071E3]/10"
            required
          />
        </label>
        {error ? <p className="text-[14px] text-red-700">{error}</p> : null}
        <button
          type="submit"
          disabled={isSubmitting || !name.trim()}
          className="w-full rounded-full bg-[#0071E3] px-4 py-3.5 text-[15px] font-medium text-white disabled:opacity-60"
        >
          {isSubmitting ? "Saving..." : "Save"}
        </button>
      </form>
    </SheetFrame>
  );
}

function ChangePasswordSheet({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (currentPassword: string, newPassword: string) => Promise<void>;
}) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    void onSave(currentPassword, newPassword)
      .catch((err: unknown) =>
        setError(
          err instanceof Error ? err.message : "Could not change password.",
        ),
      )
      .finally(() => setIsSubmitting(false));
  }

  return (
    <SheetFrame title="Change password" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="mb-2 block text-[14px] text-[#6E6E73]">
            Current password
          </span>
          <input
            type="password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            className="w-full rounded-[16px] border border-black/[0.08] bg-white px-4 py-3 text-[16px] outline-none transition focus:border-[#0071E3] focus:ring-4 focus:ring-[#0071E3]/10"
            required
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-[14px] text-[#6E6E73]">
            New password
          </span>
          <input
            type="password"
            minLength={8}
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            className="w-full rounded-[16px] border border-black/[0.08] bg-white px-4 py-3 text-[16px] outline-none transition focus:border-[#0071E3] focus:ring-4 focus:ring-[#0071E3]/10"
            required
          />
        </label>
        {error ? <p className="text-[14px] text-red-700">{error}</p> : null}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-full bg-[#0071E3] px-4 py-3.5 text-[15px] font-medium text-white disabled:opacity-60"
        >
          {isSubmitting ? "Saving..." : "Save password"}
        </button>
      </form>
    </SheetFrame>
  );
}
