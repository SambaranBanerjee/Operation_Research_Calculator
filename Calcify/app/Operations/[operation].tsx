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
            <View className="bg-white rounded-2xl shadow p-4 mb-6">
              <Text className="text-2xl font-bold text-center mb-4 text-blue-700">
                🌐 Network Flow Result
              </Text>
              <Text className="text-black text-center mb-3">{result.message}</Text>

              {result.isCyclic ? (
                <Text className="text-red-600 text-center">
                  ❌ The network contains a cycle. Cannot compute order.
                </Text>
              ) : (
                <>
                  <Text className="text-lg font-semibold text-black mb-2">Topological Order:</Text>
                  <Text className="text-black mb-4 bg-gray-100 rounded-md p-3 text-center">
                    {result.topologicalOrder?.join(" → ")}
                  </Text>

                  <Text className="text-lg font-semibold text-black mb-2">Adjacency List:</Text>
                  <Text className="text-black bg-gray-100 rounded-md p-3">
                    {JSON.stringify(result.adjacencyList, null, 2)}
                  </Text>

                  <Text className="text-lg font-semibold text-black mt-4 mb-2">Visualization Data:</Text>
                  <Text className="text-black bg-gray-50 rounded-md p-3">
                    {JSON.stringify(result.visualNodes, null, 2)}
                  </Text>
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
