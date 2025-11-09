// utils/networkFlow.ts
export interface NetworkNode {
  activity: string;
  predecessors: string[];
}

export interface VisualNode {
  id: string;
  x: number;
  y: number;
}

export interface VisualEdge {
  from: string;
  to: string;
}

export interface NetworkFlowResult {
  isCyclic: boolean;
  topologicalOrder?: string[];
  adjacencyList: Record<string, string[]>;
  message: string;
  visualNodes?: VisualNode[];
  visualEdges?: VisualEdge[];
}

export const networkFlow = (activities: NetworkNode[]): NetworkFlowResult => {
  const adjacencyList: Record<string, string[]> = {};

  for (const node of activities) {
    if (!adjacencyList[node.activity]) adjacencyList[node.activity] = [];
    for (const pred of node.predecessors) {
      if (!adjacencyList[pred]) adjacencyList[pred] = [];
      adjacencyList[pred].push(node.activity);
    }
  }

  const visited: Record<string, boolean> = {};
  const recStack: Record<string, boolean> = {};
  const topologicalOrder: string[] = [];
  //let isCyclic = false;

  const dfs = (node: string) => {
    visited[node] = true;
    recStack[node] = true;

    for (const neighbor of adjacencyList[node] || []) {
      if (!visited[neighbor]) dfs(neighbor);
      //else if (recStack[neighbor]) isCyclic = true;
    }

    recStack[node] = false;
    topologicalOrder.unshift(node);
  };

  for (const node in adjacencyList) {
    if (!visited[node]) dfs(node);
  }

  /*if (isCyclic) {
    return {
      isCyclic: true,
      adjacencyList,
      message: "❌ The network contains a cycle. Fix dependencies.",
    };
  }*/

  // Simple visual coordinates generator (horizontal layers)
  const visualNodes: VisualNode[] = [];
  const visualEdges: VisualEdge[] = [];

  const layerMap: Record<string, number> = {};
  const queue: string[] = [...(topologicalOrder || [])];
  queue.forEach((n, i) => {
    const preds = activities.find((a) => a.activity === n)?.predecessors || [];
    layerMap[n] = preds.length ? Math.max(...preds.map((p) => layerMap[p] ?? 0)) + 1 : 0;
  });

  const grouped = Object.entries(layerMap).reduce<Record<number, string[]>>(
    (acc, [node, layer]) => {
      if (!acc[layer]) acc[layer] = [];
      acc[layer].push(node);
      return acc;
    },
    {}
  );

  const layerHeight = 120;
  const nodeWidth = 100;

  Object.entries(grouped).forEach(([layer, nodes]) => {
    nodes.forEach((node, i) => {
      visualNodes.push({
        id: node,
        x: i * (nodeWidth + 40),
        y: Number(layer) * layerHeight,
      });
    });
  });

  for (const [from, toList] of Object.entries(adjacencyList)) {
    for (const to of toList) {
      visualEdges.push({ from, to });
    }
  }

  return {
    isCyclic: false,
    adjacencyList,
    topologicalOrder,
    message: "✅ Valid network flow. Topological order computed.",
    visualNodes,
    visualEdges,
  };
};
