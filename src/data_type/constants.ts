export enum CanvasOrderDirection {
  backwards = "backwards",
  forwards = "forwards",
  back = "back",
  front = "front",
}
export const DEFAULT_FONT: string = "Open Sans";
export const DEFAULT_TSHIRT_ID: string = "tshirt_0001";
export const DEFAULT_TSHIRT_COLOR: string = "#333333";
export const DEFAULT_TEXT_INPUT: string = "Text";
export enum Color {
  white = "#FFFFFF",
  black = "#000000",
};
// foreground takes a hex value (will need to be consistent with the color value format)
export const DEFAULT_FG: string = Color.black;  // black