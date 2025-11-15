import { FlatList, Text, TextInput, View } from 'react-native';
import React, { useState } from 'react';
import { Link } from 'expo-router';

export const initialData = [
  { id: '1', name: 'Transportation Problem' },
  { id: '2', name: 'Linear Programming Problem' },
  { id: '3', name: 'Assignment Problem' },
  { id: '4', name: 'Network Flow Problem' }
];

const operationNameToKey: Record<string, string> = {
  'Transportation Problem': 'transportationProblem',
  'Linear Programming Problem': 'linearProgrammingProblem',
  'Assignment Problem': 'assignmentProblem',
  'Network Flow Problem': 'networkFlowProblem',
};

const SearchBar = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredData, setFilteredData] = useState(initialData);

    const handleSearch = (text: string) => {
        setSearchQuery(text);
        const newData = initialData.filter(item => {
        const itemData = item.name.toUpperCase();
        const textData = text.toUpperCase();
        return itemData.indexOf(textData) > -1;
        });
        setFilteredData(newData);
    };

  return (
    <View className="flex-1 p-2 mt-2">
      <TextInput
        className="h-10 text-black border border-gray-400 mb-5 px-3 py-2 rounded"
        placeholder="Search..."
        placeholderTextColor="#000000"
        value={searchQuery}
        onChangeText={handleSearch}
      />
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
            <Link 
              href={`/Operations/${operationNameToKey[item.name]}`}
              style={{
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderColor: '#D1D5DB',
              }}
              
            >
                <Text className="text-lg">
                    {item.name}
                </Text>
            </Link>
        )}
      />
    </View>
  );
};

export default SearchBar;
