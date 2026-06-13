import SwiftUI

struct GeneratingView: View {
    @Environment(AppFlow.self) private var flow

    @State private var errorMessage: String?
    @State private var statusText = "Analyzing your room…"
    @State private var hasStarted = false

    private let service = AtelierAPIService()
    private let statusMessages = [
        "Analyzing your room…",
        "Matching shoppable products…",
        "Staging only inventory items…",
        "Checking product accuracy…",
        "Almost there…",
    ]

    var body: some View {
        Group {
            if let errorMessage {
                errorView(message: errorMessage)
            } else {
                loadingView
            }
        }
        .navigationBarBackButtonHidden(errorMessage == nil)
        .task {
            guard !hasStarted else { return }
            hasStarted = true
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

                if let style = flow.selectedStyle {
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
                    hasStarted = false
                    Task {
                        hasStarted = true
                        await runGeneration()
                    }
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
        guard let room = flow.room, let style = flow.selectedStyle else {
            await MainActor.run {
                errorMessage = "Missing room or style."
            }
            return
        }

        errorMessage = nil

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
            let image = try await service.generateRedesign(
                roomId: room.id,
                style: style,
                products: flow.selectedProducts
            )
            await MainActor.run {
                flow.completeGeneration(with: image)
            }
        } catch {
            await MainActor.run {
                errorMessage = error.localizedDescription
            }
        }
    }
}

#Preview {
    let flow = AppFlow()
    flow.roomImage = UIImage(systemName: "photo")
    flow.selectedStyle = .catalog[0]

    return NavigationStack {
        GeneratingView()
            .environment(flow)
    }
}
