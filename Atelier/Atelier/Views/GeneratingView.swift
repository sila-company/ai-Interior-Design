import SwiftUI

struct GeneratingView: View {
    let roomImage: UIImage
    let style: DesignStyle

    @State private var redesignedImage: UIImage?
    @State private var errorMessage: String?
    @State private var statusText = "Analyzing your room…"

    private let service = OpenAIService()
    private let statusMessages = [
        "Analyzing your room…",
        "Applying your style…",
        "Refining materials and lighting…",
        "Almost there…",
    ]

    var body: some View {
        Group {
            if let redesignedImage {
                ResultsView(
                    originalImage: roomImage,
                    redesignedImage: redesignedImage,
                    style: style
                )
            } else if let errorMessage {
                errorView(message: errorMessage)
            } else {
                loadingView
            }
        }
        .navigationBarBackButtonHidden(redesignedImage == nil && errorMessage == nil)
        .task {
            await runGeneration()
        }
    }

    private var loadingView: some View {
        ZStack {
            AppBackground()

            VStack(spacing: 28) {
                ZStack {
                    Circle()
                        .stroke(Color.black.opacity(0.06), lineWidth: 4)
                        .frame(width: 72, height: 72)

                    ProgressView()
                        .controlSize(.large)
                        .tint(Color(red: 0, green: 0.443, blue: 0.890))
                }

                VStack(spacing: 10) {
                    Text("Creating your redesign")
                        .font(.system(size: 22, weight: .semibold))
                        .foregroundStyle(Color(red: 0.114, green: 0.114, blue: 0.122))

                    Text(statusText)
                        .font(.system(size: 16))
                        .foregroundStyle(Color(red: 0.431, green: 0.431, blue: 0.451))
                        .multilineTextAlignment(.center)
                        .animation(.easeInOut, value: statusText)
                }

                HStack(spacing: 8) {
                    Image(systemName: style.icon)
                    Text(style.name)
                }
                .font(.system(size: 14, weight: .medium))
                .foregroundStyle(Color(red: 0, green: 0.443, blue: 0.890))
                .padding(.horizontal, 14)
                .padding(.vertical, 8)
                .background(Color(red: 0, green: 0.443, blue: 0.890).opacity(0.08), in: Capsule())
            }
            .padding(32)
        }
    }

    private func errorView(message: String) -> some View {
        ZStack {
            AppBackground()

            VStack(spacing: 20) {
                Image(systemName: "exclamationmark.triangle")
                    .font(.system(size: 36, weight: .light))
                    .foregroundStyle(Color(red: 0.8, green: 0.45, blue: 0.2))

                Text("Generation failed")
                    .font(.system(size: 22, weight: .semibold))

                Text(message)
                    .font(.system(size: 15))
                    .foregroundStyle(Color(red: 0.431, green: 0.431, blue: 0.451))
                    .multilineTextAlignment(.center)

                Button {
                    errorMessage = nil
                    redesignedImage = nil
                    Task { await runGeneration() }
                } label: {
                    Text("Try again")
                        .font(.system(size: 15, weight: .medium))
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                }
                .buttonStyle(.plain)
                .foregroundStyle(.white)
                .background(Color(red: 0, green: 0.443, blue: 0.890), in: Capsule())
                .padding(.top, 8)
            }
            .padding(32)
        }
        .navigationTitle("Error")
        .navigationBarTitleDisplayMode(.inline)
    }

    private func runGeneration() async {
        errorMessage = nil
        redesignedImage = nil

        let rotationTask = Task {
            var index = 0
            while !Task.isCancelled {
                try? await Task.sleep(for: .seconds(3))
                index = (index + 1) % statusMessages.count
                await MainActor.run {
                    statusText = statusMessages[index]
                }
            }
        }

        defer { rotationTask.cancel() }

        do {
            let image = try await service.generateRedesign(roomImage: roomImage, style: style)
            await MainActor.run {
                redesignedImage = image
            }
        } catch {
            await MainActor.run {
                errorMessage = error.localizedDescription
            }
        }
    }
}

#Preview {
    NavigationStack {
        GeneratingView(roomImage: UIImage(systemName: "photo")!, style: .catalog[0])
    }
}
