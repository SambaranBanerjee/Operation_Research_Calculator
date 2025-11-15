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
import { Picker } from "@react-native-picker/picker";

type Constraint = { coeffs: number[]; type: "<=" | ">=" | "="; rhs: number };

export interface LPPFormProps {
  onBack: () => void;
  onSubmit: (data: any) => void;
  selectedMethod?: string;
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
      { coeffs: Array(numVars).fill(0), type: ">=", rhs: 0 },
    ]);
  };

  const handleRemove = (index: number) =>
        setConstraints(constraints.filter((_, idx) => idx !== index));

  const handleSubmit = () => {
    if (selectedMethod === "graph" && numVars > 2) {
      setMessage("Graphical Method supports only 2 variables. Please use Simplex.");
      return;
    }
    onSubmit({ method: selectedMethod, numVars, objective, objectiveType, constraints });
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
          Linear Programming Problem
        </Text>

        <Text className="text-lg text-black mb-2">Number of Variables:</Text>
        <TextInput
          className="bg-white text-black rounded-md p-3 mb-4 border border-gray-400"
          keyboardType="numeric"
          value={String(numVars)}
          placeholder="Enter number of variables"
          placeholderTextColor="#000000"
          onChangeText={(t) => {
            const newVal = Number(t) || 0;
            setNumVars(newVal);
            setObjective(Array(newVal).fill(0));
            setConstraints([]);
          }}
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
            className="bg-white text-black rounded-md p-3 mb-2 border border-gray-400"
            keyboardType="numeric"
            placeholder={`x${i + 1}`}
            placeholderTextColor="#000000"
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

        {constraints.map((constraint, idx) => (
          <View key={idx} className="bg-gray-200 p-3 rounded-md mb-3">
            <Text className="text-black mb-2">Constraint {idx + 1}</Text>

            {constraint.coeffs.map((c, j) => (
              <TextInput
                key={j}
                className="bg-white text-black rounded-md p-2 mb-2 border border-gray-400"
                keyboardType="numeric"
                placeholder={`Coeff for x${j + 1}`}
                placeholderTextColor="#000000"
                value={String(c)}
                onChangeText={(t) => {
                  const newConstraints = [...constraints];
                  newConstraints[idx].coeffs[j] = Number(t) || 0;
                  setConstraints(newConstraints);
                }}
              />
            ))}

            {/* ✅ Fixed Dropdown for constraint type */}
            <View className="bg-white rounded-md mb-2 border border-gray-400">
              <Picker
                selectedValue={constraint.type}
                onValueChange={(value) => {
                  const newConstraints = [...constraints];
                  newConstraints[idx].type = value as "<=" | ">=" | "=";
                  setConstraints(newConstraints);
                }}
                style={{ color: '#000000' }}
                dropdownIconColor="#000000"
              >
                <Picker.Item label="≤ (Less than or equal)" value="<=" color="#000000"/>
                <Picker.Item label="≥ (Greater than or equal)" value=">=" color="#000000" />
                <Picker.Item label="= (Equal)" value="=" color="#000000" />
              </Picker>
            </View>

            <TextInput
              className="bg-white text-black rounded-md p-2 border border-gray-400"
              keyboardType="numeric"
              placeholder="Right-hand side"
              placeholderTextColor="#000000"
              value={String(constraint.rhs)}
              onChangeText={(t) => {
                const newConstraints = [...constraints];
                newConstraints[idx].rhs = Number(t) || 0;
                setConstraints(newConstraints);
              }}
            />
            <Pressable
              onPress={() => handleRemove(idx)}
              className="bg-red-500 rounded-md p-2 mt-1"
            >
              <Text className="text-center text-white font-semibold">Remove</Text>
            </Pressable>
          </View>
        ))}

        <Pressable className="bg-green-600 p-3 rounded-md mb-4" onPress={addConstraint}>
          <Text className="text-center text-white">Add Constraint</Text>
        </Pressable>
        
        {message && <Text className="text-red-500 text-center mb-4">{message}</Text>}

        <Pressable className="bg-blue-600 p-3 rounded-md mt-4" onPress={handleSubmit}>
          <Text className="text-center text-white">Solve</Text>
        </Pressable>

        <Pressable className="bg-gray-600 p-3 rounded-md mt-4 mb-6" onPress={onBack}>
          <Text className="text-center text-white">Back</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LPPForm;