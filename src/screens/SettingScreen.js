import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';

const SettingScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const navigation = useNavigation();
  const auth = getAuth();

  useEffect(() => {
    // Retrieve email from AsyncStorage
    const fetchEmail = async () => {
      const email = await AsyncStorage.getItem('Identifier');
      if (email) {
        setUserEmail(email);
      }
    };
    fetchEmail();
  }, []);

  const handleProfile = () => {
    if (userEmail) {
      Alert.alert('Profile', `Your Email: ${userEmail}`);
    } else {
      Alert.alert('Profile', 'Email not available.');
    }
  };

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
              await AsyncStorage.removeItem('userEmail'); // Clear email
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <TouchableOpacity style={styles.button} onPress={handleProfile}>
        <Text style={styles.buttonText}>Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
        <Text style={styles.buttonText}>Report</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
        <Text style={[styles.buttonText, styles.logoutText]}>Logout</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          Alert.alert(
            'Cancel Report',
            'Are you sure you want to cancel?',
            [
              {
                text: 'No',
                onPress: () => console.log('Cancel'),
                style: 'cancel',
              },
              {
                text: 'Yes',
                onPress: () => setModalVisible(false),
              },
            ],
            { cancelable: false }
          );
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.reportModalContent}>
            <Text style={styles.modalTitle}>Report Issue</Text>

            <Picker
              selectedValue={category}
              onValueChange={(itemValue) => setCategory(itemValue)}
              style={[styles.reportPicker, { borderColor: category ? '#ccc' : 'red' }]}
            >
              <Picker.Item label="Select Category" value="" />
              <Picker.Item label="Wrong Info" value="wrong_info" />
              <Picker.Item label="Fraud Info" value="fraud_info" />
              <Picker.Item label="Bug" value="bug" />
              <Picker.Item label="Others" value="others" />
            </Picker>

            <TextInput
              style={styles.reportInputDescription}
              placeholder="Describe"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
            />

            <TouchableOpacity
              style={[styles.reportButton, { backgroundColor: category ? '#4CAF50' : '#ccc' }]}
              onPress={handleReport}
              disabled={!category}
            >
              <Text style={styles.buttonText}>Send</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.reportButton, styles.cancelButton]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
  },
  button: {
    width: '80%',
    paddingVertical: 12,
    marginBottom: 15,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#FF6347',
  },
  logoutText: {
    fontWeight: '700',
    color: '#fff',
  },
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
  reportPicker: {
    width: '100%',
    height: 70,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  reportInputDescription: {
    width: '100%',
    height: 100,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    textAlignVertical: 'top',
  },
  reportButton: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  cancelButton: {
    backgroundColor: '#FF6347',
  },
});

export default SettingScreen;
