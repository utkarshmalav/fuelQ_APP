import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
} from "react-native";
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
import { useNavigation } from "@react-navigation/native";

const evStations = [
  {
    id: "1",
    name: "DYP",
    waitTime: "0 mins",
    distance: "0 km",
    type: "EV",
  },
];

const cngStations = [
  {
    id: "1",
    name: "CNG1",
    waitTime: "0 mins",
    distance: "0 km",
    type: "CNG",
  },
];

const petrolStations = [
  {
    id: "3",
    name: "PETROL1",
    waitTime: "0 mins",
    distance: "0 km",
    type: "PETROL",
  },
];

const HomeRoute = ({ email }) => <InteractiveHome email={email} />;
const MapRoute = () => (
  <View style={styles.centered}>
    <Text>Map Screen</Text>
  </View>
);

const SettingsRoute = ({ navigation, route }) => (
  <SettingScreen navigation={navigation} route={route} />
);

const AboutRoute = () => <AboutScreen />;

const InteractiveHome = ({ email }) => {
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
              stationCategory: stationType,
            })
          }
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
            value: "PETROL",
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

const HomeScreen = ({ route }) => {
  const email = route?.params?.email || "Guest";
  const [index, setIndex] = useState(0);

  const routes = [
    { key: "home", title: "Home", icon: "home" },
    { key: "map", title: "Map", icon: "map" },
    { key: "settings", title: "Settings", icon: "cog", params: { email } },
    { key: "about", title: "About", icon: "information" },
  ];

  const renderScene = BottomNavigation.SceneMap({
    home: (props) => <HomeRoute email={email} {...props} />,
    map: MapRoute,
    settings: (props) => <SettingsRoute {...props} />,
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
  searchContainer: { flexDirection: "row", alignItems: "center", margin: 16 },
  searchBar: {
    height: 40,
    flex: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#e8e8e8",
    color: "#333",
  },
  clearButton: { marginLeft: 8 },
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
  bottomNavBar: { backgroundColor: "#4CAF50" },
  toggleButtons: { marginHorizontal: 16, marginVertical: 8 },
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
