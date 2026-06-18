import SwiftUI

struct AccountView: View {
    @Environment(AuthManager.self) private var auth
    @Environment(DashboardStore.self) private var dashboard
    @Environment(SubscriptionManager.self) private var subscription
    @Environment(AppFlow.self) private var flow
    @Environment(\.openURL) private var openURL

    @State private var isSigningOut = false
    @State private var showDeleteConfirmation = false
    @State private var isDeletingAccount = false
    @State private var showEditName = false
    @State private var showChangePassword = false
    @State private var actionError: String?

    private let appleBlue = Color(red: 0, green: 0.443, blue: 0.890)
    private let secondaryText = Color(red: 0.431, green: 0.431, blue: 0.451)

    var body: some View {
        ZStack {
            AppBackground()

            ScrollView(showsIndicators: false) {
                VStack(alignment: .leading, spacing: 24) {
                    Text("Account")
                        .font(.system(size: 34, weight: .semibold))
                        .tracking(-0.5)

                    if let user = auth.user {
                        profileCard(for: user)
                        settingsCard
                        membershipCard
                        statsCard
                        legalCard
                        signOutButton
                        deleteAccountButton
                    }

                    if let actionError {
                        Text(actionError)
                            .font(.system(size: 14))
                            .foregroundStyle(.red)
                    }
                }
                .padding(24)
                .padding(.bottom, 16)
            }
        }
        .navigationBarHidden(true)
        .task {
            await dashboard.refresh()
            await subscription.refresh()
        }
        .confirmationDialog(
            "Delete your Atelier account?",
            isPresented: $showDeleteConfirmation,
            titleVisibility: .visible
        ) {
            Button("Delete account", role: .destructive) {
                deleteAccount()
            }
            Button("Cancel", role: .cancel) {}
        } message: {
            Text("This permanently deletes your rooms, redesigns, and account data. If you have an Atelier Membership, you must cancel it separately in Settings → Apple ID → Subscriptions.")
        }
        .sheet(isPresented: $showEditName) {
            if let user = auth.user {
                EditNameSheet(currentName: user.name)
            }
        }
        .sheet(isPresented: $showChangePassword) {
            ChangePasswordSheet()
        }
    }

    private func profileCard(for user: AuthUser) -> some View {
        HStack(spacing: 16) {
            Text(initials(for: user.name))
                .font(.system(size: 22, weight: .semibold))
                .foregroundStyle(.white)
                .frame(width: 56, height: 56)
                .background(appleBlue, in: Circle())

            VStack(alignment: .leading, spacing: 4) {
                Text(user.name)
                    .font(.system(size: 20, weight: .semibold))
                Text(user.email)
                    .font(.system(size: 15))
                    .foregroundStyle(secondaryText)
            }

            Spacer()
        }
        .padding(18)
        .background(.white, in: RoundedRectangle(cornerRadius: 20, style: .continuous))
    }

    private var settingsCard: some View {
        VStack(alignment: .leading, spacing: 0) {
            Text("Settings")
                .font(.system(size: 17, weight: .semibold))
                .padding(.bottom, 12)

            settingsRow(title: "Edit name", icon: "person") {
                showEditName = true
            }

            Divider().padding(.leading, 44)

            settingsRow(title: "Change password", icon: "lock") {
                showChangePassword = true
            }
        }
        .padding(18)
        .background(.white, in: RoundedRectangle(cornerRadius: 20, style: .continuous))
    }

    private var legalCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Legal")
                .font(.system(size: 17, weight: .semibold))

            AccountLegalLinksRow()
        }
        .padding(18)
        .background(.white, in: RoundedRectangle(cornerRadius: 20, style: .continuous))
    }

    private func settingsRow(title: String, icon: String, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            HStack(spacing: 12) {
                Image(systemName: icon)
                    .font(.system(size: 16))
                    .foregroundStyle(appleBlue)
                    .frame(width: 28)

                Text(title)
                    .font(.system(size: 16))
                    .foregroundStyle(Color(red: 0.114, green: 0.114, blue: 0.122))

                Spacer()

                Image(systemName: "chevron.right")
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundStyle(secondaryText)
            }
            .padding(.vertical, 10)
        }
        .buttonStyle(.plain)
    }

    private var membershipCard: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("Membership")
                .font(.system(size: 17, weight: .semibold))

            Text(subscription.membershipStatus.accountSummary)
                .font(.system(size: 15))
                .foregroundStyle(secondaryText)

            if subscription.membershipStatus.isActive {
                Button("Manage subscription") {
                    if let url = URL(string: "https://apps.apple.com/account/subscriptions") {
                        openURL(url)
                    }
                }
                .font(.system(size: 15, weight: .medium))
                .foregroundStyle(appleBlue)
            } else {
                Button {
                    flow.path.append(AppRoute.membership)
                } label: {
                    Text(subscription.membershipStatus.freeRemaining > 0 ? "View membership" : "Subscribe for unlimited")
                        .font(.system(size: 15, weight: .medium))
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                }
                .buttonStyle(.plain)
                .foregroundStyle(.white)
                .background(appleBlue, in: Capsule())
            }
        }
        .padding(18)
        .background(.white, in: RoundedRectangle(cornerRadius: 20, style: .continuous))
    }

    private var statsCard: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("Your library")
                .font(.system(size: 17, weight: .semibold))

            HStack {
                libraryStat(value: "\(dashboard.rooms.count)", label: "Rooms")
                Spacer()
                libraryStat(value: "\(dashboard.redesigns.count)", label: "Redesigns")
            }
        }
        .padding(18)
        .background(.white, in: RoundedRectangle(cornerRadius: 20, style: .continuous))
    }

    private func libraryStat(value: String, label: String) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(value)
                .font(.system(size: 24, weight: .semibold))
            Text(label)
                .font(.system(size: 14))
                .foregroundStyle(secondaryText)
        }
    }

    private var signOutButton: some View {
        Button {
            isSigningOut = true
            Task {
                await auth.logout()
                isSigningOut = false
            }
        } label: {
            Text(isSigningOut ? "Signing out…" : "Sign out")
                .font(.system(size: 15, weight: .medium))
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
        }
        .buttonStyle(.plain)
        .foregroundStyle(Color(red: 0.8, green: 0.25, blue: 0.2))
        .background(Color(red: 0.8, green: 0.25, blue: 0.2).opacity(0.08), in: Capsule())
        .disabled(isSigningOut)
    }

    private var deleteAccountButton: some View {
        Button {
            showDeleteConfirmation = true
        } label: {
            Text(isDeletingAccount ? "Deleting account…" : "Delete account")
                .font(.system(size: 15, weight: .medium))
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
        }
        .buttonStyle(.plain)
        .foregroundStyle(Color(red: 0.8, green: 0.25, blue: 0.2))
        .disabled(isDeletingAccount)
    }

    private func deleteAccount() {
        isDeletingAccount = true
        actionError = nil

        Task {
            do {
                try await auth.deleteAccount()
            } catch {
                actionError = error.localizedDescription
            }
            isDeletingAccount = false
        }
    }

    private func initials(for name: String) -> String {
        let parts = name.split(separator: " ").prefix(2)
        let letters = parts.compactMap { $0.first.map(String.init) }
        return letters.joined().uppercased()
    }
}
