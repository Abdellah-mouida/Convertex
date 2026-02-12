import { Converter, Edge, Node } from "./def";
import * as cvs from "./exporter";

const nodes: Record<string, Node> = {};

const converters = cvs as Record<string, Converter>;
console.log(converters);
Object.keys(converters).map((key) => {
  const converter = converters[key as keyof typeof converters];

  nodes[converter.to] = nodes[converter.to] || {
    type: converter.to,
    edges: [],
  };
  nodes[converter.from] = nodes[converter.from] || {
    type: converter.from,
    edges: [],
  };

  nodes[converter.from].edges.push({
    converter,
    from: nodes[converter.from],
    to: nodes[converter.to],
  });
});

export { nodes };

export const findConverter = (from: string, to: string): Converter | null => {
  const foundedConverter = Object.keys(converters).find(
    (c) => converters[c].from === from && converters[c].to === to,
  );

  if (!foundedConverter) return null;
  return converters[foundedConverter];
};

// export const findPath = (from: string, to: string): Edge[] | null => {
//   if (from === to) return [];

//   const start = nodes[from];
//   const end = nodes[to];

//   if (!start || !end) return null;

//   const visited = new Set<Node>();
//   const parent = new Map<Node, { prev: Node; edge: Edge }>();

//   const queue: Node[] = [start];
//   let head = 0;

//   visited.add(start);

//   while (head < queue.length) {
//     const current = queue[head++];

//     for (const edge of current.edges) {
//       const next = edge.to;

//       if (visited.has(next)) continue;

//       visited.add(next);
//       parent.set(next, { prev: current, edge });

//       if (next === end) {
//         // Reconstruct path of edges
//         const path: Edge[] = [];
//         let node: Node = end;

//         while (node !== start) {
//           const entry = parent.get(node)!;
//           path.unshift(entry.edge);
//           node = entry.prev;
//         }

//         return path;
//       }

//       queue.push(next);
//     }
//   }

//   return null;
// };
