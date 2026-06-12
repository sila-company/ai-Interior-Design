import SwiftUI
import UIKit

@Observable
@MainActor
final class AppFlow {
    var path = NavigationPath()
    var room: SavedRoom?
    var roomImage: UIImage?
    var selectedStyle: DesignStyle?
    var redesignedImage: UIImage?
    var savedRedesigns: [SavedRedesign] = []

    func openRoom(_ room: SavedRoom, image: UIImage) {
        self.room = room
        roomImage = image
        selectedStyle = nil
        redesignedImage = nil
        path.append(AppRoute.roomDetail)
    }

    func beginNewRedesign() {
        selectedStyle = nil
        redesignedImage = nil
        path.append(AppRoute.styleSelection)
    }

    func viewSavedRedesign(_ redesign: SavedRedesign, image: UIImage, style: DesignStyle) {
        selectedStyle = style
        redesignedImage = image
        path.append(AppRoute.results)
    }

    func beginWithRoom(_ room: SavedRoom, image: UIImage) {
        self.room = room
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
        guard room != nil else { return }
        path = NavigationPath()
        path.append(AppRoute.roomDetail)
        path.append(AppRoute.styleSelection)
    }

    func startOver() {
        room = nil
        roomImage = nil
        selectedStyle = nil
        redesignedImage = nil
        savedRedesigns = []
        path = NavigationPath()
    }
}
