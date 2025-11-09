import React from "react";
import { View, useWindowDimensions } from "react-native";
import Svg, { Circle, Text as SvgText, Line, Polygon } from "react-native-svg";

type AdjList = Record<string, string[]>;

interface NetworkFlowVisualizerProps {
  adjacencyList: AdjList;
  width?: number;
  height?: number;
  nodeRadius?: number;
}

/**
 * Safe NetworkFlowVisualizer — draws nodes, directed edges and arrowheads without Marker.
 */
export const NetworkFlowVisualizer: React.FC<NetworkFlowVisualizerProps> = ({
  adjacencyList,
  width = 350,
  height = 300,
  nodeRadius = 18,
}) => {
  // defensive: if adjacencyList is falsy, render nothing
  if (!adjacencyList || typeof adjacencyList !== "object") {
    return <View />;
  }

  // Prepare nodes and positions (grid layout)
  const nodes = Object.keys(adjacencyList);
  const count = nodes.length;
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const dims = useWindowDimensions();
  // Allow responsive fallback if width prop small
  const canvasW = Math.min(width, Math.max(300, dims.width - 40));
  const canvasH = height;

  // grid layout: cols x rows
  const cols = Math.ceil(Math.sqrt(count || 1));
  const rows = Math.ceil((count || 1) / cols);

  const paddingX = 24;
  const paddingY = 24;
  const usableW = canvasW - paddingX * 2;
  const usableH = canvasH - paddingY * 2;

  // avoid division by zero
  const xStep = cols > 1 ? usableW / (cols - 1) : 0;
  const yStep = rows > 1 ? usableH / (rows - 1) : 0;

  const nodePos: Record<string, { x: number; y: number }> = {};
  nodes.forEach((n, idx) => {
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    const x = paddingX + (cols > 1 ? col * xStep : usableW / 2);
    const y = paddingY + (rows > 1 ? row * yStep : usableH / 2);
    nodePos[n] = { x, y };
  });

  // helper to compute arrow triangle points (small triangle pointing along line)
  const makeArrowPoints = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    arrowLen = 10,
    arrowWidth = 6
  ) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.hypot(dx, dy) || 1;
    // unit vector from start->end
    const ux = dx / dist;
    const uy = dy / dist;
    // base point of arrow head (a little before end, so it doesn't overlap node circle)
    const baseX = x2 - ux * (nodeRadius + 2); // keep clear of node circle
    const baseY = y2 - uy * (nodeRadius + 2);
    // point (tip)
    const tipX = x2 - ux * (nodeRadius * 0.2);
    const tipY = y2 - uy * (nodeRadius * 0.2);

    // perpendicular vector
    const px = -uy;
    const py = ux;

    const leftX = baseX - ux * arrowLen + px * (arrowWidth / 2);
    const leftY = baseY - uy * arrowLen + py * (arrowWidth / 2);
    const rightX = baseX - ux * arrowLen - px * (arrowWidth / 2);
    const rightY = baseY - uy * arrowLen - py * (arrowWidth / 2);

    // triangle points: tip, left, right
    return `${tipX},${tipY} ${leftX},${leftY} ${rightX},${rightY}`;
  };

  return (
    <View className="items-center justify-center my-4">
      <Svg width={canvasW} height={canvasH}>
        {/* Draw edges (lines) first */}
        {nodes.map((from) => {
          const targets = adjacencyList[from] ?? [];
          return targets.map((to, idx) => {
            const start = nodePos[from];
            const end = nodePos[to];
            if (!start || !end) return null;

            // shorten line to avoid overlapping node circles
            const dx = end.x - start.x;
            const dy = end.y - start.y;
            const dist = Math.hypot(dx, dy) || 1;
            const ux = dx / dist;
            const uy = dy / dist;

            const sx = start.x + ux * nodeRadius;
            const sy = start.y + uy * nodeRadius;
            const ex = end.x - ux * nodeRadius;
            const ey = end.y - uy * nodeRadius;

            const arrowPoints = makeArrowPoints(sx, sy, ex, ey, 10, 8);

            return (
              <React.Fragment key={`${from}-${to}-${idx}`}>
                <Line
                  x1={sx}
                  y1={sy}
                  x2={ex}
                  y2={ey}
                  stroke="#333"
                  strokeWidth={2}
                  strokeLinecap="round"
                />
                {/* arrow head */}
                <Polygon points={arrowPoints} fill="#333" />
              </React.Fragment>
            );
          });
        })}

        {/* Draw nodes on top */}
        {nodes.map((n) => {
          const pos = nodePos[n];
          if (!pos) return null;
          return (
            <React.Fragment key={`node-${n}`}>
              <Circle cx={pos.x} cy={pos.y} r={nodeRadius} fill="#2563EB" />
              <SvgText
                x={pos.x}
                y={pos.y + 4} // small vertical offset to vertically center text
                fontSize={12}
                fill="#fff"
                fontWeight="700"
                textAnchor="middle"
              >
                {n}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
};

export default NetworkFlowVisualizer;
