import React, { useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet, FlatList } from "react-native";
import {
  Card,
  Button,
  Appbar,
  SegmentedButtons,
  IconButton,
} from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import { storage } from "../../firebaseConfig";
import { ref, listAll, getDownloadURL, getMetadata } from "firebase/storage";

const MainScreen = ({ email }) => {
  const navigation = useNavigation();
  const [stationType, setStationType] = useState("EV");
  const [searchQuery, setSearchQuery] = useState("");

  const [evStations, setEvStations] = useState([]);
  const [cngStations, setCngStations] = useState([]);
  const [petrolStations, setPetrolStations] = useState([]);

  const fetchStations = async (category, setStations) => {
    try {
      const folderRef = ref(storage, category);
      const result = await listAll(folderRef);

      const stations = await Promise.all(
        result.prefixes.map(async (folder) => {
          const stationName = folder.name;
          const stationId = folder.fullPath;

          const waitTime = await fetchLatestWaitTime(category, stationName);

          return {
            id: stationId,
            name: stationName,
            waitTime: waitTime || "N/A",
            distance: "0 KM",
            type: category,
          };
        })
      );

      setStations(stations);
    } catch (error) {
      console.error(`Error fetching ${category} stations:`, error);
    }
  };

  const fetchLatestWaitTime = async (category, stationName) => {
    try {
      const stationRef = ref(storage, `${category}/${stationName}`);
      const fileList = await listAll(stationRef);

      if (fileList.items.length === 0) return "N/A";

      const fileData = await Promise.all(
        fileList.items.map(async (file) => {
          const metadata = await getMetadata(file);
          return {
            file,
            timeCreated: new Date(metadata.timeCreated).getTime(),
          };
        })
      );

      fileData.sort((a, b) => b.timeCreated - a.timeCreated);
      const latestFile = fileData[0].file;

      const [countPart] = latestFile.name.replace(".jpg", "").split("_");
      const vehicleCount = parseInt(countPart.replace("C", "")) || 1;

      return calculateEstimatedTime(vehicleCount, category);
    } catch (error) {
      console.error(`Error fetching wait time for ${stationName}:`, error);
      return "N/A";
    }
  };

  const calculateEstimatedTime = (vehicleCount, category) => {
    let time = 0;

    switch (category) {
      case "EV":
        time = vehicleCount * 10;
        break;
      case "PETROL":
        time = vehicleCount * 0.5;
        break;
      case "CNG":
        time = vehicleCount * 3;
        break;
      default:
        time = "N/A";
    }
    return `${time} Min`;
  };

  useEffect(() => {
    if (stationType === "EV") {
      fetchStations("EV", setEvStations);
    } else if (stationType === "CNG") {
      fetchStations("CNG", setCngStations);
    } else if (stationType === "PETROL") {
      fetchStations("PETROL", setPetrolStations);
    }
  }, [stationType]);

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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f8f8" },
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
    fontFamily: "Roboto",
  },
});

export default MainScreen;
