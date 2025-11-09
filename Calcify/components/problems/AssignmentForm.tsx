// components/problems/AssignmentForm.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

interface AssignmentFormProps {
  onBack: () => void;
  onSubmit: (data: any) => void;
}

const AssignmentForm: React.FC<AssignmentFormProps> = ({ onBack, onSubmit }) => {
  const [numAgents, setNumAgents] = useState(3);
  const [numTasks, setNumTasks] = useState(3);
  const [costMatrix, setCostMatrix] = useState<number[][]>(
    Array(3)
      .fill(0)
      .map(() => Array(3).fill(0))
  );

  const handleChange = (i: number, j: number, value: string) => {
    const newMatrix = [...costMatrix];
    newMatrix[i][j] = Number(value) || 0;
    setCostMatrix(newMatrix);
  };

  const handleSubmit = () => {
    onSubmit({ numAgents, numTasks, costMatrix });
  };

  const handleSizeChange = (agents: number, tasks: number) => {
    const newMatrix = Array(agents)
      .fill(0)
      .map(() => Array(tasks).fill(0));
    setNumAgents(agents);
    setNumTasks(tasks);
    setCostMatrix(newMatrix);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView
        showsVerticalScrollIndicator
        className="p-6 mt-20"
        contentContainerStyle={{ paddingBottom: 150 }}
      >
        <Text className="text-3xl font-bold text-black mb-4">
          Assignment Problem
        </Text>

        <Text className="text-lg text-black mb-2">Number of Agents:</Text>
        <TextInput
          className="bg-white rounded-md p-3 mb-4"
          keyboardType="numeric"
          value={String(numAgents)}
          onChangeText={(t) =>
            handleSizeChange(Number(t) || 0, numTasks)
          }
        />

        <Text className="text-lg text-black mb-2">Number of Tasks:</Text>
        <TextInput
          className="bg-white rounded-md p-3 mb-4"
          keyboardType="numeric"
          value={String(numTasks)}
          onChangeText={(t) =>
            handleSizeChange(numAgents, Number(t) || 0)
          }
        />

        <Text className="text-lg text-black mb-4">Cost Matrix:</Text>

        {costMatrix.map((row, i) => (
          <View key={i} className="flex-row justify-between mb-3">
            {row.map((value, j) => (
              <TextInput
                key={j}
                className="bg-white rounded-md p-2 text-center flex-1 mx-1"
                keyboardType="numeric"
                placeholder={`C${i + 1}${j + 1}`}
                value={String(value)}
                onChangeText={(t) => handleChange(i, j, t)}
              />
            ))}
          </View>
        ))}

        <Pressable
          className="bg-blue-600 p-3 rounded-md mt-6"
          onPress={handleSubmit}
        >
          <Text className="text-center text-white font-semibold">
            Solve
          </Text>
        </Pressable>

        <Pressable
          className="bg-gray-600 p-3 rounded-md mt-4 mb-6"
          onPress={onBack}
        >
          <Text className="text-center text-white font-semibold">Back</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AssignmentForm;
