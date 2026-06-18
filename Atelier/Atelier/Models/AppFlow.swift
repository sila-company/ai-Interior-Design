import SwiftUI
import UIKit

@Observable
@MainActor
final class AppFlow {
    var path = NavigationPath()
    var selectedTab: MainTab = .home
    var room: SavedRoom?
    var roomImage: UIImage?
    var selectedStyle: DesignStyle?
    var customStyleDescription: String?
    var selectedProducts: [ShoppableProduct] = []
    var redesignedImage: UIImage?
    var savedRedesigns: [SavedRedesign] = []

    func openRoom(_ room: SavedRoom, image: UIImage) {
        self.room = room
        roomImage = image
        selectedStyle = nil
        customStyleDescription = nil
        selectedProducts = []
        redesignedImage = nil
        path.append(AppRoute.roomDetail)
    }

    func beginNewRedesign() {
        selectedStyle = nil
        customStyleDescription = nil
        selectedProducts = []
        redesignedImage = nil
        path.append(AppRoute.styleSelection)
    }

    func viewSavedRedesign(_ redesign: SavedRedesign, image: UIImage, style: DesignStyle) {
        selectedStyle = style.id == "custom" ? nil : style
        customStyleDescription = style.id == "custom" ? style.description : nil
        selectedProducts = redesign.products
        redesignedImage = image
        path.append(AppRoute.results)
    }

    func beginWithRoom(_ room: SavedRoom, image: UIImage) {
        self.room = room
        roomImage = image
        selectedStyle = nil
        customStyleDescription = nil
        selectedProducts = []
        redesignedImage = nil
        path = NavigationPath()
        path.append(AppRoute.styleSelection)
    }

    func selectStyle(_ style: DesignStyle) {
        selectedStyle = style
        customStyleDescription = nil
        selectedProducts = []
        path.append(AppRoute.summary)
    }

    func selectCustomStyle(_ description: String) {
        selectedStyle = nil
        customStyleDescription = description
        selectedProducts = []
        path.append(AppRoute.summary)
    }

    var hasStyleChoice: Bool {
        selectedStyle != nil
            || !(customStyleDescription?.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ?? true)
    }

    var styleDisplayName: String {
        selectedStyle?.name ?? "Custom style"
    }

    func showGenerating() {
        path.append(AppRoute.generating)
    }

    func completeGeneration(with image: UIImage) {
        redesignedImage = image
        path.append(AppRoute.results)
    }

    func tryAnotherStyle() {
        selectedStyle = nil
        customStyleDescription = nil
        selectedProducts = []
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
        customStyleDescription = nil
        selectedProducts = []
        redesignedImage = nil
        savedRedesigns = []
        selectedTab = .home
        path = NavigationPath()
    }
}
