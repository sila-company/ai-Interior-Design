import SwiftUI

struct EditNameSheet: View {
    @Environment(AuthManager.self) private var auth
    @Environment(\.dismiss) private var dismiss

    @State private var name: String
    @State private var errorMessage: String?
    @State private var isSaving = false

    init(currentName: String) {
        _name = State(initialValue: currentName)
    }

    private let appleBlue = Color(red: 0, green: 0.443, blue: 0.890)
    private let secondaryText = Color(red: 0.431, green: 0.431, blue: 0.451)

    var body: some View {
        NavigationStack {
            VStack(alignment: .leading, spacing: 20) {
                Text("This is how your name appears in Atelier.")
                    .font(.system(size: 15))
                    .foregroundStyle(secondaryText)

                TextField("Name", text: $name)
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
                    Text(isSaving ? "Saving…" : "Save")
                        .font(.system(size: 15, weight: .medium))
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                }
                .buttonStyle(.plain)
                .foregroundStyle(.white)
                .background(appleBlue, in: Capsule())
                .disabled(isSaving || trimmedName.isEmpty)

                Spacer()
            }
            .padding(24)
            .background(AppBackground())
            .navigationTitle("Edit name")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
            }
        }
    }

    private var trimmedName: String {
        name.trimmingCharacters(in: .whitespacesAndNewlines)
    }

    private func save() {
        isSaving = true
        errorMessage = nil

        Task {
            do {
                try await auth.updateName(trimmedName)
                dismiss()
            } catch {
                errorMessage = error.localizedDescription
            }
            isSaving = false
        }
    }
}
