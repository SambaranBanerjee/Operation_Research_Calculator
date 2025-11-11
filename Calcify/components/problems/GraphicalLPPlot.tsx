// // components/GraphicalLPPlot.tsx
// import React from "react";
// import { View } from "react-native";
// import Svg, { Line, Polygon, Circle, Text as SvgText } from "react-native-svg";
// import {
//   Gesture,
//   GestureDetector,
// } from "react-native-gesture-handler";
// import Animated, {
//   useSharedValue,
//   useAnimatedStyle,
//   withTiming,
// } from "react-native-reanimated";

// const AnimatedView = Animated.createAnimatedComponent(View);

// const GraphicalLPPlot = ({ plotData }: { plotData: any }) => {
//   const scale = useSharedValue(1);
//   const savedScale = useSharedValue(1);

//   const translateX = useSharedValue(0);
//   const translateY = useSharedValue(0);
//   const savedTranslateX = useSharedValue(0);
//   const savedTranslateY = useSharedValue(0);

//   // 🔍 Pinch Zoom Gesture
//   const pinchGesture = Gesture.Pinch()
//     .onUpdate((e) => {
//       scale.value = savedScale.value * e.scale;
//     })
//     .onEnd(() => {
//       savedScale.value = scale.value;
//       if (scale.value < 0.8) {
//         scale.value = withTiming(1);
//         savedScale.value = 1;
//       }
//     });

//   // ✋ Pan Gesture (translation)
//   const panGesture = Gesture.Pan()
//     .onUpdate((e) => {
//       translateX.value = savedTranslateX.value + e.translationX;
//       translateY.value = savedTranslateY.value + e.translationY;
//     })
//     .onEnd(() => {
//       savedTranslateX.value = translateX.value;
//       savedTranslateY.value = translateY.value;
//     });

//   const composed = Gesture.Simultaneous(pinchGesture, panGesture);

//   // 🌀 Animated Transform
//   const animatedStyle = useAnimatedStyle(() => ({
//     transform: [
//       { translateX: translateX.value },
//       { translateY: translateY.value },
//       { scale: scale.value },
//     ],
//   }));

//   return (
//     <View style={{ overflow: "visible" }} className="bg-white rounded-xl shadow-md mt-4 p-2 overflow-hidden">
//       <GestureDetector gesture={composed}>
//         <AnimatedView style={[{ alignItems: "center" }, animatedStyle]}>
//           <Svg height={300} width={300}>
//             {/* Axes */}
//             <Line x1="0" y1="150" x2="300" y2="150" stroke="gray" strokeWidth="1" />
//             <Line x1="150" y1="0" x2="150" y2="300" stroke="gray" strokeWidth="1" />

//             {/* Feasible region */}
//             {plotData?.region && (
//               <Polygon
//                 points={plotData.region.join(" ")}
//                 fill="rgba(0,200,0,0.3)"
//                 stroke="green"
//                 strokeWidth="2"
//               />
//             )}

//             {/* Optimal point */}
//             {plotData?.bestPoint && (
//               <Circle
//                 cx={plotData.bestPoint[0]}
//                 cy={plotData.bestPoint[1]}
//                 r="6"
//                 fill="red"
//               />
//             )}

//             {/* Axis labels */}
//             <SvgText x="280" y="160" fill="black" fontSize="10">
//               X
//             </SvgText>
//             <SvgText x="160" y="10" fill="black" fontSize="10">
//               Y
//             </SvgText>
//           </Svg>
//         </AnimatedView>
//       </GestureDetector>
//     </View>
//   );
// };

// export default GraphicalLPPlot;
