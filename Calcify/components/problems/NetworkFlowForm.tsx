import React, { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform } from "react-native";

interface NetworkFlowFormProps {
  onBack: () => void;
  onSubmit: (data: any) => void;
}

const NetworkFlowForm: React.FC<NetworkFlowFormProps> = ({ onBack, onSubmit}) => {
    //For This Network flow problem, we will take 2 list of inputs
    //First Activity, these are the nodes
    //Second Predecessor, these are the previous parent nodes of the
    //corresponding activity node.
    //Then on the basis of this we will create a network flow 
    //graph diagram. (This will be done in the networkFlow.ts file)

    const [activities, setActivities] = useState([{ activity: "", predecessors: "" }]);

    const handleAdd = () => setActivities([...activities, { activity: "", predecessors: "" }]);
    const handleRemove = (index: number) =>
        setActivities(activities.filter((_, i) => i !== index));

    const handleChange = (index: number, key: "activity" | "predecessors", value: string) => {
        const updated = [...activities];
        updated[index][key] = value;
        setActivities(updated);
    };

    const handleSubmit = () => {
        const formatted = activities.map((a) => ({
        activity: a.activity.trim(),
        predecessors: a.predecessors
            .split(",")
            .map((p) => p.trim())
            .filter((p) => p.length > 0),
        }));
        onSubmit({ activities: formatted });
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1"
        >
            <ScrollView 
                showsVerticalScrollIndicator
                className="p-6 mt-28"
                contentContainerStyle={{ paddingBottom: 150}}
            >
                <Text className="text-3xl font-bold mb-6 text-black text-center">
                    🕸️ Network Flow Input
                </Text>

                {activities.map((item, i) => (
                    <View key={i} className="mb-6 bg-gray-100 rounded-xl p-4">
                    <Text className="text-lg font-semibold mb-2 text-black">Activity {i + 1}</Text>

                    <TextInput
                        placeholder="Enter Activity Name (e.g., A)"
                        className="border border-gray-400 rounded-md p-2 mb-3 text-black"
                        value={item.activity}
                        onChangeText={(text) => handleChange(i, "activity", text)}
                    />

                    <TextInput
                        placeholder="Predecessors (comma-separated, e.g., A,B)"
                        className="border border-gray-400 rounded-md p-2 mb-3 text-black"
                        value={item.predecessors}
                        onChangeText={(text) => handleChange(i, "predecessors", text)}
                    />

                    <Pressable
                        onPress={() => handleRemove(i)}
                        className="bg-red-500 rounded-md p-2 mt-1"
                    >
                        <Text className="text-center text-white font-semibold">Remove</Text>
                    </Pressable>
                    </View>
                ))}

                <Pressable onPress={handleAdd} className="bg-blue-600 p-3 rounded-md mb-4">
                    <Text className="text-center text-white text-lg font-semibold">+ Add Activity</Text>
                </Pressable>

                <Pressable onPress={handleSubmit} className="bg-green-600 p-3 rounded-md mb-4">
                    <Text className="text-center text-white text-lg font-semibold">Submit</Text>
                </Pressable>

                <Pressable onPress={onBack} className="bg-gray-600 p-3 rounded-md">
                    <Text className="text-center text-white text-lg font-semibold">Back</Text>
                </Pressable>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default NetworkFlowForm;
