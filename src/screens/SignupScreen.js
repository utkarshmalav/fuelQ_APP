import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { TextInput, Button, HelperText } from 'react-native-paper';
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';

const SignupScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const auth = getAuth();

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);
  const validatePassword = (password) => password.length >= 6;

  const handleDone = async () => {
    if (!name) {
      setError('Name is required');
    } else if (!validateEmail(email)) {
      setError('Enter a valid email');
    } else if (!validatePassword(password)) {
      setError('Password must be at least 6 characters');
    } else if (password !== confirmPassword) {
      setError('Passwords do not match');
    } else {
      setError('');
      handleFirebaseSignUp();
    }
  };

  const handleFirebaseSignUp = () => {
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        sendEmailVerification(user).then(() => {
          navigation.navigate('Login', { message: 'Verification link sent to your email. Please verify before logging in.' });
        });
      })
      .catch((error) => {
        setError(error.message);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <TextInput
        label="Name"
        mode="outlined"
        style={styles.input}
        value={name}
        onChangeText={setName}
      />
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
      <TextInput
        label="Confirm Password"
        mode="outlined"
        style={styles.input}
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      {error ? (
        <HelperText type="error" visible={true}>
          {error}
        </HelperText>
      ) : null}
      <Button mode="contained" style={styles.button} onPress={handleDone}>
        Done
      </Button>
      <Text style={styles.linkText} onPress={() => navigation.navigate('Login')}>
        Already have an account? Login
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

export default SignupScreen;
