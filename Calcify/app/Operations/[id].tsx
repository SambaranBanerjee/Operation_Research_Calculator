import { Text, View } from 'react-native'
import React, { useEffect, useState} from 'react'
import { useLocalSearchParams } from 'expo-router';
import { operations } from '@/utils/operations';

const Functions = () => {
    const { operation } = useLocalSearchParams<{ operation: string }>();
    const [result, setResult] = useState<string | null>(null);
    
    useEffect(() => {
        if (operation && operation in operations) {
            const res = operations[operation as keyof typeof operations]();
            setResult(res);
        }
        else {
            setResult("Operation not found");
        }
    }, [operation]);
    
    return (
        <View
        className='p-16 mt-40'
        >
            <Text
                className='text-3xl font-bold mb-12'    
            >
                Functions
            </Text>
            <Text
                className='text-xl'
            >
                {result}
            </Text>
        </View>
    )
}

export default Functions;
