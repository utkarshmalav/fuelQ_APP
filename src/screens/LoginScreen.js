import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { TextInput, Button, HelperText } from 'react-native-paper';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firebaseConfig from '../../firebaseConfig';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const auth = getAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Both fields are required');
    } else {
      setError('');
      try {
        await signInWithEmailAndPassword(auth, email, password);
        // Store login status in AsyncStorage
        await AsyncStorage.setItem('isLoggedIn', 'true');
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Home' }],
          })
        );
      } catch (err) {
        setError('Invalid Email or Password!');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        label="Email"
        mode="outlined"
        style={styles.input}
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        label="Password"
        mode="outlined"
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {error ? (
        <HelperText type="error" visible={true}>
          {error}
        </HelperText>
      ) : null}
      <Button mode="contained" style={styles.button} onPress={handleLogin}>
        Login
      </Button>
      <Text style={styles.linkText} onPress={() => navigation.navigate('Signup')}>
        Don't have an account? Sign Up
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f8f9fa' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { marginBottom: 15 },
  button: { marginTop: 10 },
  linkText: { color: '#007bff', textAlign: 'center', marginTop: 20 },
});

export default LoginScreen;
