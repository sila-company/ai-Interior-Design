import SwiftUI
import UIKit

@Observable
@MainActor
final class RedesignGenerationStore {
    enum Status: Equatable {
        case idle
        case running(progress: Double, message: String)
        case succeeded
        case failed(String)
    }

    private(set) var status: Status = .idle
    private(set) var roomName = ""
    private(set) var styleName = ""
    private(set) var isBackgrounded = false

    private var room: SavedRoom?
    private var style: DesignStyle?
    private var customStyleDescription: String?
    private var generationTask: Task<Void, Never>?
    private var progressTask: Task<Void, Never>?
    private var backgroundTaskID: UIBackgroundTaskIdentifier = .invalid
    private var startedAt: Date?

    private let service = AtelierAPIService(redesignSession: APIConfiguration.redesignSession)
    private let statusMessages = [
        "Analyzing your room…",
        "Matching shoppable products…",
        "Staging only inventory items…",
        "Rendering the final image…",
        "Waiting for the finished redesign…",
    ]

    var isActive: Bool {
        if case .running = status { return true }
        return false
    }

    var showsFloatingBanner: Bool {
        switch status {
        case .idle:
            return false
        case .running, .succeeded, .failed:
            return isBackgrounded
        }
    }

    var progress: Double {
        switch status {
        case .running(let progress, _):
            return progress
        case .succeeded:
            return 1
        default:
            return 0
        }
    }

    var statusMessage: String {
        switch status {
        case .running(_, let message):
            return message
        case .succeeded:
            return "Your redesign is ready!"
        case .failed(let message):
            return message
        case .idle:
            return ""
        }
    }

    func start(room: SavedRoom, flow: AppFlow) {
        guard !isActive else { return }
        guard flow.hasStyleChoice else { return }

        self.room = room
        self.style = flow.selectedStyle
        self.customStyleDescription = flow.customStyleDescription
        roomName = room.name
        styleName = flow.styleDisplayName
        isBackgrounded = false
        startedAt = Date()
        status = .running(progress: 0.02, message: statusMessages[0])
        beginBackgroundExecution()

        generationTask?.cancel()
        progressTask?.cancel()

        progressTask = Task { await trackProgress() }
        generationTask = Task {
            do {
                let result = try await service.generateRedesign(
                    roomId: room.id,
                    style: flow.selectedStyle,
                    customStyleDescription: flow.customStyleDescription
                )
                progressTask?.cancel()

                await MainActor.run {
                    flow.selectedProducts = result.products
                    flow.redesignedImage = result.image
                }

                status = .running(progress: 1, message: "Your redesign is ready!")
                try? await Task.sleep(for: .milliseconds(400))

                await MainActor.run {
                    status = .succeeded
                    generationTask = nil
                    progressTask = nil
                    startedAt = nil
                    endBackgroundExecution()
                    if !isBackgrounded {
                        flow.path.append(AppRoute.results)
                        clearFinishedJob()
                    }
                }
            } catch is CancellationError {
                endBackgroundExecution()
                return
            } catch {
                progressTask?.cancel()
                await MainActor.run {
                    status = .failed(error.localizedDescription)
                    startedAt = nil
                    endBackgroundExecution()
                }
            }
        }
    }

    func retry(flow: AppFlow) {
        guard let room else { return }
        status = .idle
        start(room: room, flow: flow)
    }

    func moveToBackground(flow: AppFlow) {
        guard isActive else { return }
        isBackgrounded = true
        flow.selectedTab = .home
        flow.path = NavigationPath()
    }

    func showGeneratingScreen(flow: AppFlow) {
        switch status {
        case .running, .failed:
            flow.path.append(AppRoute.generating)
            isBackgrounded = false
        default:
            break
        }
    }

    func openResults(flow: AppFlow) {
        guard case .succeeded = status else { return }
        isBackgrounded = false
        flow.path = NavigationPath()
        flow.path.append(AppRoute.results)
        clearFinishedJob()
    }

    func dismissFinishedJob() {
        clearFinishedJob()
    }

    func reset() {
        generationTask?.cancel()
        progressTask?.cancel()
        generationTask = nil
        progressTask = nil
        startedAt = nil
        endBackgroundExecution()
        status = .idle
        isBackgrounded = false
        room = nil
        style = nil
        customStyleDescription = nil
        roomName = ""
        styleName = ""
    }

    private func clearFinishedJob() {
        generationTask = nil
        progressTask = nil
        startedAt = nil
        endBackgroundExecution()
        status = .idle
        isBackgrounded = false
        room = nil
        style = nil
        customStyleDescription = nil
        roomName = ""
        styleName = ""
    }

    private func trackProgress() async {
        guard let startedAt else { return }

        while !Task.isCancelled {
            try? await Task.sleep(for: .milliseconds(250))
            guard case .running = status else { return }

            let elapsed = Date().timeIntervalSince(startedAt)

            let messageIndex: Int
            switch elapsed {
            case 0..<8:
                messageIndex = 0
            case 8..<20:
                messageIndex = 1
            case 20..<45:
                messageIndex = 2
            case 45..<90:
                messageIndex = 3
            default:
                messageIndex = 4
            }

            status = .running(
                progress: 0,
                message: statusMessages[messageIndex]
            )
        }
    }

    private func beginBackgroundExecution() {
        endBackgroundExecution()
        backgroundTaskID = UIApplication.shared.beginBackgroundTask(withName: "RedesignGeneration") { [weak self] in
            Task { @MainActor in
                self?.endBackgroundExecution()
            }
        }
    }

    private func endBackgroundExecution() {
        guard backgroundTaskID != .invalid else { return }
        UIApplication.shared.endBackgroundTask(backgroundTaskID)
        backgroundTaskID = .invalid
    }
}
