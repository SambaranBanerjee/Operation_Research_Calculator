import React from 'react'
import { Tabs } from 'expo-router'
import Entypo from 'react-native-vector-icons/Entypo';

const _layout = () => {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarLabel: 'Home',
          headerShown: true,
          headerStyle: { backgroundColor: '#1f1f1f'},
          headerTitleStyle: { color: 'white' },
          tabBarIcon: ({ color, size }) => (
            <Entypo name="home" color={color} size={size} />
          ),
          tabBarStyle: { backgroundColor: '#121212' },
        }}
      />
    </Tabs>
  )
}

export default _layout