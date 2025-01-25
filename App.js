import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import HomeScreen from './screens/HomeScreen';
import RecentSearches from './screens/RecentSearches';
import { ThemeProvider } from './Context/ThemeContext';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator>
          <Stack.Screen 
            name="Home" 
            component={HomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="RecentSearches" 
            component={RecentSearches}
            options={({ navigation }) => ({
              presentation: 'modal',
              animation: 'slide_from_bottom',
              title: 'Recent Searches',
              headerLeft: () => null,
              headerRight: () => (
                <TouchableOpacity 
                  onPress={() => navigation.goBack()}
                  style={{ marginRight: 15 }}
                >
                  <Text style={{ fontSize: 16, color: '#007AFF' }}>Done</Text>
                </TouchableOpacity>
              ),
            })}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}