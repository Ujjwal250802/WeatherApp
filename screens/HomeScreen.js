import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../Context/ThemeContext';

const API_KEY = 'bad93f57d541abfa0d0f292291abd269';

const HomeScreen = ({ navigation }) => {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [isCelsius, setIsCelsius] = useState(true);
  const { isDark, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (city.length > 2) {
      fetchCitySuggestions();
    } else {
      setSuggestions([]);
    }
  }, [city]);

  const fetchCitySuggestions = async () => {
    try {
      const response = await fetch(
        `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=4&appid=${API_KEY}`
      );
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const fetchWeather = async (lat, lon) => {
    setLoading(true);
    try {
      const [weatherResponse, forecastResponse] = await Promise.all([
        fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        ),
        fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        ),
      ]);

      const weatherData = await weatherResponse.json();
      const forecastData = await forecastResponse.json();

      setWeather(weatherData);
      setForecast(forecastData.list);
      
      // Save to recent searches
      const recentSearches = await AsyncStorage.getItem('recentSearches');
      const searches = recentSearches ? JSON.parse(recentSearches) : [];
      const newSearch = {
        name: weatherData.name,
        lat,
        lon,
        timestamp: new Date().getTime(),
      };
      
      const updatedSearches = [newSearch, ...searches.filter(s => s.name !== weatherData.name)].slice(0, 5);
      await AsyncStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
      
    } catch (error) {
      console.error('Error fetching weather:', error);
    }
    setLoading(false);
  };

  const selectCity = (lat, lon, name) => {
    setCity(name);
    setSuggestions([]);
    fetchWeather(lat, lon);
  };

  const getWeatherIcon = (code) => {
    if (code >= 200 && code < 300) return 'thunderstorm';
    if (code >= 300 && code < 400) return 'rainy';
    if (code >= 500 && code < 600) return 'rainy';
    if (code >= 600 && code < 700) return 'snow';
    if (code >= 700 && code < 800) return 'cloud';
    if (code === 800) return 'sunny';
    return 'partly-sunny';
  };

  const convertTemp = (temp) => {
    if (!isCelsius) {
      return ((temp * 9/5) + 32).toFixed(1);
    }
    return temp.toFixed(1);
  };

  return (
    <View style={[styles.container, isDark && styles.darkContainer]}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <TextInput
            style={[styles.searchInput, isDark && styles.darkInput]}
            placeholder="Search city..."
            value={city}
            onChangeText={setCity}
            placeholderTextColor={isDark ? '#888' : '#666'}
          />
          <TouchableOpacity onPress={toggleTheme} style={styles.themeToggle}>
            <Ionicons name={isDark ? 'sunny' : 'moon'} size={24} color={isDark ? '#fff' : '#000'} />
          </TouchableOpacity>
        </View>
        
        {suggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            {suggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionItem}
                onPress={() => selectCity(suggestion.lat, suggestion.lon, suggestion.name)}
              >
                <Text style={[styles.suggestionText, isDark && styles.darkText]}>
                  {suggestion.name}, {suggestion.country}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <ScrollView style={styles.content}>
        {weather && (
          <>
            <View style={styles.currentWeather}>
              <Ionicons
                name={getWeatherIcon(weather.weather[0].id)}
                size={100}
                color={isDark ? '#fff' : '#000'}
              />
              <Text style={[styles.temperature, isDark && styles.darkText]}>
                {convertTemp(weather.main.temp)}°{isCelsius ? 'C' : 'F'}
              </Text>
              <Text style={[styles.description, isDark && styles.darkText]}>
                {weather.weather[0].description}
              </Text>
            </View>

            <View style={styles.forecastContainer}>
              <Text style={[styles.forecastTitle, isDark && styles.darkText]}>8-Day Forecast</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {forecast.filter((item, index) => index % 8 === 0).map((item, index) => (
                  <View key={index} style={styles.forecastItem}>
                    <Text style={[styles.forecastDay, isDark && styles.darkText]}>
                      {new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })}
                    </Text>
                    <Ionicons
                      name={getWeatherIcon(item.weather[0].id)}
                      size={30}
                      color={isDark ? '#fff' : '#000'}
                    />
                    <Text style={[styles.forecastTemp, isDark && styles.darkText]}>
                      {convertTemp(item.main.temp)}°
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>

            <View style={styles.controls}>
              <TouchableOpacity
                style={styles.unitToggle}
                onPress={() => setIsCelsius(!isCelsius)}
              >
                <Text style={[styles.unitToggleText, isDark && styles.darkText]}>
                  Switch to {isCelsius ? '°F' : '°C'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.recentSearchesButton}
                onPress={() => navigation.navigate('RecentSearches')}
              >
                <Text style={[styles.recentSearchesText, isDark && styles.darkText]}>
                  Recent Searches
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
  },
  darkContainer: {
    backgroundColor: '#1a1a1a',
  },
  header: {
    padding: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: 50,
    backgroundColor: '#f5f5f5',
    borderRadius: 25,
    paddingHorizontal: 20,
    marginRight: 10,
    fontSize: 16,
  },
  darkInput: {
    backgroundColor: '#333',
    color: '#fff',
  },
  themeToggle: {
    padding: 10,
  },
  suggestionsContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginTop: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  suggestionItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  suggestionText: {
    fontSize: 16,
  },
  darkText: {
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  currentWeather: {
    alignItems: 'center',
    padding: 20,
  },
  temperature: {
    fontSize: 72,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  description: {
    fontSize: 24,
    textTransform: 'capitalize',
  },
  forecastContainer: {
    padding: 20,
  },
  forecastTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  forecastItem: {
    alignItems: 'center',
    marginRight: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 15,
    borderRadius: 15,
  },
  forecastDay: {
    fontSize: 16,
    marginBottom: 5,
  },
  forecastTemp: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 5,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  unitToggle: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
  },
  unitToggleText: {
    fontSize: 16,
  },
  recentSearchesButton: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
  },
  recentSearchesText: {
    fontSize: 16,
  },
});

export default HomeScreen;