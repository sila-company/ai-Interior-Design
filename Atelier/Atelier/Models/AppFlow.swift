import SwiftUI
import UIKit

@Observable
@MainActor
final class AppFlow {
    var path = NavigationPath()
    var roomImage: UIImage?
    var selectedStyle: DesignStyle?
    var redesignedImage: UIImage?

    func beginWithRoom(_ image: UIImage) {
        roomImage = image
        selectedStyle = nil
        redesignedImage = nil
        path = NavigationPath()
        path.append(AppRoute.styleSelection)
    }

    func selectStyle(_ style: DesignStyle) {
        selectedStyle = style
        path.append(AppRoute.summary)
    }

    func beginGeneration() {
        path.append(AppRoute.generating)
    }

    func completeGeneration(with image: UIImage) {
        redesignedImage = image
        path.append(AppRoute.results)
    }

    func tryAnotherStyle() {
        selectedStyle = nil
        redesignedImage = nil
        path = NavigationPath()
        path.append(AppRoute.styleSelection)
    }

    func startOver() {
        roomImage = nil
        selectedStyle = nil
        redesignedImage = nil
        path = NavigationPath()
    }
}
