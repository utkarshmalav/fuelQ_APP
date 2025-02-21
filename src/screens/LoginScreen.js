import React, { useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import { TextInput, Button, HelperText } from "react-native-paper";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { CommonActions } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const auth = getAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Both fields are required");
    } else {
      setError("");
      try {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        if (!user.emailVerified) {
          await auth.signOut();
          setError("Please verify your email before logging in.");
          return;
        }

        await AsyncStorage.setItem("isLoggedIn", "true");
        setSuccess(true);

        setTimeout(() => {
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: "Home", params: { email } }],
            })
          );
        }, 2000);
      } catch (err) {
        console.error(err);
        setError("Invalid Email or Password!");
      }
    }
  };

  if (success) {
    return (
      <View style={styles.successContainer}>
        <MaterialIcons name="check-circle" size={100} color="green" />
        <Text style={styles.successMessage}>Login Successful!</Text>
      </View>
    );
  }

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
      <Text
        style={styles.linkText}
        onPress={() => navigation.navigate("Signup")}
      >
        Don't have an account? Sign Up
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: { marginBottom: 15 },
  button: { marginTop: 10 },
  linkText: { color: "#007bff", textAlign: "center", marginTop: 20 },

  successContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  successMessage: {
    fontSize: 24,
    fontWeight: "bold",
    color: "green",
    marginTop: 20,
  },
});

export default LoginScreen;
