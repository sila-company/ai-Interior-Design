import {
  createProject,
  saveUserProfile,
  listFurnitureItems,
  listCartItems,
  addCartItem,
  removeCartItem,
  createOrder,
} from "@workspace/api-client-react";
import type {
  CreateProjectInput,
  UserProfileInput,
  AddCartItemInput,
} from "@workspace/api-client-react";

export class DatabaseService {
  static async createProject(input: CreateProjectInput) {
    return createProject(input);
  }

  static async saveUserProfile(input: UserProfileInput) {
    return saveUserProfile(input);
  }

  static async listFurnitureItems(projectId?: string) {
    return listFurnitureItems(projectId ? { projectId } : undefined);
  }

  static async listCartItems() {
    return listCartItems();
  }

  static async addCartItem(input: AddCartItemInput) {
    return addCartItem(input);
  }

  static async removeCartItem(id: string) {
    return removeCartItem(id);
  }

  static async createOrder() {
    return createOrder();
  }
}
