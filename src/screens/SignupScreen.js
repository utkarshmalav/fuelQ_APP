import React, { useState } from "react";
import { View, StyleSheet, Text, IconButton } from "react-native";
import { TextInput, Button, HelperText } from "react-native-paper";
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
} from "firebase/auth";
import { getDatabase, ref, set } from "firebase/database";
import { MaterialIcons } from "@expo/vector-icons";

const SignupScreen = ({ navigation }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const auth = getAuth();
  const database = getDatabase();

  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const validatePassword = (password) => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long.";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter.";
    }
    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter.";
    }
    if (!/\d/.test(password)) {
      return "Password must contain at least one number.";
    }
    if (!/[@$!%*?&]/.test(password)) {
      return "Password must contain at least one special character (@$!%*?&).";
    }
    return "";
  };

  const handleDone = async () => {
    if (!name) {
      setError("Name is required.");
    } else if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
    } else {
      const passwordError = validatePassword(password);
      if (passwordError) {
        setError(passwordError);
      } else if (password !== confirmPassword) {
        setError("Passwords do not match. Please try again.");
      } else {
        setError("");
        handleFirebaseSignUp();
      }
    }
  };

  const handleFirebaseSignUp = () => {
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        updateProfile(user, {
          displayName: name,
        })
          .then(() => {
            sendEmailVerification(user)
              .then(() => {
                saveUserDetailsToRealtimeDatabase();
                console.log("Verification link sent!");
                setSuccessMessage(
                  "Verification link sent to your email. Please verify before logging in."
                );
                setTimeout(() => {
                  setSuccessMessage("");
                  navigation.navigate("Login");
                }, 5000);
              })
              .catch((error) => {
                setError(
                  "Failed to send verification email. Please try again."
                );
                console.error(error);
              });
          })
          .catch((error) => {
            setError("Failed to update user profile.");
            console.error(error);
          });
      })
      .catch((error) => {
        if (error.code === "auth/email-already-in-use") {
          setError(
            "This email is already registered. Please use a different email."
          );
        } else {
          setError(error.message);
        }
      });
  };

  const saveUserDetailsToRealtimeDatabase = () => {
    const sanitizedEmail = email.replace(/\./g, "_");
    const userRef = ref(database, `UserDetails/${sanitizedEmail}`);

    set(userRef, {
      Name: name,
    })
      .then(() => {
        console.log("User details saved successfully.");
      })
      .catch((error) => {
        setError("Failed to save user details. Please try again.");
        console.error(error);
      });
  };

  return (
    <View style={styles.container}>
      {successMessage ? (
        <View style={styles.successContainer}>
          <MaterialIcons name="lock" size={100} color="green" />
          <Text style={styles.successText}>{successMessage}</Text>
        </View>
      ) : (
        <>
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
          <Text
            style={styles.linkText}
            onPress={() => navigation.navigate("Login")}
          >
            Already have an account? Login
          </Text>
        </>
      )}
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
    backgroundColor: "white",
    padding: 20,
  },
  successText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "green",
    marginTop: 15,
    textAlign: "center",
  },
});

export default SignupScreen;
