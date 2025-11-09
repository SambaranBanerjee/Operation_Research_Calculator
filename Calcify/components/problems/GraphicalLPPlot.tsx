// components/problems/GraphicalLPPlot.tsx
import React from "react";
import { View, Text } from "react-native";
import Svg, {
  Line,
  Polygon,
  Circle,
  Text as SvgText,
  Rect,
} from "react-native-svg";

interface Point {
  x: number;
  y: number;
}

interface GraphicalLPPlotProps {
  plotData: {
    constraintLines: { constraint: string; points: Point[] }[];
    feasibleRegion: Point[];
    optimalPoint: number[];
  };
}

const GraphicalLPPlot: React.FC<GraphicalLPPlotProps> = ({ plotData }) => {
  const { constraintLines, feasibleRegion, optimalPoint } = plotData;

  const SCALE = 25;
  const WIDTH = 340;
  const HEIGHT = 320;
  const MARGIN = 40;
  const XMAX = (WIDTH - MARGIN) / SCALE;
  const YMAX = (HEIGHT - MARGIN) / SCALE;

  const transformX = (x: number) => x * SCALE + MARGIN;
  const transformY = (y: number) => HEIGHT - y * SCALE - MARGIN / 2;

  const colors = [
    "#1E88E5",
    "#D81B60",
    "#43A047",
    "#F4511E",
    "#8E24AA",
    "#00897B",
  ];

  return (
    <View className="items-center mt-4">
      <Text className="text-lg font-bold text-black mb-2">Graphical Solution</Text>

      <Svg height={HEIGHT} width={WIDTH} style={{ backgroundColor: "#fefefe", borderRadius: 10 }}>
        {/* Gridlines */}
        {Array.from({ length: Math.floor(XMAX) + 1 }).map((_, i) => (
          <Line
            key={`v-${i}`}
            x1={transformX(i)}
            y1={transformY(0)}
            x2={transformX(i)}
            y2={transformY(YMAX + 1)}
            stroke="#e0e0e0"
            strokeWidth="1"
          />
        ))}
        {Array.from({ length: Math.floor(YMAX) + 1 }).map((_, i) => (
          <Line
            key={`h-${i}`}
            x1={transformX(0)}
            y1={transformY(i)}
            x2={transformX(XMAX + 1)}
            y2={transformY(i)}
            stroke="#e0e0e0"
            strokeWidth="1"
          />
        ))}

        {/* Axes */}
        <Line x1={MARGIN} y1={transformY(0)} x2={WIDTH - 10} y2={transformY(0)} stroke="black" strokeWidth="2" />
        <Line x1={MARGIN} y1={transformY(0)} x2={MARGIN} y2={transformY(YMAX + 1)} stroke="black" strokeWidth="2" />

        {/* Axis labels */}
        <SvgText x={WIDTH - 15} y={transformY(0) - 5} fontSize="12" fill="black">x</SvgText>
        <SvgText x={MARGIN - 15} y={transformY(YMAX + 0.8)} fontSize="12" fill="black">y</SvgText>

        {/* Axis ticks */}
        {Array.from({ length: Math.floor(XMAX) + 1 }).map((_, i) => (
          <SvgText
            key={`xtick-${i}`}
            x={transformX(i)}
            y={transformY(0) + 15}
            fontSize="10"
            fill="#444"
            textAnchor="middle"
          >
            {i}
          </SvgText>
        ))}
        {Array.from({ length: Math.floor(YMAX) + 1 }).map((_, i) => (
          <SvgText
            key={`ytick-${i}`}
            x={transformX(0) - 12}
            y={transformY(i) + 4}
            fontSize="10"
            fill="#444"
            textAnchor="end"
          >
            {i}
          </SvgText>
        ))}

        {/* Feasible Region */}
        {feasibleRegion.length > 2 ? (
          <Polygon
            points={feasibleRegion.map(p => `${transformX(p.x)},${transformY(p.y)}`).join(" ")}
            fill="rgba(0,200,0,0.25)"
            stroke="green"
          />
        ) : (
          <SvgText
            x={WIDTH / 2 - 40}
            y={HEIGHT / 2}
            fontSize="14"
            fill="red"
            fontWeight="bold"
          >
            No Feasible Region
          </SvgText>
        )}

        {/* Constraint Lines + Labels */}
        {constraintLines.map((line, i) => {
          const p1 = line.points[0];
          const p2 = line.points[line.points.length - 1];
          const midX = (p1.x + p2.x) / 2;
          const midY = (p1.y + p2.y) / 2;
          const color = colors[i % colors.length];

          return (
            <React.Fragment key={i}>
              <Line
                x1={transformX(p1.x)}
                y1={transformY(p1.y)}
                x2={transformX(p2.x)}
                y2={transformY(p2.y)}
                stroke={color}
                strokeWidth="2"
              />
              {/* Background for text label */}
              <Rect
                x={transformX(midX) - 25}
                y={transformY(midY) - 15}
                width="50"
                height="14"
                fill="white"
                opacity="0.8"
                rx="3"
              />
              <SvgText
                x={transformX(midX)}
                y={transformY(midY) - 5}
                fontSize="10"
                fill={color}
                textAnchor="middle"
                fontWeight="bold"
              >
                {line.constraint}
              </SvgText>
            </React.Fragment>
          );
        })}

        {/* Optimal point */}
        <Circle
          cx={transformX(optimalPoint[0])}
          cy={transformY(optimalPoint[1])}
          r="5"
          fill="red"
        />
        <SvgText
          x={transformX(optimalPoint[0]) + 10}
          y={transformY(optimalPoint[1]) - 8}
          fontSize="12"
          fill="black"
          fontWeight="bold"
        >
          ({optimalPoint[0].toFixed(2)}, {optimalPoint[1].toFixed(2)})
        </SvgText>
      </Svg>

      {/* Legend */}
      <View className="flex-row items-center justify-center mt-3 bg-gray-100 p-2 rounded-xl w-11/12">
        <View className="flex-row items-center mr-4">
          <View className="w-3 h-3 bg-green-400 mr-1 rounded-full" />
          <Text className="text-xs text-gray-700">Feasible Region</Text>
        </View>
        <View className="flex-row items-center mr-4">
          <View className="w-3 h-3 bg-red-500 mr-1 rounded-full" />
          <Text className="text-xs text-gray-700">Optimal Point</Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-3 h-3 bg-blue-400 mr-1 rounded-full" />
          <Text className="text-xs text-gray-700">Constraints</Text>
        </View>
      </View>
    </View>
  );
};

export default GraphicalLPPlot;
