import { Text, View, Pressable, TextInput, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { operations } from '@/utils/operations';

const Functions = () => {
  const { operation } = useLocalSearchParams<{ operation: string }>();
  const router = useRouter();

  const [selectedMethod, setSelectedMethod] = useState<string | undefined>();
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [costMatrix, setCostMatrix] = useState<string[][]>([['']]);
  const [supply, setSupply] = useState<string[]>(['']);
  const [demand, setDemand] = useState<string[]>(['']);
  const [showForm, setShowForm] = useState(false);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (operation && operation in operations) {
      const opFunction = operations[operation as keyof typeof operations];
      try {
        const res = opFunction(selectedMethod as any);
        setResult(res);
        setError(null);
      } catch (e) {
        console.error(e);
        setError('Error executing operation');
      }
    } else {
      setError('Operation not found');
      setResult(null);
    }
  }, [operation, selectedMethod]);

  const handleMatrixSize = (rows: number, cols: number) => {
    if (rows <= 0 || cols <= 0) return;
    setCostMatrix(Array(rows).fill(null).map(() => Array(cols).fill('')));
    setSupply(Array(rows).fill(''));
    setDemand(Array(cols).fill(''));
  };

  const handleSubmit = () => {
    try {
      const cost = costMatrix.map(row => row.map(Number));
      const s = supply.map(Number);
      const d = demand.map(Number);

      if (
        cost.some(row => row.some(isNaN)) ||
        s.some(isNaN) ||
        d.some(isNaN)
      ) {
        setError('Please fill all inputs with valid numbers.');
        return;
      }

      const opFunction = operations[operation as keyof typeof operations];
      const res = opFunction(selectedMethod as any, cost, s, d);

      setResult(res);
      setShowForm(false);
      setShowResult(true);
      setError(null);
    } catch (e) {
      console.error(e);
      setError('Invalid input or error executing method');
    }
  };

  const handleBack = () => {
    if (showResult) {
      setShowResult(false);
      setShowForm(true);
    } else if (showForm) {
      setShowForm(false);
      setSelectedMethod(undefined);
      setResult(null);
    } else {
      router.back(); // go back to search page
    }
  };


  const BackButton = () => (
    <Pressable onPress={handleBack} className="mt-4 mb-4 bg-gray-500 rounded-md p-3 w-200">
      <Text className="text-center text-white font-semibold">Back</Text>
    </Pressable>
  );

  // --- STEP 1: Choose Method ---
  if (
    result &&
    typeof result === 'object' &&
    'prompt' in result &&
    'methods' in result &&
    !showForm &&
    !showResult
  ) {
    return (
      <View className="p-6 mt-32">
        <Text className="text-3xl font-bold mb-6">Functions</Text>
        <Text className="text-lg mb-6">{result.prompt}</Text>
        {result.methods.map((method: { key: string; label: string }) => (
          <Pressable
            key={method.key}
            className="bg-blue-600 rounded-md p-4 mb-4"
            onPress={() => {
              setSelectedMethod(method.key);
              setShowForm(true);
            }}
          >
            <Text className="text-white text-center">{method.label}</Text>
          </Pressable>
        ))}
        <BackButton />
      </View>
    );
  }

  // --- STEP 2: Input Cost, Supply, Demand ---
  if (showForm) {
    return (
      <ScrollView className="p-6 mt-32">
        <Text className="text-2xl font-bold mb-4">Enter Transportation Details</Text>

        {/* Matrix Size Input */}
        <View className="flex-row justify-between mb-4">
          <View className="flex-1 mr-2">
            <Text className="text-lg mb-1">Rows</Text>
            <TextInput
              className="border border-gray-400 rounded-md p-2 text-center"
              placeholder="e.g. 3"
              keyboardType="numeric"
              onChangeText={(text) =>
                handleMatrixSize(Number(text || 0), costMatrix[0]?.length || 1)
              }
            />
          </View>
          <View className="flex-1 ml-2">
            <Text className="text-lg mb-1">Columns</Text>
            <TextInput
              className="border border-gray-400 rounded-md p-2 text-center"
              placeholder="e.g. 4"
              keyboardType="numeric"
              onChangeText={(text) =>
                handleMatrixSize(costMatrix.length || 1, Number(text || 0))
              }
            />
          </View>
        </View>

        {/* Cost Matrix */}
        <View className="mt-4">
          <Text className="text-lg font-semibold mb-2">Cost Matrix</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={true}>
            <ScrollView showsVerticalScrollIndicator={true}>
              <View className="flex flex-col">
                {costMatrix.map((row, rowIndex) => (
                  <View key={rowIndex} className="flex-row mb-2">
                    {row.map((value, colIndex) => (
                      <TextInput
                        key={`${rowIndex}-${colIndex}`}
                        value={value}
                        onChangeText={(text) => {
                          const newMatrix = [...costMatrix];
                          newMatrix[rowIndex][colIndex] = text;
                          setCostMatrix(newMatrix);
                        }}
                        placeholder={`${rowIndex + 1},${colIndex + 1}`}
                        keyboardType="numeric"
                        className="border border-gray-400 rounded-md p-2 w-16 text-center mx-1"
                      />
                    ))}
                  </View>
                ))}
              </View>
            </ScrollView>
          </ScrollView>
        </View>

        {/* Supply Inputs */}
        <View className="mt-6">
          <Text className="text-lg font-semibold mb-2">Supply</Text>
          <View className="flex-row flex-wrap">
            {supply.map((val, i) => (
              <TextInput
                key={i}
                value={val}
                onChangeText={(text) => {
                  const newSupply = [...supply];
                  newSupply[i] = text;
                  setSupply(newSupply);
                }}
                placeholder={`S${i + 1}`}
                keyboardType="numeric"
                className="border border-gray-400 rounded-md p-2 w-16 text-center mx-1 mb-2"
              />
            ))}
          </View>
        </View>

        {/* Demand Inputs */}
        <View className="mt-6">
          <Text className="text-lg font-semibold mb-2">Demand</Text>
          <View className="flex-row flex-wrap">
            {demand.map((val, i) => (
              <TextInput
                key={i}
                value={val}
                onChangeText={(text) => {
                  const newDemand = [...demand];
                  newDemand[i] = text;
                  setDemand(newDemand);
                }}
                placeholder={`D${i + 1}`}
                keyboardType="numeric"
                className="border border-gray-400 rounded-md p-2 w-16 text-center mx-1 mb-2"
              />
            ))}
          </View>
        </View>

        {/* Submit Button */}
        <Pressable
          className="bg-green-600 rounded-md p-4 mt-6"
          onPress={handleSubmit}
        >
          <Text className="text-white text-center font-semibold text-lg ">
            Solve
          </Text>
        </Pressable>
        <BackButton />
      </ScrollView>
    );
  }

  // --- STEP 3: Display Result ---
  if (showResult) {
    return (
      <ScrollView className="p-6 mt-32">
        <Text className="text-3xl font-bold mb-4">Result</Text>
        {error ? (
          <Text className="text-red-600 text-lg">{error}</Text>
        ) : (
          <Text className="text-base bg-gray-100 p-4 rounded-md">
            {typeof result === 'string'
              ? result
              : JSON.stringify(result, null, 2)}
          </Text>
        )}
        <BackButton />
      </ScrollView>
    );
  }

  // --- Fallback ---
  return (
    <View className="p-6 mt-32">
        <Text className="text-lg text-gray-500">Select an operation first</Text>
        <BackButton />
    </View>
  );
};

export default Functions;
