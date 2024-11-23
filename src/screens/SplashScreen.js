import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    const checkLoginStatus = async () => {
      const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');
      console.log('Login Status:', isLoggedIn);  // Log the login status
      if (isLoggedIn === 'true') {
        navigation.replace('Home');
      } else {
        navigation.replace('Login');
      }
    };

    setTimeout(() => {
      checkLoginStatus();
    }, 2000);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/logo.png')} style={styles.logo} />
      <Text style={styles.tagline}>Smart Queue Prediction</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#4CAF50' },
  logo: { width: 100, height: 100 },
  tagline: { fontSize: 18, color: '#fff', marginTop: 10 },
});

export default SplashScreen;
