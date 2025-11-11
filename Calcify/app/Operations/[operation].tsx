// app/[operation].tsx
import { View, Text, Pressable, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import { operations } from "@/utils/operations";
import TransportationForm from "@/components/problems/TransportationForm";
import LPPForm from "@/components/problems/LppForm";
import ScreenWrapper from "@/components/screenwrapper";
import GraphicalLPPlot from "@/components/problems/GraphicalLPPlot";
import AssignmentForm from "@/components/problems/AssignmentForm";
import NetworkFlowForm from "@/components/problems/NetworkFlowForm";
//import { NetworkFlowVisualizer } from "@/components/networkVisualizer";

const Functions = () => {
  const { operation } = useLocalSearchParams<{ operation: string }>();
  const router = useRouter();

  const [selectedMethod, setSelectedMethod] = useState<string | undefined>();
  const [result, setResult] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [showResult, setShowResult] = useState(false);

  // Loading when operation changes
  useEffect(() => {
    if (!operation) return;

    const opFunction: any = operations[operation as keyof typeof operations];
    if (!opFunction) {
      setResult({ error: "Operation not found" });
      return;
    }

    const res = opFunction();
    setResult(res);
    setShowForm(false);
    setShowResult(false);
  }, [operation]);

  // Handling form submission
  const handleSubmit = (data: any) => {
    const opFunction: any = operations[operation as keyof typeof operations];
    if (!opFunction) return;

    let res: any;

    if (operation === "linearProgrammingProblem") {
      res = opFunction(
        data.method,
        data.numVars,
        data.objective,
        data.objectiveType === "max",
        data.constraints
      );
    } else if (operation === "transportationProblem") {
      res = opFunction(
        selectedMethod,
        data.cost,
        data.supply,
        data.demand
      );
    } else if (operation === "assignmentProblem") {
      res = opFunction(data.numAgents, data.numTasks, data.costMatrix);
    } else if (operation === "networkFlowProblem"){
      res = opFunction(data.activities);
    } else {
      res = opFunction();
    }

    setResult(res);
    setShowResult(true);
    setShowForm(false);
  };

  // Back navigation logic
  const handleBack = () => {
    if (showResult) {
      setShowResult(false);
      setShowForm(true);
    } else if (showForm) {
      setShowForm(false);
      setSelectedMethod(undefined);
    } else {
      router.back();
    }
  };

  const BackButton = () => (
    <Pressable
      onPress={handleBack}
      className="mt-6 mb-4 bg-gray-600 rounded-md p-3 w-24 self-center"
    >
      <Text className="text-center text-white font-semibold">Back</Text>
    </Pressable>
  );

  if (
    result &&
    typeof result === "object" &&
    "prompt" in result &&
    "methods" in result &&
    !showForm &&
    !showResult
  ) {
    return (
      <ScreenWrapper>
        <ScrollView className="p-6 mt-28">
          <Text className="text-3xl font-bold mb-6 capitalize text-black">
            {operation?.replace(/([A-Z])/g, " $1")}
          </Text>

          <Text className="text-lg mb-6 text-black">{result.prompt}</Text>

          {result.methods.map((method: { key: string; label: string }) => (
            <Pressable
              key={method.key}
              className="bg-blue-600 rounded-md p-4 mb-4"
              onPress={() => {
                setSelectedMethod(method.key);
                setShowForm(true);
              }}
            >
              <Text className="text-white text-center text-lg">
                {method.label}
              </Text>
            </Pressable>
          ))}

          <BackButton />
        </ScrollView>
      </ScreenWrapper>
    );
  }

  // Showing the form
  if (showForm) {
    if (operation === "transportationProblem") {
      return (
        <ScreenWrapper>
          <TransportationForm onBack={handleBack} onSubmit={handleSubmit} />
        </ScreenWrapper>
      );
    } else if (operation === "linearProgrammingProblem") {
      return (
        <ScreenWrapper>
          <LPPForm
            selectedMethod={selectedMethod}
            onBack={handleBack}
            onSubmit={handleSubmit}
          />
        </ScreenWrapper>
      );
    } else if (operation === "assignmentProblem") {
      return (
        <ScreenWrapper>
          <AssignmentForm onBack={handleBack} onSubmit={handleSubmit} />
        </ScreenWrapper>
      );
    } else if (operation === "networkFlowProblem") {
      return (
        <ScreenWrapper>
          <NetworkFlowForm onBack={handleBack} onSubmit={handleSubmit} />
        </ScreenWrapper>
      )
    }
  }

  // Showing the result
  if (showResult && result) {
    return (
      <ScreenWrapper>
        <ScrollView className="p-6 mt-28">
          <Text className="text-3xl font-bold mb-4 text-black">Result</Text>

          {result.method === "Graphical Method" ? (
            <>
              <Text className="text-xl font-semibold mb-2 text-black">
                {result.objectiveType} Result
              </Text>
              <Text className="text-black mb-2">
                Best Solution: ({result.bestSolution.point[0].toFixed(2)}, {result.bestSolution.point[1].toFixed(2)})
              </Text>
              <Text className="text-black mb-4">
                Objective Value: {result.bestSolution.value.toFixed(2)}
              </Text>

              {result.plotData && <GraphicalLPPlot plotData={result.plotData} />}
            </>
          ) : operation === "transportationProblem" ? (
          <View className="bg-white rounded-2xl shadow p-6 mb-8">
            <Text className="text-2xl font-bold text-center mb-4 text-blue-700">
              🚚 Transportation Problem Solution
            </Text>

            {/* Method used */}
            <Text className="text-lg text-center text-gray-700 mb-2">
              Method Used: <Text className="font-semibold text-black">{result.method}</Text>
            </Text>

            {/* Total cost */}
            <Text className="text-xl font-bold text-green-700 text-center mb-4">
              💰 Minimum Total Transportation Cost: {result.totalCost?.toFixed(2) ?? "N/A"}
            </Text>

            {/* Allocation Table */}
            <View className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-200">
              <Text className="text-lg font-semibold text-blue-700 mb-2 text-center">
                🧾 Optimal Allocation Table
              </Text>

              {result.allocation && result.costMatrix ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View>
                    {/* Header Row */}
                    <View className="flex-row border-b border-blue-300 mb-1">
                      <View className="w-20 justify-center items-center p-2 bg-blue-100 rounded-l-md">
                        <Text className="font-bold text-blue-800">From ↓ / To →</Text>
                      </View>
                      {result.costMatrix[0].map((_: any, j: number) => (
                        <View
                          key={`head-${j}`}
                          className="w-20 justify-center items-center bg-blue-100 p-2"
                        >
                          <Text className="font-bold text-blue-800">D{j + 1}</Text>
                        </View>
                      ))}
                      <View className="w-24 justify-center items-center bg-blue-100 p-2 rounded-r-md">
                        <Text className="font-bold text-blue-800">Supply</Text>
                      </View>
                    </View>

                    {/* Rows */}
                    {result.allocation.map((row: any[], i: number) => (
                      <View
                        key={`row-${i}`}
                        className="flex-row mb-1 bg-white rounded-md shadow-sm"
                      >
                        <View className="w-20 justify-center items-center p-2 bg-blue-50 rounded-l-md">
                          <Text className="font-bold text-black">A{i + 1}</Text>
                        </View>
                        {row.map((alloc: number, j: number) => (
                          <View
                            key={`cell-${i}-${j}`}
                            className={`w-20 justify-center items-center p-2 ${
                              alloc > 0 ? "bg-green-100 border border-green-300" : "bg-gray-50"
                            }`}
                          >
                            <Text className="text-black">
                              {alloc > 0
                                ? `${alloc} (${result.costMatrix[i][j]})`
                                : "-"}
                            </Text>
                          </View>
                        ))}
                        <View className="w-24 justify-center items-center p-2 bg-blue-50 rounded-r-md">
                          <Text className="font-semibold text-black">
                            {result.supply?.[i] ?? "-"}
                          </Text>
                        </View>
                      </View>
                    ))}

                    {/* Demand Row */}
                    <View className="flex-row bg-blue-100 rounded-md mt-1">
                      <View className="w-20 justify-center items-center p-2 rounded-l-md">
                        <Text className="font-bold text-blue-800">Demand</Text>
                      </View>
                      {result.demand?.map((d: number, j: number) => (
                        <View
                          key={`demand-${j}`}
                          className="w-20 justify-center items-center p-2"
                        >
                          <Text className="font-semibold text-black">{d}</Text>
                        </View>
                      ))}
                      <View className="w-24 p-2 rounded-r-md" />
                    </View>
                  </View>
                </ScrollView>
              ) : (
                <Text className="text-center text-gray-500 italic">
                  No allocation data available.
                </Text>
              )}
            </View>

            {/* Feasibility / Optimization Notes */}
            <View className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
              <Text className="text-lg font-semibold text-yellow-700 mb-2 text-center">
                🧠 Optimization Notes
              </Text>
              {result.isBalanced ? (
                <Text className="text-green-700 text-center">
                  ✅ The problem is balanced. Supply equals demand.
                </Text>
              ) : (
                <Text className="text-red-700 text-center">
                  ⚠️ The problem was unbalanced — dummy source or destination added.
                </Text>
              )}
              {result.method === "MODI" && (
                <Text className="text-gray-800 text-center mt-2">
                  🔍 The solution was optimized using the <Text className="font-semibold">MODI Method</Text>.
                </Text>
              )}
            </View>
          </View>
          ) : operation === "assignmentProblem" ? (
            <View className="bg-white rounded-2xl shadow p-4 mb-6">
              <Text className="text-2xl font-bold text-center mb-4 text-blue-700">
                🧮 Assignment Problem Solution
              </Text>

              {/* Show assignment pairs */}
              {result.assignment?.map((task: number, i: number) => (
                <View
                  key={i}
                  className="flex-row justify-between bg-gray-100 rounded-md p-3 mb-2"
                >
                  <Text className="text-black text-lg font-semibold">
                    👷 Agent {i + 1}
                  </Text>
                  <Text className="text-black text-lg">
                    ➜ Task {task + 1 >= 1 ? task + 1 : "— (Dummy)"}
                  </Text>
                </View>
              ))}

              {/* Total cost */}
              <Text className="text-xl font-bold text-green-700 mt-4 text-center">
                💰 Minimum Total Cost: {result.totalCost.toFixed(2)}
              </Text>

              {/* Perfect assignment status */}
              <Text
                className={`text-center mt-2 ${
                  result.isPerfect ? "text-green-600" : "text-red-600"
                }`}
              >
                {result.isPerfect
                  ? "✅ Perfect Assignment Achieved"
                  : "⚠️ Some agents assigned to dummy tasks"}
              </Text>
            </View>
          ) : operation === "networkFlowProblem" ? (
            <View className="bg-white rounded-2xl shadow p-6 mb-8">
              <Text className="text-2xl font-bold text-center mb-4 text-blue-700">
                🌐 Network Flow Result
              </Text>

              <Text className="text-black text-center mb-4 text-base">
                {result.message}
              </Text>

              {result.isCyclic ? (
                <View className="bg-red-100 border border-red-400 rounded-xl p-4">
                  <Text className="text-red-700 text-center font-semibold text-lg">
                    ❌ The network contains a cycle.
                  </Text>
                  <Text className="text-red-600 text-center">
                    Please revise dependencies to form a Directed Acyclic Graph.
                  </Text>
                </View>
              ) : (
                <>
                  {/* Topological Order */}
                  <View className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-200">
                    <Text className="text-lg font-semibold text-blue-700 mb-2 text-center">
                      🔁 Topological Order
                    </Text>
                    <View className="flex-row flex-wrap justify-center">
                      {result.topologicalOrder?.map((node: string, idx: number) => (
                        <View key={node} className="flex-row items-center mb-2">
                          <View className="bg-blue-600 rounded-full px-3 py-1 mx-1">
                            <Text className="text-white font-bold">{node}</Text>
                          </View>
                          {idx < result.topologicalOrder.length - 1 && (
                            <Text className="text-blue-600 text-lg mx-1">→</Text>
                          )}
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* Adjacency List */}
                  <View className="bg-green-50 rounded-xl p-4 mb-6 border border-green-200">
                    <Text className="text-lg font-semibold text-green-700 mb-2 text-center">
                      🧩 Adjacency List
                    </Text>
                    {Object.entries(result.adjacencyList).map(([node, edges]) => {
                      const successors = edges as string[];
                      return (
                        <View
                          key={node}
                          className="flex-row justify-between bg-white rounded-lg shadow-sm px-4 py-2 mb-2"
                        >
                          <Text className="text-black font-semibold">{node}</Text>
                          <Text className="text-gray-700">
                            → {successors.length ? successors.join(", ") : "∅"}
                          </Text>
                        </View>
                      );
                    })}

                    {/* 🧭 Visual Network Graph */}
                    {/*<View className="mt-6 items-center">
                      <Text className="text-lg font-semibold text-green-700 mb-2 text-center">
                        🔗 Network Graph Visualization
                      </Text>
                      <NetworkFlowVisualizer adjacencyList={result.adjacencyList} />
                    </View>*/}
                  </View>

                  {/* Visual Edges */}
                  <View className="bg-yellow-50 rounded-xl p-4 mb-6 border border-yellow-200">
                    <Text className="text-lg font-semibold text-yellow-700 mb-3 text-center">
                      🕸️ Edges
                    </Text>
                    {result.visualEdges?.map((edge: any, idx: number) => (
                      <Text key={idx} className="text-black text-center mb-1">
                        {edge.from} → {edge.to}
                      </Text>
                    ))}
                  </View>

                  {/* Visual Nodes with Coordinates */}
                  <View className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                    <Text className="text-lg font-semibold text-purple-700 mb-3 text-center">
                      📍 Node Positions
                    </Text>
                    <View className="flex-row justify-between mb-2 px-2">
                      <Text className="font-bold text-black w-1/4 text-left">Node</Text>
                      <Text className="font-bold text-black w-1/4 text-center">X</Text>
                      <Text className="font-bold text-black w-1/4 text-center">Y</Text>
                    </View>
                    {result.visualNodes?.map((n: any) => (
                      <View
                        key={n.id}
                        className="flex-row justify-between bg-white rounded-md shadow-sm p-2 mb-1"
                      >
                        <Text className="text-black w-1/4 text-left font-semibold">
                          {n.id}
                        </Text>
                        <Text className="text-black w-1/4 text-center">{n.x}</Text>
                        <Text className="text-black w-1/4 text-center">{n.y}</Text>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </View>
            ) : (
              <Text className="text-black bg-gray-100 p-4 rounded-md">
                {typeof result === "object"
                  ? JSON.stringify(result, null, 2)
                  : String(result)}
              </Text>
            )}
          <BackButton />
        </ScrollView>
      </ScreenWrapper>
    );
  }

  // Fallback System in case of loading or no operation
  return (
    <ScreenWrapper>
      <View className="flex-1 justify-center items-center p-6">
        <Text className="text-lg text-black">Loading...</Text>
        <BackButton />
      </View>
    </ScreenWrapper>
  );
};

export default Functions;
