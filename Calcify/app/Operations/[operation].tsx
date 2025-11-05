import { View, Text, Pressable, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { operations } from '@/utils/operations';
import TransportationForm from '@/components/problems/TransportationForm';
import { TransportationMethod } from '@/utils/transportation';
import ScreenWrapper from '@/components/screenwrapper';

type TransportationResult = {
  allocation?: { row: number; col: number; amount: number }[];
  totalCost?: number;
  totalProfit?: number;
  [key: string]: any;
};

const Functions = () => {
  const { operation } = useLocalSearchParams<{ operation: string }>();
  const router = useRouter();

  const [selectedMethod, setSelectedMethod] = useState<TransportationMethod | undefined>();
  const [result, setResult] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [showResult, setShowResult] = useState(false);

  // Load the operation when the screen opens
  useEffect(() => {
    if (!operation) return;

    const opFunction = operations[operation as keyof typeof operations];
    if (!opFunction) {
      setResult({ error: 'Operation not found' });
      return;
    }

    // Initial call → returns prompt & available methods
    const res = opFunction(undefined);
    setResult(res);
    setShowForm(false);
    setShowResult(false);
  }, [operation]);

  // Submit form data & compute result
    const handleSubmit = (data: any) => {
    const opFunction = operations[operation as keyof typeof operations];
    if (!opFunction) return;

    const rawResult = opFunction(selectedMethod, data.cost, data.supply, data.demand);

    // Make a mutable copy (safe even if it's a string)
    const res: any = typeof rawResult === 'object' ? { ...rawResult } : rawResult;

    // Adjust for profit mode
    if (data.mode === 'maxProfit' && res && typeof res === 'object' && res.totalCost !== undefined) {
      res.totalProfit = -res.totalCost;
      delete res.totalCost;
    }

    setResult(res);
    setShowResult(true);
    setShowForm(false);
  };


  // Back button logic
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

  // --- Reusable Back Button ---
  const BackButton = () => (
    <Pressable
      onPress={handleBack}
      className="mt-6 mb-4 bg-gray-600 rounded-md p-3 w-24 self-center"
    >
      <Text className="text-center text-white font-semibold">Back</Text>
    </Pressable>
  );

  // Choose Method 
  if (
    result &&
    typeof result === 'object' &&
    'prompt' in result &&
    'methods' in result &&
    !showForm &&
    !showResult
  ) {
    return (
      <ScreenWrapper>
        <ScrollView className="p-6 mt-28">
          <Text className="text-3xl font-bold mb-6 capitalize text-[#000000]">
            {operation?.replace(/([A-Z])/g, ' $1')}
          </Text>
          <Text className="text-lg mb-6 text-[#000000]">{result.prompt}</Text>
          {result.methods.map((method: { key: TransportationMethod; label: string }) => (
            <Pressable
              key={method.key}
              className="bg-blue-600 rounded-md p-4 mb-4"
              onPress={() => {
                setSelectedMethod(method.key);
                setShowForm(true);
              }}
            >
              <Text className="text-white text-center text-lg">{method.label}</Text>
            </Pressable>
          ))}
          <BackButton />
        </ScrollView>
      </ScreenWrapper>
    );
  }

  // Show Transportation Form 
  if (showForm) {
    if (operation === 'transportationProblem') {
      return (
        <ScreenWrapper>
          <TransportationForm onBack={handleBack} onSubmit={handleSubmit} />
        </ScreenWrapper>
      );
    } else {
      return (
        <ScreenWrapper>
          <ScrollView className="p-6 mt-32">
            <Text className="text-[#000000] text-lg">
              Input form not yet implemented for this operation.
            </Text>
            <BackButton />
          </ScrollView>
        </ScreenWrapper>
      );
    }
  }

  // Show Result 
  if (showResult && result) {
  const isObjectResult = typeof result === 'object' && result !== null;
  const r = isObjectResult ? (result as TransportationResult) : null;

  return (
    <ScreenWrapper>
      <ScrollView className="p-6 mt-28">
        <Text className="text-3xl font-bold mb-4 text-[#000000]">Result</Text>

        {!isObjectResult ? (
          <Text className="text-[#000000] bg-black/40 p-4 rounded-md">{result}</Text>
        ) : (
          <View className="bg-black/40 p-4 rounded-md">
            {r?.allocation && Array.isArray(r.allocation) && (
              <>
                <Text className="text-lg font-semibold text-[#000000] mb-2">
                  Allocations:
                </Text>
                {r.allocation.map((a: any, i: number) => (
                  <Text key={i} className="text-black">
                    Row {a.row + 1}, Col {a.col + 1} → {a.amount}
                  </Text>
                ))}
              </>
            )}

            {r?.totalCost !== undefined && (
              <Text className="text-lg font-bold text-yellow-300 mt-4">
                Total Cost: {r.totalCost}
              </Text>
            )}

            {r?.totalProfit !== undefined && (
              <Text className="text-lg font-bold text-green-300 mt-4">
                Total Profit: {r.totalProfit}
              </Text>
            )}
          </View>
        )}
        <BackButton />
      </ScrollView>
    </ScreenWrapper>
  );
}


  // --- FALLBACK: Loading ---
  return (
    <ScreenWrapper>
      <View className="flex-1 justify-center items-center p-6">
        <Text className="text-lg text-[#0000000]">Loading...</Text>
        <BackButton />
      </View>
    </ScreenWrapper>
  );
};

export default Functions;
