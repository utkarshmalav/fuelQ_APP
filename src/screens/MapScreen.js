import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  TextInput,
  ScrollView,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import Constants from "expo-constants";
import {
  MenuProvider,
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from "react-native-popup-menu";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import StationData from "./StationData.js"; 

const MapScreen = () => {
  const googleMapsApiKey =
    Constants.expoConfig?.extra?.googleMapsApiKey || "API Key not found";

  const [location, setLocation] = useState({
    latitude: 0,
    longitude: 0,
  });
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const mapRef = useRef(null);
  const markerRefs = useRef({});

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location permission is required.");
        return;
      }

      const locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (newLocation) => {
          setLocation(newLocation.coords); 
        }
      );

      return () => locationSubscription.remove();
    })();
  }, []);

  const recenterMap = () => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: location.latitude || 0, 
          longitude: location.longitude || 0, 
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        2000
      );
    }
  };

  const handleSearch = () => {
    const matches = StationData.filter((station) =>
      station.name.toLowerCase().includes(searchText.toLowerCase())
    );
    setSearchResults(matches);
  };

  const goToStation = (station) => {
    setSearchText("");
    setSearchResults([]);
    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: station.latitude,
          longitude: station.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        },
        1000
      );
    }
    setTimeout(() => {
      markerRefs.current[station.id]?.showCallout();
    }, 1200);
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; 
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; 
    return distance;
  };

  const filteredStations = StationData.filter((station) => {
    if (selectedFilter === "all") return true;
    if (selectedFilter === "petrol") return station.petrol || station.diesel;
    if (selectedFilter === "cng") return station.cng;
    if (selectedFilter === "ev") return station.ev;
    return false;
  });

  const addDistanceToStations = (stations) => {
    return stations.map((station) => {
      const distance = calculateDistance(
        location.latitude,
        location.longitude,
        station.latitude,
        station.longitude
      );
      return { ...station, distance };
    });
  };

  useEffect(() => {
    if (searchText.trim() === "") {
      setSearchResults([]);
    } else {
      handleSearch();
    }
  }, [searchText]);

  const stationsWithDistance = addDistanceToStations(filteredStations);

  return (
    <MenuProvider>
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search station..."
              value={searchText}
              onChangeText={setSearchText}
            />
            {searchText !== "" && (
              <TouchableOpacity
                onPress={() => {
                  setSearchText("");
                  setSearchResults([]);
                }}
              >
                <Icon name="close" size={22} color="gray" />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={handleSearch}>
              <Icon
                name="magnify"
                size={24}
                color="gray"
                style={{ marginRight: 10 }}
              />
            </TouchableOpacity>
          </View>
          {searchText !== "" && (
            <ScrollView style={styles.searchResults} nestedScrollEnabled={true}>
              {searchResults.length === 0 ? (
                <View style={styles.noResults}>
                  <Text style={{ textAlign: "center", color: "#888" }}>
                    No results found
                  </Text>
                </View>
              ) : (
                searchResults.map((station) => (
                  <TouchableOpacity
                    key={station.id}
                    onPress={() => goToStation(station)}
                    style={styles.searchResultItem}
                  >
                    <Text>
                      {station.name}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          )}
        </View>

        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{
            latitude: 16.7320901,
            longitude: 74.237955,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation={true}
          showsCompass={true}
          showsMyLocationButton={false}
          customMapStyle={[
            { featureType: "poi", stylers: [{ visibility: "off" }] },
            { featureType: "transit", stylers: [{ visibility: "off" }] },
            { featureType: "road", stylers: [{ visibility: "on" }] },
            { featureType: "administrative", stylers: [{ visibility: "off" }] },
          ]}
        >
          {stationsWithDistance.map((station) => {
            let iconName = "gas-station";
            let iconColor = "blue";

            if (station.petrol || station.diesel) {
              iconName = "gas-station";
              iconColor = "blue";
            } else if (station.ev) {
              iconName = "car-electric";
              iconColor = "green";
            } else if (station.cng) {
              iconName = "fire";
              iconColor = "red";
            }

            let availableTypes = [];
            if (station.petrol) availableTypes.push("Petrol");
            if (station.diesel) availableTypes.push("Diesel");
            if (station.cng) availableTypes.push("CNG");
            if (station.ev) availableTypes.push("EV");

            return (
              <Marker
                key={station.id}
                ref={(ref) => (markerRefs.current[station.id] = ref)}
                coordinate={{
                  latitude: station.latitude,
                  longitude: station.longitude,
                }}
                title={station.name}
                description={`${availableTypes.join(
                  ", "
                )} (${station.distance.toFixed(2)} km)`}
              >
                <Icon name={iconName} size={22} color={iconColor} />
              </Marker>
            );
          })}
        </MapView>

        <View style={styles.filterContainer}>
          <Menu>
            <MenuTrigger>
              <Icon
                name="filter"
                size={24}
                color="gray"
                style={styles.filterIcon}
              />
            </MenuTrigger>
            <MenuOptions style={styles.menuOptions}>
              <View style={styles.menuHeader}>
                <Text style={styles.menuHeaderText}>Sort by</Text>
              </View>
              <MenuOption onSelect={() => setSelectedFilter("all")}>
                <View
                  style={[
                    styles.menuItem,
                    selectedFilter === "all" && styles.selectedMenuItem,
                  ]}
                >
                  <Icon name="filter-outline" size={20} color="black" />
                  <Text style={styles.menuText}> Show All</Text>
                </View>
              </MenuOption>
              <MenuOption onSelect={() => setSelectedFilter("ev")}>
                <View
                  style={[
                    styles.menuItem,
                    selectedFilter === "ev" && styles.selectedMenuItem,
                  ]}
                >
                  <Icon name="car-electric" size={20} color="green" />
                  <Text style={styles.menuText}> Nearby EV Stations</Text>
                </View>
              </MenuOption>
              <MenuOption onSelect={() => setSelectedFilter("cng")}>
                <View
                  style={[
                    styles.menuItem,
                    selectedFilter === "cng" && styles.selectedMenuItem,
                  ]}
                >
                  <Icon name="fire" size={20} color="red" />
                  <Text style={styles.menuText}> Nearby CNG Stations</Text>
                </View>
              </MenuOption>
              <MenuOption onSelect={() => setSelectedFilter("petrol")}>
                <View
                  style={[
                    styles.menuItem,
                    selectedFilter === "petrol" && styles.selectedMenuItem,
                  ]}
                >
                  <Icon name="gas-station" size={20} color="blue" />
                  <Text style={styles.menuText}> Nearby Petrol Pumps</Text>
                </View>
              </MenuOption>
            </MenuOptions>
          </Menu>
        </View>

        <TouchableOpacity style={styles.locationButton} onPress={recenterMap}>
          <Icon name="crosshairs-gps" size={32} color="#007AFF" />
        </TouchableOpacity>
      </View>
    </MenuProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  filterIcon: {
    alignSelf: "center",
  },
  menuOptions: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    elevation: 5,
    width: 210,
    position: "absolute",
    right: 0,
    bottom: 15,
  },
  menuHeader: {
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingBottom: 5,
    marginBottom: 5,
  },
  menuHeaderText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  menuText: {
    fontSize: 16,
    marginLeft: 8,
  },
  selectedMenuItem: {
    backgroundColor: "#e0e0e0",
    borderRadius: 5,
    padding: 0,
    width: 190,
  },
  locationButton: {
    position: "absolute",
    bottom: 15,
    right: 10,
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 50,
    elevation: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  filterContainer: {
    position: "absolute",
    bottom: 75,
    right: 10,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 50,
    elevation: 3,
  },
  searchContainer: {
    position: "absolute",
    top: 40,
    left: 10,
    right: 10,
    zIndex: 1,
  },
  searchBar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 3,
    borderRadius: 30,
    alignItems: "center",
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    paddingLeft: 10,
  },
  searchResults: {
    maxHeight: 200,
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 5,
    marginTop: 10,
  },
  searchResultItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  noResults: {
    padding: 20,
    alignItems: "center",
  },
});

export default MapScreen;
