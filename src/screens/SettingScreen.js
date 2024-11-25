import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';

const SettingScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [profileVisible, setProfileVisible] = useState(false);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();
  const auth = getAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Do you want to logout?',
      [
        {
          text: 'No',
          onPress: () => console.log('Logout canceled'),
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              await AsyncStorage.setItem('isLoggedIn', 'false');
              await signOut(auth);
              console.log('User logged out');
              navigation.replace('Splash');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'There was an error logging out');
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const handleReport = () => {
    if (category && description) {
      Alert.alert(
        'Confirm Report',
        'Are you sure you want to submit this report?',
        [
          {
            text: 'Cancel',
            onPress: () => setModalVisible(false),
            style: 'cancel',
          },
          {
            text: 'Submit',
            onPress: () => {
              setModalVisible(false);
              Alert.alert('Report Submitted', 'Your report has been submitted.');
            },
          },
        ],
        { cancelable: false }
      );
    } else {
      Alert.alert('Error', 'Please fill in all fields.');
    }
  };

  const handleProfileSave = () => {
    Alert.alert(
      'Confirm Save',
      'Are you sure you want to save these changes?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Save canceled'),
          style: 'cancel',
        },
        {
          text: 'Save',
          onPress: () => {
            setProfileVisible(false);
            Alert.alert('Saved', 'Profile updated successfully.');
          },
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      {/* Profile Section */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => setProfileVisible(true)}
      >
        <Text style={styles.buttonText}>Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.buttonText}>Report</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.logoutButton]}
        onPress={handleLogout}
      >
        <Text style={[styles.buttonText, styles.logoutText]}>Logout</Text>
      </TouchableOpacity>

      {/* Profile Modal */}
      <Modal
        visible={profileVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setProfileVisible(false)}
      >
        <View style={stylesProfile.modalContainer}>
          <View style={stylesProfile.profileModalContent}>
            <Text style={stylesProfile.modalTitle}>Edit Profile</Text>

            <TextInput
              style={stylesProfile.input}
              placeholder="Name"
              value={name}
              onChangeText={setName}
            />

            <TextInput
              style={stylesProfile.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />

            <TextInput
              style={stylesProfile.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity
              style={stylesProfile.saveButton}
              onPress={handleProfileSave}
            >
              <Text style={stylesProfile.buttonText}>Save</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={stylesProfile.cancelButton}
              onPress={() => setProfileVisible(false)}
            >
              <Text style={stylesProfile.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Report Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={stylesReport.modalContainer}>
          <View style={stylesReport.reportModalContent}>
            <Text style={stylesReport.modalTitle}>Report Issue</Text>

            <Picker
              selectedValue={category}
              onValueChange={(itemValue) => setCategory(itemValue)}
              style={stylesReport.picker}
            >
              <Picker.Item label="Select Category" value="" />
              <Picker.Item label="Wrong Info" value="wrong_info" />
              <Picker.Item label="Fraud Info" value="fraud_info" />
              <Picker.Item label="Bug" value="bug" />
              <Picker.Item label="Others" value="others" />
            </Picker>

            <TextInput
              style={stylesReport.input}
              placeholder="Describe"
              value={description}
              onChangeText={setDescription}
              multiline
            />

            <TouchableOpacity
              style={stylesReport.submitButton}
              onPress={handleReport}
            >
              <Text style={stylesReport.buttonText}>Submit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={stylesReport.cancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={stylesReport.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Common Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  button: {
    width: '80%',
    paddingVertical: 12,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  logoutButton: {
    backgroundColor: '#FF6347',
  },
  logoutText: {
    fontWeight: '700',
  },
});

// Profile Styles
const stylesProfile = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  profileModalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#FF6347',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

// Report Styles
const stylesReport = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  reportModalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  picker: {
    width: '100%',
    height: 60,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 15,
  },
  input: {
    width: '100%',
    height: 100,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    textAlignVertical: 'top',
    marginBottom: 15,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#FF6347',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default SettingScreen;
