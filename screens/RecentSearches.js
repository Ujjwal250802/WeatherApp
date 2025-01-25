import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../Context/ThemeContext';

const SearchItem = ({ item, index, navigation, isDark }) => {
  const itemSlide = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const delay = index * 100;
    Animated.timing(itemSlide, {
      toValue: 1,
      duration: 300,
      delay,
      useNativeDriver: true,
    }).start();
  }, [index]);

  return (
    <Animated.View
      style={[
        styles.searchItem,
        {
          transform: [
            {
              translateX: itemSlide.interpolate({
                inputRange: [0, 1],
                outputRange: [300, 0],
              }),
            },
          ],
        },
      ]}
    >
      <TouchableOpacity
        style={[styles.searchItemContent, isDark && styles.darkSearchItem]}
        onPress={() => navigation.navigate('Home', { search: item })}
      >
        <Text style={[styles.searchItemText, isDark && styles.darkText]}>
          {item.name}
        </Text>
        <Text style={[styles.searchItemDate, isDark && styles.darkText]}>
          {new Date(item.timestamp).toLocaleDateString()}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const RecentSearches = ({ navigation }) => {
  const [searches, setSearches] = useState([]);
  const { isDark } = useTheme();
  const slideAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadSearches();
    Animated.spring(slideAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadSearches = async () => {
    try {
      const savedSearches = await AsyncStorage.getItem('recentSearches');
      if (savedSearches) {
        setSearches(JSON.parse(savedSearches));
      }
    } catch (error) {
      console.error('Error loading searches:', error);
    }
  };

  const renderItem = ({ item, index }) => (
    <SearchItem 
      item={item} 
      index={index} 
      navigation={navigation} 
      isDark={isDark} 
    />
  );

  return (
    <Animated.View
      style={[
        styles.container,
        isDark && styles.darkContainer,
        {
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [300, 0],
              }),
            },
          ],
        },
      ]}
    >
      <Text style={[styles.title, isDark && styles.darkText]}>Recent Searches</Text>
      <FlatList
        data={searches}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.list}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  darkContainer: {
    backgroundColor: '#1a1a1a',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  darkText: {
    color: '#fff',
  },
  list: {
    paddingBottom: 20,
  },
  searchItem: {
    marginBottom: 10,
  },
  searchItemContent: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  darkSearchItem: {
    backgroundColor: '#333',
  },
  searchItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  searchItemDate: {
    fontSize: 14,
    color: '#666',
  },
});

export default RecentSearches;