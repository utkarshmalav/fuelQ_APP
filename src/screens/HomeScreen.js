/** @format */

import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, FlatList } from "react-native";
import {
  Card,
  Button,
  Appbar,
  BottomNavigation,
  SegmentedButtons,
  IconButton,
} from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import SettingScreen from "../screens/SettingScreen";
import AboutScreen from "../screens/AboutScreen";
import DetailsScreen from "../screens/DetailsScreen"; // Ensure that DetailsScreen is imported
import { useNavigation } from "@react-navigation/native";

const evStations = [
  {
    id: "2",
    name: "EV Station 1",
    waitTime: "15 mins",
    distance: "1.8 km",
    type: "EV",
  },
];

const cngStations = [
  {
    id: "1",
    name: "CNG Station 1",
    waitTime: "10 mins",
    distance: "2.5 km",
    type: "CNG",
  },
  {
    id: "11",
    name: "CNG Station 2",
    waitTime: "10 mins",
    distance: "2.5 km",
    type: "CNG",
  },
  {
    id: "112",
    name: "CNG Station 3",
    waitTime: "10 mins",
    distance: "2.5 km",
    type: "CNG",
  },
];

const petrolStations = [
  {
    id: "3",
    name: "Petrol Station 1",
    waitTime: "5 mins",
    distance: "3.0 km",
    type: "Petrol/Diesel",
  },
];

const HomeRoute = () => <InteractiveHome />;
const MapRoute = () => (
  <View style={styles.centered}>
    <Text>Map Screen</Text>
  </View>
);

const SettingsRoute = ({ navigation }) => (
  <SettingScreen navigation={navigation} />
);

const AboutRoute = () => <AboutScreen />;

const InteractiveHome = () => {
  const navigation = useNavigation();
  const [stationType, setStationType] = useState("EV");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStations = (
    stationType === "EV"
      ? evStations
      : stationType === "CNG"
      ? cngStations
      : petrolStations
  ).filter((station) =>
    station.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderStationCard = ({ item }) => (
    <Card style={styles.stationCard}>
      <Card.Content>
        <Text style={styles.stationName}>{item.name}</Text>
        <Text style={styles.stationDetails}>Wait Time: {item.waitTime}</Text>
        <Text style={styles.stationDetails}>Distance: {item.distance}</Text>
        <Button
          mode="outlined"
          onPress={() =>
            navigation.navigate("Details", {
              stationId: item.id,
              stationName: item.name,
            })
          }  // Pass stationId and stationName to Details screen
          style={styles.detailsButton}
        >
          View
        </Button>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content
          title={
            <View style={styles.appTitleContainer}>
              <Icon name="fire" size={30} color="red" />
              <Text style={styles.appTitle}>FuelQ</Text>
              <Icon name="fire" size={30} color="red" />
            </View>
          }
        />
      </Appbar.Header>

      <SegmentedButtons
        value={stationType}
        onValueChange={setStationType}
        buttons={[
          {
            value: "EV",
            label: "EV",
            icon: "car-electric",
            style: { backgroundColor: "#4CAF50" },
          },
          {
            value: "Petrol/Diesel",
            label: "Petrol",
            icon: "gas-station",
            style: { backgroundColor: "#FFC107" },
          },
          {
            value: "CNG",
            label: "CNG",
            icon: "fire",
            style: { backgroundColor: "#2196F3" },
          },
        ]}
        style={styles.toggleButtons}
      />

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchBar}
          placeholder="Search for nearby stations..."
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <IconButton
            icon="close-circle"
            size={24}
            onPress={() => setSearchQuery("")}
            style={styles.clearButton}
          />
        )}
      </View>

      <FlatList
        data={filteredStations}
        renderItem={renderStationCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.stationList}
      />
    </View>
  );
};

const HomeScreen = () => {
  const [index, setIndex] = useState(0);
  const routes = [
    { key: "home", title: "Home", icon: "home" },
    { key: "map", title: "Map", icon: "map" },
    { key: "settings", title: "Settings", icon: "cog" },
    { key: "about", title: "About", icon: "information" },
  ];

  const renderScene = BottomNavigation.SceneMap({
    home: HomeRoute,
    map: MapRoute,
    settings: SettingsRoute,
    about: AboutRoute,
  });

  return (
    <BottomNavigation
      navigationState={{ index, routes }}
      onIndexChange={setIndex}
      renderScene={renderScene}
      barStyle={styles.bottomNavBar}
      renderIcon={({ route, focused, color }) => (
        <Icon name={route.icon} size={24} color={color} />
      )}
    />
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f8f8" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
  },
  searchBar: {
    height: 40,
    flex: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#e8e8e8",
    color: "#333",
  },
  clearButton: {
    marginLeft: 8,
  },
  sectionTitle: { fontSize: 16, fontWeight: "bold", marginLeft: 16 },
  stationList: { paddingHorizontal: 16 },
  stationCard: {
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
    backgroundColor: "#fff",
  },
  stationName: { fontSize: 16, fontWeight: "bold", marginBottom: 4 },
  stationDetails: { fontSize: 14, color: "#555" },
  detailsButton: { marginTop: 8 },
  bottomNavBar: {
    backgroundColor: "#4CAF50",
  },
  toggleButtons: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  appTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  appTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "dark",
    marginRight: 0,
    fontFamily: "Roboto",
  },
});

export default HomeScreen;
