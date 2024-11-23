import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Avatar, Card, Button, Appbar, BottomNavigation } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Placeholder Data for Stations
const stations = [
  { id: '1', name: 'CNG Station 1', waitTime: '10 mins', distance: '2.5 km' },
  { id: '2', name: 'EV Station A', waitTime: '5 mins', distance: '1.8 km' },
  { id: '3', name: 'CNG Station 2', waitTime: '15 mins', distance: '3.2 km' },
];

// Placeholder Routes for Navigation
const HomeRoute = () => <InteractiveHome />;
const MapRoute = () => (
  <View style={styles.centered}>
    <Text>Map View</Text>
  </View>
);
const ProfileRoute = () => (
  <View style={styles.centered}>
    <Text>Profile Screen</Text>
  </View>
);
const HistoryRoute = () => (
  <View style={styles.centered}>
    <Text>History Screen</Text>
  </View>
);
const SettingsRoute = () => (
  <View style={styles.centered}>
    <Text>Settings Screen</Text>
  </View>
);

const InteractiveHome = () => {
  const renderStationCard = ({ item }) => (
    <Card style={styles.stationCard}>
      <Card.Content>
        <Text style={styles.stationName}>{item.name}</Text>
        <Text style={styles.stationDetails}>Wait Time: {item.waitTime}</Text>
        <Text style={styles.stationDetails}>Distance: {item.distance}</Text>
        <Button
          mode="outlined"
          onPress={() => alert(`Navigating to ${item.name}`)}
          style={styles.detailsButton}
        >
          Details
        </Button>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <Appbar.Header>
        <Appbar.Content title="FuelQ" />
        <Avatar.Icon size={40} icon="account" style={styles.profileIcon} />
      </Appbar.Header>

      {/* Search Bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search for nearby stations..."
        placeholderTextColor="#888"
      />

      {/* Nearby Stations Section */}
      <Text style={styles.sectionTitle}>Nearby Stations</Text>
      <FlatList
        data={stations}
        renderItem={renderStationCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.stationList}
      />

      {/* Map View Button */}
      <TouchableOpacity
        style={styles.mapButton}
        onPress={() => alert('Navigating to Map View')}
      >
        <Icon name="map" size={24} color="#fff" />
        <Text style={styles.mapButtonText}>Map View</Text>
      </TouchableOpacity>
    </View>
  );
};

const HomeScreen = () => {
  const [index, setIndex] = useState(0);
  const routes = [
    { key: 'home', title: 'Home', icon: 'home' },
    { key: 'map', title: 'Map', icon: 'map' },
    { key: 'profile', title: 'Profile', icon: 'account' },
    { key: 'history', title: 'History', icon: 'history' },
    { key: 'settings', title: 'Settings', icon: 'cog' },
  ];

  const renderScene = BottomNavigation.SceneMap({
    home: HomeRoute,
    map: MapRoute,
    profile: ProfileRoute,
    history: HistoryRoute,
    settings: SettingsRoute,
  });

  return (
    <BottomNavigation
      navigationState={{ index, routes }}
      onIndexChange={setIndex}
      renderScene={renderScene}
    />
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 16 },
  profileIcon: { backgroundColor: '#4CAF50' },
  searchBar: {
    height: 40,
    margin: 16,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#e8e8e8',
    color: '#333',
  },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginLeft: 16 },
  stationList: { paddingHorizontal: 16 },
  stationCard: {
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
    backgroundColor: '#fff',
  },
  stationName: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  stationDetails: { fontSize: 14, color: '#555' },
  detailsButton: { marginTop: 8 },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#4CAF50',
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  mapButtonText: { color: '#fff', fontSize: 16, marginLeft: 8 },
});

export default HomeScreen;
