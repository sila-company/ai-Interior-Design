import SwiftUI

struct AuthRegisterView: View {
    @Environment(AuthManager.self) private var auth
    @Environment(AppFlow.self) private var flow

    @State private var name = ""
    @State private var email = ""
    @State private var password = ""
    @State private var errorMessage: String?
    @State private var isSubmitting = false

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: 24) {
                Text("Join Atelier")
                    .font(.system(size: 28, weight: .semibold))

                Text("Save every room and redesign in one place.")
                    .font(.system(size: 17))
                    .foregroundStyle(Color(red: 0.431, green: 0.431, blue: 0.451))

                VStack(spacing: 16) {
                    TextField("Name", text: $name)
                        .padding()
                        .background(.white, in: RoundedRectangle(cornerRadius: 16))

                    TextField("Email", text: $email)
                        .textInputAutocapitalization(.never)
                        .keyboardType(.emailAddress)
                        .padding()
                        .background(.white, in: RoundedRectangle(cornerRadius: 16))

                    SecureField("Password", text: $password)
                        .padding()
                        .background(.white, in: RoundedRectangle(cornerRadius: 16))
                }

                if let errorMessage {
                    Text(errorMessage)
                        .font(.system(size: 14))
                        .foregroundStyle(.red)
                }

                Button {
                    submit()
                } label: {
                    Text(isSubmitting ? "Please wait…" : "Create account")
                        .font(.system(size: 15, weight: .medium))
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                }
                .buttonStyle(.plain)
                .foregroundStyle(.white)
                .background(Color(red: 0, green: 0.443, blue: 0.890), in: Capsule())
                .disabled(isSubmitting)
            }
            .padding(24)
        }
        .background(AppBackground())
        .navigationTitle("Create account")
        .navigationBarTitleDisplayMode(.inline)
    }

    private func submit() {
        isSubmitting = true
        errorMessage = nil

        Task {
            do {
                try await auth.register(
                    name: name.trimmingCharacters(in: .whitespacesAndNewlines),
                    email: email,
                    password: password
                )
                flow.path = NavigationPath()
            } catch {
                errorMessage = error.localizedDescription
            }
            isSubmitting = false
        }
    }
}
