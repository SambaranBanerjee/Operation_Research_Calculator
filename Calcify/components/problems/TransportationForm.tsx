import { Text, View, Pressable, TextInput, ScrollView } from 'react-native';
import React, { useState } from 'react';

interface TransportationFormProps {
  onBack: () => void;
  onSubmit: (data: {
    cost: number[][];
    supply: number[];
    demand: number[];
    mode?: 'leastCost' | 'maxProfit';
  }) => void;
}

const TransportationForm: React.FC<TransportationFormProps> = ({ onBack, onSubmit }) => {
  const [costMatrix, setCostMatrix] = useState<string[][]>([['']]);
  const [supply, setSupply] = useState<string[]>(['']);
  const [demand, setDemand] = useState<string[]>(['']);

  const handleMatrixSize = (rows: number, cols: number) => {
    if (rows <= 0 || cols <= 0) return;
    setCostMatrix(Array(rows).fill(null).map(() => Array(cols).fill('')));
    setSupply(Array(rows).fill(''));
    setDemand(Array(cols).fill(''));
  };

  const handleSubmit = (mode: 'leastCost' | 'maxProfit') => {
    const cost = costMatrix.map(row => row.map(Number));
    const s = supply.map(Number);
    const d = demand.map(Number);

    if (
      cost.some(row => row.some(isNaN)) ||
      s.some(isNaN) ||
      d.some(isNaN)
    ) {
      alert('Please fill all inputs with valid numbers.');
      return;
    }

    const transformedCost =
      mode === 'maxProfit' ? cost.map(row => row.map(value => -value)) : cost;

    onSubmit({ cost: transformedCost, supply: s, demand: d, mode });
  };

  return (
    <ScrollView className="p-6 mt-32">
      <Text className="text-2xl font-bold mb-4 text-[#000000]">Enter Transportation Details</Text>

      {/* Matrix Size Input */}
      <View className="flex-row justify-between mb-4">
        <View className="flex-1 mr-2">
          <Text className="text-lg mb-1 text-[#000000]">Rows</Text>
          <TextInput
            className="border border-gray-400 rounded-md p-2 text-center bg-white"
            placeholder="e.g. 3"
            keyboardType="numeric"
            onChangeText={(text) =>
              handleMatrixSize(Number(text || 0), costMatrix[0]?.length || 1)
            }
          />
        </View>
        <View className="flex-1 ml-2">
          <Text className="text-lg mb-1 text-[#000000]">Columns</Text>
          <TextInput
            className="border border-gray-400 rounded-md p-2 text-center bg-white"
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
        <Text className="text-lg font-semibold mb-2 text-[#000000]">Cost / Profit Matrix</Text>
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
                      className="border border-gray-400 rounded-md p-2 w-16 text-center mx-1 bg-white"
                    />
                  ))}
                </View>
              ))}
            </View>
          </ScrollView>
        </ScrollView>
      </View>

      {/* Supplying Inputs */}
      <View className="mt-6">
        <Text className="text-lg font-semibold mb-2 text-[#000000]">Supply</Text>
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
              className="border border-gray-400 rounded-md p-2 w-16 text-center mx-1 mb-2 bg-white"
            />
          ))}
        </View>
      </View>

      {/* Demanding Inputs */}
      <View className="mt-6">
        <Text className="text-lg font-semibold mb-2 text-[#000000]">Demand</Text>
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
              className="border border-gray-400 rounded-md p-2 w-16 text-center mx-1 mb-2 bg-white"
            />
          ))}
        </View>
      </View>

      {/* Buttons */}
      <View className="mt-6">
        <Pressable
          className="bg-blue-600 rounded-md p-4 mb-4"
          onPress={() => handleSubmit('leastCost')}
        >
          <Text className="text-white text-center font-semibold text-lg">
            Least Cost Delivery
          </Text>
        </Pressable>

        <Pressable
          className="bg-green-600 rounded-md p-4 mb-4"
          onPress={() => handleSubmit('maxProfit')}
        >
          <Text className="text-white text-center font-semibold text-lg">
            Maximum Profit Delivery
          </Text>
        </Pressable>
      </View>

      <Pressable
        onPress={onBack}
        className="mt-4 mb-4 bg-gray-500 rounded-md p-3"
      >
        <Text className="text-center text-white font-semibold">Back</Text>
      </Pressable>
    </ScrollView>
  );
};

export default TransportationForm;
