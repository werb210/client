import type { SelectedProduct } from "../types/application";

export type ApplicationState = {
  selectedProduct?: SelectedProduct;
};

export const initialApplicationState: ApplicationState = {};

export function setSelectedProduct(state: ApplicationState, p: SelectedProduct) {
  state.selectedProduct = p;
}
