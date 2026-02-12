export interface Converter {
  (buf: Buffer): Promise<Buffer>;
  from: string;
  to: string;
}
export type Edge = {
  converter: Converter;
  from: Node;
  to: Node;
};
export type Node = {
  type: string;
  edges: Edge[];
};
