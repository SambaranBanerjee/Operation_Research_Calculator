// components/problems/LppForm.tsx
import React, { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView } from "react-native";

type Constraint = { coeffs: number[]; type: "<=" | ">=" | "="; rhs: number };

export interface LPPFormProps {
  onBack: () => void;
  onSubmit: (data: any) => void;
  selectedMethod?: string; // This is for choosing between Graphical and Simplex
}

const LPPForm: React.FC<LPPFormProps> = ({ onBack, onSubmit, selectedMethod }) => {
  const [numVars, setNumVars] = useState(2);
  const [objectiveType, setObjectiveType] = useState("max");
  const [objective, setObjective] = useState<number[]>(Array(numVars).fill(0));
  const [constraints, setConstraints] = useState<Constraint[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const addConstraint = () => {
    setConstraints([
      ...constraints,
      { coeffs: Array(numVars).fill(0), type: "<=", rhs: 0 },
    ]);
  };

  const handleSubmit = () => {
    if (selectedMethod === "graph" && numVars > 2) {
      setMessage("Graphical Method supports only 2 variables. Please use Simplex.");
      return;
    }
    onSubmit({ method: selectedMethod, numVars, objective, objectiveType, constraints });
  };

  return (
    <ScrollView showsVerticalScrollIndicator={true} className="p-6 mt-20">
      <Text className="text-3xl font-bold text-black mb-4">
        Linear Programming Problem
      </Text>

      <Text className="text-lg text-black mb-2">Number of Variables:</Text>
      <TextInput
        className="bg-white rounded-md p-3 mb-4"
        keyboardType="numeric"
        value={String(numVars)}
        onChangeText={(t) => setNumVars(Number(t) || 0)}
      />

      <Text className="text-lg text-black mb-2">Objective Type:</Text>
      <View className="flex-row mb-4">
        <Pressable
          className={`flex-1 p-3 rounded-l-md ${
            objectiveType === "max" ? "bg-blue-500" : "bg-gray-400"
          }`}
          onPress={() => setObjectiveType("max")}
        >
          <Text className="text-center text-white">Maximize</Text>
        </Pressable>
        <Pressable
          className={`flex-1 p-3 rounded-r-md ${
            objectiveType === "min" ? "bg-blue-500" : "bg-gray-400"
          }`}
          onPress={() => setObjectiveType("min")}
        >
          <Text className="text-center text-white">Minimize</Text>
        </Pressable>
      </View>

      <Text className="text-lg text-black mb-2">Objective Coefficients:</Text>
      {Array.from({ length: numVars }).map((_, i) => (
        <TextInput
          key={i}
          className="bg-white rounded-md p-3 mb-2"
          keyboardType="numeric"
          placeholder={`x${i + 1}`}
          value={String(objective[i])}
          onChangeText={(t) =>
            setObjective((prev) => {
              const copy = [...prev];
              copy[i] = Number(t) || 0;
              return copy;
            })
          }
        />
      ))}

      <Pressable
        className="bg-green-600 p-3 rounded-md mb-4"
        onPress={addConstraint}
      >
        <Text className="text-center text-white">Add Constraint</Text>
      </Pressable>

      {constraints.map((constraint, idx) => (
        <View key={idx} className="bg-gray-200 p-3 rounded-md mb-3">
          <Text className="text-black mb-2">Constraint {idx + 1}</Text>
          {constraint.coeffs.map((c, j) => (
            <TextInput
              key={j}
              className="bg-white rounded-md p-2 mb-2"
              keyboardType="numeric"
              placeholder={`Coeff for x${j + 1}`}
              value={String(c)}
              onChangeText={(t) => {
                const newConstraints = [...constraints];
                newConstraints[idx].coeffs[j] = Number(t) || 0;
                setConstraints(newConstraints);
              }}
            />
          ))}
          <TextInput
            className="bg-white rounded-md p-2 mb-2"
            placeholder="<=, >=, ="
            value={constraint.type}
            onChangeText={(t) => {
              const newConstraints = [...constraints];
              if (t === "<=" || t === ">=" || t === "=") {
                newConstraints[idx].type = t;
                setConstraints(newConstraints);
              }
            }}
          />
          <TextInput
            className="bg-white rounded-md p-2"
            keyboardType="numeric"
            placeholder="Right-hand side"
            value={String(constraint.rhs)}
            onChangeText={(t) => {
              const newConstraints = [...constraints];
              newConstraints[idx].rhs = Number(t) || 0;
              setConstraints(newConstraints);
            }}
          />
        </View>
      ))}

      {message && (
        <Text className="text-red-500 text-center mb-4">{message}</Text>
      )}

      <Pressable
        className="bg-blue-600 p-3 rounded-md mt-4"
        onPress={handleSubmit}
      >
        <Text className="text-center text-white">Solve</Text>
      </Pressable>

      <Pressable
        className="bg-gray-600 p-3 rounded-md mt-4"
        onPress={onBack}
      >
        <Text className="text-center text-white">Back</Text>
      </Pressable>
    </ScrollView>
  );
};

export default LPPForm;
