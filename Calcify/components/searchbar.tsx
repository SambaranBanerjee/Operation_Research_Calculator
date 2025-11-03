import { FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';
import { useNavigation, NavigationProp } from '@react-navigation/native';

export const initialData = [
  { id: '1', name: 'Transportation Problem' },
  { id: '2', name: 'Linear Programming Problem' },
  { id: '3', name: 'Assignment Problem' },
  { id: '4', name: 'Network Flow Problem' }
];

type RootStackParamList = {
    Home: undefined;
    TargetScreen: { item: { id: string; name: string } };
};

const SearchBar = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredData, setFilteredData] = useState(initialData);
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

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
        className="h-10 text-white border border-gray-400 mb-5 px-3 py-2 rounded"
        placeholder="Search..."
        value={searchQuery}
        onChangeText={handleSearch}
      />
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
            <TouchableOpacity 
              onPress={() => navigation.navigate('TargetScreen' , { item })}
              className='
                bg-none 
                border-b 
                border-gray-300 
                py-2
                scroll-py-2'
            >
                <Text className='text-lg'>
                    {item.name}
                </Text>
            </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default SearchBar;
