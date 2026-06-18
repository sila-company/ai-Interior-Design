import SwiftUI

struct ChangePasswordSheet: View {
    @Environment(AuthManager.self) private var auth
    @Environment(\.dismiss) private var dismiss

    @State private var currentPassword = ""
    @State private var newPassword = ""
    @State private var confirmPassword = ""
    @State private var errorMessage: String?
    @State private var isSaving = false

    private let appleBlue = Color(red: 0, green: 0.443, blue: 0.890)
    private let secondaryText = Color(red: 0.431, green: 0.431, blue: 0.451)

    var body: some View {
        NavigationStack {
            VStack(alignment: .leading, spacing: 20) {
                Text("Use at least 8 characters for your new password.")
                    .font(.system(size: 15))
                    .foregroundStyle(secondaryText)

                VStack(spacing: 12) {
                    SecureField("Current password", text: $currentPassword)
                    SecureField("New password", text: $newPassword)
                    SecureField("Confirm new password", text: $confirmPassword)
                }
                .padding()
                .background(.white, in: RoundedRectangle(cornerRadius: 16))

                if let errorMessage {
                    Text(errorMessage)
                        .font(.system(size: 14))
                        .foregroundStyle(.red)
                }

                Button {
                    save()
                } label: {
                    Text(isSaving ? "Updating…" : "Update password")
                        .font(.system(size: 15, weight: .medium))
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                }
                .buttonStyle(.plain)
                .foregroundStyle(.white)
                .background(appleBlue, in: Capsule())
                .disabled(isSaving || !canSave)

                Spacer()
            }
            .padding(24)
            .background(AppBackground())
            .navigationTitle("Change password")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
            }
        }
    }

    private var canSave: Bool {
        !currentPassword.isEmpty && newPassword.count >= 8 && newPassword == confirmPassword
    }

    private func save() {
        guard newPassword == confirmPassword else {
            errorMessage = "New passwords do not match."
            return
        }

        guard newPassword.count >= 8 else {
            errorMessage = "Password must be at least 8 characters."
            return
        }

        isSaving = true
        errorMessage = nil

        Task {
            do {
                try await auth.changePassword(currentPassword: currentPassword, newPassword: newPassword)
                dismiss()
            } catch {
                errorMessage = error.localizedDescription
            }
            isSaving = false
        }
    }
}
