/* eslint-disable @typescript-eslint/no-unused-vars */
// components/problems/GraphicalLPPlot.tsx
import React, { useRef, useState } from "react";
import { View, Text, PanResponder, Dimensions } from "react-native";
import Svg, {
  Line,
  Polygon,
  Circle,
  Text as SvgText,
  Rect,
  G,
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

  // Zoom and pan state
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });

  const BASE_SCALE = 25;
  const WIDTH = 340;
  const HEIGHT = 320;
  const MARGIN = 40;
  const XMAX = (WIDTH - MARGIN) / BASE_SCALE;
  const YMAX = (HEIGHT - MARGIN) / BASE_SCALE;

  const transformX = (x: number) => (x * BASE_SCALE + MARGIN) * scale + translateX;
  const transformY = (y: number) => (HEIGHT - y * BASE_SCALE - MARGIN / 2) * scale + translateY;

  const colors = [
    "#1E88E5",
    "#D81B60",
    "#43A047",
    "#F4511E",
    "#8E24AA",
    "#00897B",
  ];

  // Pan responder for pinch-to-zoom and panning
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      
      onPanResponderGrant: (evt) => {
        // Check if it's a multi-touch (pinch)
        if (evt.nativeEvent.touches.length === 2) {
          const touch1 = evt.nativeEvent.touches[0];
          const touch2 = evt.nativeEvent.touches[1];
          const dx = touch1.pageX - touch2.pageX;
          const dy = touch1.pageY - touch2.pageY;
          setLastPanPoint({ x: Math.sqrt(dx * dx + dy * dy), y: 0 });
        } else {
          // Single touch for panning
          setLastPanPoint({ x: evt.nativeEvent.pageX, y: evt.nativeEvent.pageY });
        }
      },

      onPanResponderMove: (evt, gestureState) => {
        if (evt.nativeEvent.touches.length === 2) {
          // Pinch to zoom
          const touch1 = evt.nativeEvent.touches[0];
          const touch2 = evt.nativeEvent.touches[1];
          const dx = touch1.pageX - touch2.pageX;
          const dy = touch1.pageY - touch2.pageY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (lastPanPoint.x !== 0) {
            const zoomFactor = distance / lastPanPoint.x;
            const newScale = Math.max(0.5, Math.min(3, scale * zoomFactor));
            setScale(newScale);
          }
          setLastPanPoint({ x: distance, y: 0 });
        } else {
          // Panning
          const { pageX, pageY } = evt.nativeEvent;
          const deltaX = pageX - lastPanPoint.x;
          const deltaY = pageY - lastPanPoint.y;
          
          setTranslateX(prev => prev + deltaX);
          setTranslateY(prev => prev + deltaY);
          setLastPanPoint({ x: pageX, y: pageY });
        }
      },

      onPanResponderRelease: () => {
        setLastPanPoint({ x: 0, y: 0 });
      },
    })
  ).current;

  // Reset zoom and pan
  const resetView = () => {
    setScale(1);
    setTranslateX(0);
    setTranslateY(0);
  };

  return (
    <View className="items-center mt-4">
      <Text className="text-lg font-bold text-black mb-2">Graphical Solution</Text>
      
      {/* Controls */}
      <View className="flex-row justify-between w-full mb-2 px-4">
        <Text className="text-sm text-gray-600">Pinch to zoom • Drag to pan</Text>
        <Text 
          className="text-sm text-blue-600 font-semibold"
          onPress={resetView}
        >
          Reset View
        </Text>
      </View>

      <View 
        {...panResponder.panHandlers}
        style={{ 
          backgroundColor: "#fefefe", 
          borderRadius: 10,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: "#e0e0e0"
        }}
      >
        <Svg 
          height={HEIGHT} 
          width={WIDTH} 
          style={{ 
            transform: [{ scale }, { translateX }, { translateY }] 
          }}
        >
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
          <Line 
            x1={transformX(0)} 
            y1={transformY(0)} 
            x2={transformX(XMAX + 1)} 
            y2={transformY(0)} 
            stroke="black" 
            strokeWidth="2" 
          />
          <Line 
            x1={transformX(0)} 
            y1={transformY(0)} 
            x2={transformX(0)} 
            y2={transformY(YMAX + 1)} 
            stroke="black" 
            strokeWidth="2" 
          />

          {/* Axis labels */}
          <SvgText 
            x={transformX(XMAX + 0.8)} 
            y={transformY(0) - 5} 
            fontSize="12" 
            fill="black"
          >
            x
          </SvgText>
          <SvgText 
            x={transformX(0) - 15} 
            y={transformY(YMAX + 0.8)} 
            fontSize="12" 
            fill="black"
          >
            y
          </SvgText>

          {/* Axis ticks */}
          {Array.from({ length: Math.floor(XMAX) + 1 }).map((_, i) => (
            <React.Fragment key={`xtick-${i}`}>
              <Line
                x1={transformX(i)}
                y1={transformY(0)}
                x2={transformX(i)}
                y2={transformY(-0.1)}
                stroke="black"
                strokeWidth="1"
              />
              <SvgText
                x={transformX(i)}
                y={transformY(-0.3)}
                fontSize="10"
                fill="#444"
                textAnchor="middle"
              >
                {i}
              </SvgText>
            </React.Fragment>
          ))}
          {Array.from({ length: Math.floor(YMAX) + 1 }).map((_, i) => (
            <React.Fragment key={`ytick-${i}`}>
              <Line
                x1={transformX(0)}
                y1={transformY(i)}
                x2={transformX(-0.1)}
                y2={transformY(i)}
                stroke="black"
                strokeWidth="1"
              />
              <SvgText
                x={transformX(-0.3)}
                y={transformY(i) + 4}
                fontSize="10"
                fill="#444"
                textAnchor="end"
              >
                {i}
              </SvgText>
            </React.Fragment>
          ))}

          {/* Feasible Region */}
          {feasibleRegion.length > 2 ? (
            <Polygon
              points={feasibleRegion.map(p => `${transformX(p.x)},${transformY(p.y)}`).join(" ")}
              fill="rgba(0,200,0,0.25)"
              stroke="green"
              strokeWidth="1.5"
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
                  strokeWidth="2.5"
                />
                {/* Background for text label */}
                <Rect
                  x={transformX(midX) - 25}
                  y={transformY(midY) - 15}
                  width="50"
                  height="14"
                  fill="white"
                  opacity="0.9"
                  rx="3"
                  stroke={color}
                  strokeWidth="0.5"
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
            r="6"
            fill="red"
            stroke="white"
            strokeWidth="1.5"
          />
          <SvgText
            x={transformX(optimalPoint[0]) + 12}
            y={transformY(optimalPoint[1]) - 8}
            fontSize="12"
            fill="black"
            fontWeight="bold"
          >
            ({optimalPoint[0].toFixed(2)}, {optimalPoint[1].toFixed(2)})
          </SvgText>
        </Svg>
      </View>

      {/* Zoom indicator */}
      <View className="flex-row items-center justify-center mt-2">
        <Text className="text-xs text-gray-600 mr-2">Zoom: {(scale * 100).toFixed(0)}%</Text>
        <View className="h-1 w-16 bg-gray-300 rounded-full">
          <View 
            className="h-1 bg-blue-500 rounded-full"
            style={{ width: `${Math.min(100, (scale / 3) * 100)}%` }}
          />
        </View>
      </View>

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