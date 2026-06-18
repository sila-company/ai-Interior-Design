import SwiftUI

struct GenerationStatusBanner: View {
    @Environment(AppFlow.self) private var flow
    @Environment(RedesignGenerationStore.self) private var generation

    private let appleBlue = Color(red: 0, green: 0.443, blue: 0.890)
    private let primaryText = Color(red: 0.114, green: 0.114, blue: 0.122)
    private let secondaryText = Color(red: 0.431, green: 0.431, blue: 0.451)

    var body: some View {
        switch generation.status {
        case .running:
            runningBanner
        case .succeeded:
            succeededBanner
        case .failed(let message):
            failedBanner(message: message)
        case .idle:
            EmptyView()
        }
    }

    private var runningBanner: some View {
        Button {
            generation.showGeneratingScreen(flow: flow)
        } label: {
            VStack(alignment: .leading, spacing: 10) {
                HStack(spacing: 10) {
                    ProgressView()
                        .controlSize(.small)
                        .tint(appleBlue)

                    VStack(alignment: .leading, spacing: 2) {
                        Text("Creating \(generation.roomName)")
                            .font(.system(size: 15, weight: .semibold))
                            .foregroundStyle(primaryText)
                        Text(subtitleText)
                            .font(.system(size: 13))
                            .foregroundStyle(secondaryText)
                            .lineLimit(1)
                    }

                    Spacer(minLength: 0)

                    Image(systemName: "chevron.right")
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundStyle(secondaryText)
                }

                ProgressView(value: generation.progress)
                    .progressViewStyle(.linear)
                    .tint(appleBlue)

                Text("Tap to open progress")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundStyle(appleBlue)
            }
            .padding(14)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(.white, in: RoundedRectangle(cornerRadius: 18, style: .continuous))
            .shadow(color: .black.opacity(0.08), radius: 12, y: 4)
            .contentShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
        }
        .buttonStyle(.plain)
    }

    private var subtitleText: String {
        let percent = Int(generation.progress * 100)
        return "\(generation.styleName) · \(percent)% · \(generation.statusMessage)"
    }

    private var succeededBanner: some View {
        HStack(spacing: 12) {
            Image(systemName: "checkmark.circle.fill")
                .font(.system(size: 22))
                .foregroundStyle(appleBlue)

            VStack(alignment: .leading, spacing: 2) {
                Text("\(generation.roomName) is ready")
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundStyle(primaryText)
                Text("\(generation.styleName) redesign finished")
                    .font(.system(size: 13))
                    .foregroundStyle(secondaryText)
            }

            Spacer()

            Button("View") {
                generation.openResults(flow: flow)
            }
            .font(.system(size: 14, weight: .semibold))
            .foregroundStyle(appleBlue)

            Button {
                generation.dismissFinishedJob()
            } label: {
                Image(systemName: "xmark")
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundStyle(secondaryText)
                    .padding(6)
            }
            .buttonStyle(.plain)
        }
        .padding(14)
        .background(.white, in: RoundedRectangle(cornerRadius: 18, style: .continuous))
        .shadow(color: .black.opacity(0.08), radius: 12, y: 4)
    }

    private func failedBanner(message: String) -> some View {
        Button {
            generation.showGeneratingScreen(flow: flow)
        } label: {
            VStack(alignment: .leading, spacing: 10) {
                HStack(spacing: 10) {
                    Image(systemName: "exclamationmark.triangle.fill")
                        .foregroundStyle(Color(red: 0.8, green: 0.45, blue: 0.2))

                    VStack(alignment: .leading, spacing: 2) {
                        Text("Redesign failed")
                            .font(.system(size: 15, weight: .semibold))
                            .foregroundStyle(primaryText)
                        Text(message)
                            .font(.system(size: 13))
                            .foregroundStyle(secondaryText)
                            .lineLimit(2)
                    }

                    Spacer()

                    Image(systemName: "chevron.right")
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundStyle(secondaryText)
                }

                Text("Tap to view details")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundStyle(appleBlue)
            }
            .padding(14)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(.white, in: RoundedRectangle(cornerRadius: 18, style: .continuous))
            .shadow(color: .black.opacity(0.08), radius: 12, y: 4)
            .contentShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
        }
        .buttonStyle(.plain)
    }
}
