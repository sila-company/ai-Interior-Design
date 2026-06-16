import SwiftUI

struct GeneratingView: View {
    @Environment(AppFlow.self) private var flow
    @Environment(RedesignGenerationStore.self) private var generation

    private let appleBlue = Color(red: 0, green: 0.443, blue: 0.890)
    private let primaryText = Color(red: 0.114, green: 0.114, blue: 0.122)
    private let secondaryText = Color(red: 0.431, green: 0.431, blue: 0.451)

    var body: some View {
        Group {
            if case .failed = generation.status {
                errorView
            } else {
                loadingView
            }
        }
        .navigationBarBackButtonHidden(generation.isActive)
    }

    private var loadingView: some View {
        ZStack {
            AppBackground()

            VStack(spacing: 28) {
                VStack(spacing: 16) {
                    Text("\(Int(generation.progress * 100))%")
                        .font(.system(size: 34, weight: .semibold))
                        .foregroundStyle(primaryText)
                        .monospacedDigit()
                        .contentTransition(.numericText())
                        .animation(.linear(duration: 0.25), value: generation.progress)

                    ProgressView(value: generation.progress)
                        .progressViewStyle(.linear)
                        .tint(appleBlue)
                        .frame(maxWidth: 280)
                        .animation(.linear(duration: 0.25), value: generation.progress)

                    if let remaining = generation.estimatedTimeRemainingText {
                        Text(remaining)
                            .font(.system(size: 14, weight: .medium))
                            .foregroundStyle(secondaryText)
                    }
                }

                VStack(spacing: 10) {
                    Text("Creating your redesign")
                        .font(.system(size: 22, weight: .semibold))
                        .foregroundStyle(primaryText)

                    Text(generation.statusMessage)
                        .font(.system(size: 16))
                        .foregroundStyle(secondaryText)
                        .multilineTextAlignment(.center)
                        .animation(.easeInOut, value: generation.statusMessage)
                }

                if let style = flow.selectedStyle {
                    HStack(spacing: 8) {
                        Image(systemName: style.icon)
                        Text(style.name)
                    }
                    .font(.system(size: 14, weight: .medium))
                    .foregroundStyle(appleBlue)
                    .padding(.horizontal, 14)
                    .padding(.vertical, 8)
                    .background(appleBlue.opacity(0.08), in: Capsule())
                } else if flow.customStyleDescription != nil {
                    HStack(spacing: 8) {
                        Image(systemName: "text.quote")
                        Text("Custom style")
                    }
                    .font(.system(size: 14, weight: .medium))
                    .foregroundStyle(appleBlue)
                    .padding(.horizontal, 14)
                    .padding(.vertical, 8)
                    .background(appleBlue.opacity(0.08), in: Capsule())
                }

                if generation.isActive {
                    Button {
                        generation.moveToBackground(flow: flow)
                    } label: {
                        Text("Continue browsing")
                            .font(.system(size: 15, weight: .medium))
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 14)
                    }
                    .buttonStyle(.plain)
                    .foregroundStyle(appleBlue)
                    .background(appleBlue.opacity(0.08), in: Capsule())
                    .padding(.top, 8)
                    .frame(maxWidth: 280)

                    Text("We'll keep working while you explore Home or your rooms. Most redesigns finish in about a minute.")
                        .font(.system(size: 13))
                        .foregroundStyle(secondaryText)
                        .multilineTextAlignment(.center)
                        .frame(maxWidth: 280)
                }
            }
            .padding(32)
        }
    }

    private var errorView: some View {
        ZStack {
            AppBackground()

            VStack(spacing: 20) {
                Image(systemName: "exclamationmark.triangle")
                    .font(.system(size: 36, weight: .light))
                    .foregroundStyle(Color(red: 0.8, green: 0.45, blue: 0.2))

                Text("Generation failed")
                    .font(.system(size: 22, weight: .semibold))

                Text(generation.statusMessage)
                    .font(.system(size: 15))
                    .foregroundStyle(secondaryText)
                    .multilineTextAlignment(.center)

                Button {
                    generation.retry(flow: flow)
                } label: {
                    Text("Try again")
                        .font(.system(size: 15, weight: .medium))
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                }
                .buttonStyle(.plain)
                .foregroundStyle(.white)
                .background(appleBlue, in: Capsule())
                .padding(.top, 8)

                Button("Go to Home") {
                    generation.moveToBackground(flow: flow)
                }
                .font(.system(size: 15, weight: .medium))
                .foregroundStyle(appleBlue)
            }
            .padding(32)
        }
        .navigationTitle("Error")
        .navigationBarTitleDisplayMode(.inline)
    }
}

#Preview {
    NavigationStack {
        GeneratingView()
            .environment(AppFlow())
            .environment(RedesignGenerationStore())
    }
}
