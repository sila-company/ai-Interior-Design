import SwiftUI

struct AccountView: View {
    @Environment(AuthManager.self) private var auth
    @Environment(DashboardStore.self) private var dashboard

    @State private var isSigningOut = false

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
                        statsCard
                        signOutButton
                    }
                }
                .padding(24)
                .padding(.bottom, 16)
            }
        }
        .navigationBarHidden(true)
        .task { await dashboard.refresh() }
    }

    private func profileCard(for user: AuthUser) -> some View {
        HStack(spacing: 16) {
            Text(initials(for: user.name))
                .font(.system(size: 22, weight: .semibold))
                .foregroundStyle(.white)
                .frame(width: 56, height: 56)
                .background(Color(red: 0, green: 0.443, blue: 0.890), in: Circle())

            VStack(alignment: .leading, spacing: 4) {
                Text(user.name)
                    .font(.system(size: 20, weight: .semibold))
                Text(user.email)
                    .font(.system(size: 15))
                    .foregroundStyle(Color(red: 0.431, green: 0.431, blue: 0.451))
            }

            Spacer()
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
                .foregroundStyle(Color(red: 0.431, green: 0.431, blue: 0.451))
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

    private func initials(for name: String) -> String {
        let parts = name.split(separator: " ").prefix(2)
        let letters = parts.compactMap { $0.first.map(String.init) }
        return letters.joined().uppercased()
    }
}
