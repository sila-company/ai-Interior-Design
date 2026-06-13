import SwiftUI
import UIKit

@Observable
@MainActor
final class AppFlow {
    var path = NavigationPath()
    var room: SavedRoom?
    var roomImage: UIImage?
    var selectedStyle: DesignStyle?
    var selectedProducts: [ShoppableProduct] = []
    var redesignedImage: UIImage?
    var savedRedesigns: [SavedRedesign] = []

    func openRoom(_ room: SavedRoom, image: UIImage) {
        self.room = room
        roomImage = image
        selectedStyle = nil
        selectedProducts = []
        redesignedImage = nil
        path.append(AppRoute.roomDetail)
    }

    func beginNewRedesign() {
        selectedStyle = nil
        selectedProducts = []
        redesignedImage = nil
        path.append(AppRoute.styleSelection)
    }

    func viewSavedRedesign(_ redesign: SavedRedesign, image: UIImage, style: DesignStyle) {
        selectedStyle = style
        selectedProducts = ProductCatalog.bundle(for: room?.name, style: style)
        redesignedImage = image
        path.append(AppRoute.results)
    }

    func beginWithRoom(_ room: SavedRoom, image: UIImage) {
        self.room = room
        roomImage = image
        selectedStyle = nil
        selectedProducts = []
        redesignedImage = nil
        path = NavigationPath()
        path.append(AppRoute.styleSelection)
    }

    func selectStyle(_ style: DesignStyle) {
        selectedStyle = style
        selectedProducts = ProductCatalog.bundle(for: room?.name, style: style)
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
        selectedProducts = []
        redesignedImage = nil
        savedRedesigns = []
        path = NavigationPath()
    }
}
