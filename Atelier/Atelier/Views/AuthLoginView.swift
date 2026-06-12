import SwiftUI

struct AuthLoginView: View {
    @Environment(AuthManager.self) private var auth
    @Environment(AppFlow.self) private var flow

    @State private var email = ""
    @State private var password = ""
    @State private var errorMessage: String?
    @State private var isSubmitting = false

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: 24) {
                Text("Welcome back")
                    .font(.system(size: 28, weight: .semibold))
                    .foregroundStyle(Color(red: 0.114, green: 0.114, blue: 0.122))

                Text("Sign in to save rooms and redesigns.")
                    .font(.system(size: 17))
                    .foregroundStyle(Color(red: 0.431, green: 0.431, blue: 0.451))

                VStack(spacing: 16) {
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
                    Text(isSubmitting ? "Please wait…" : "Sign in")
                        .font(.system(size: 15, weight: .medium))
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                }
                .buttonStyle(.plain)
                .foregroundStyle(.white)
                .background(Color(red: 0, green: 0.443, blue: 0.890), in: Capsule())
                .disabled(isSubmitting)

                Button {
                    flow.path.append(AppRoute.register)
                } label: {
                    Text("Create an account")
                        .font(.system(size: 15))
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.plain)
                .foregroundStyle(Color(red: 0, green: 0.443, blue: 0.890))
            }
            .padding(24)
        }
        .background(AppBackground())
        .navigationTitle("Sign in")
        .navigationBarTitleDisplayMode(.inline)
    }

    private func submit() {
        isSubmitting = true
        errorMessage = nil

        Task {
            do {
                try await auth.login(email: email, password: password)
                flow.path = NavigationPath()
            } catch {
                errorMessage = error.localizedDescription
            }
            isSubmitting = false
        }
    }
}
