import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  TextInput,
  ScrollView,
  Animated,
  Easing,
  Dimensions,
  TouchableWithoutFeedback,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import Constants from "expo-constants";
import { getRoadDistance } from "./getRoadDistance";
import PolylineDecoder from "polyline-encoded";

import { MenuProvider } from "react-native-popup-menu";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import StationData from "./StationData.js";

const { height: screenHeight } = Dimensions.get("window");

const FILTER_OPTIONS = [
  { key: "all", label: "All" },
  { key: "petrol", label: "Petrol/Diesel" },
  { key: "cng", label: "CNG" },
  { key: "ev", label: "EV" },
];

const MapScreen = () => {
  const googleMapsApiKey =
    Constants.expoConfig?.extra?.googleMapsApiKey || "API Key not found";

  const [location, setLocation] = useState({ latitude: 0, longitude: 0 });
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [selectedStationDistance, setSelectedStationDistance] = useState(null);
  const [filterVisible, setFilterVisible] = useState(false);

  const filterAnim = useRef(new Animated.Value(0)).current;

  const mapRef = useRef(null);
  const markerRefs = useRef({});

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location permission is required.");
        return;
      }

      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (newLocation) => setLocation(newLocation.coords)
      );

      return () => subscription.remove();
    })();
  }, []);

  const recenterMap = () => {
    if (!mapRef.current || !location.latitude || !location.longitude) return;
    mapRef.current.animateToRegion(
      {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      2000
    );
  };

  useEffect(() => {
    if (searchText.trim() === "") {
      setSearchResults([]);
      return;
    }
    const filtered = StationData.filter((station) =>
      station.name.toLowerCase().includes(searchText.toLowerCase())
    );
    setSearchResults(filtered);
  }, [searchText]);

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

    onMarkerPress(station);
  };

  const filteredStations = StationData.filter((station) => {
    switch (selectedFilter) {
      case "petrol":
        return station.petrol || station.diesel;
      case "cng":
        return station.cng;
      case "ev":
        return station.ev;
      case "all":
      default:
        return true;
    }
  });

  const onMarkerPress = async (station) => {
    setSelectedStationDistance(null);
    if (!location.latitude || !location.longitude) return;

    try {
      const distance = await getRoadDistance(
        { latitude: location.latitude, longitude: location.longitude },
        { latitude: station.latitude, longitude: station.longitude }
      );
      setSelectedStationDistance(distance);

      if (station.routes?.[0]?.geometry) {
        const decoded = PolylineDecoder.decode(station.routes[0].geometry);
        setRouteCoordinates(decoded);
      } else {
        setRouteCoordinates([]);
      }
    } catch {
      setRouteCoordinates([]);
    }
  };

  const toggleFilterPanel = () => {
    if (filterVisible) {
      Animated.timing(filterAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start(() => setFilterVisible(false));
    } else {
      setFilterVisible(true);
      Animated.timing(filterAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  };

  const onSelectFilter = (key) => {
    setSelectedFilter(key);
    toggleFilterPanel();
  };

  const filterTranslateY = filterAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [200, 0],
  });

  const getMarkerIcon = (station) => {
    if (station.petrol || station.diesel) return { name: "gas-station", color: "blue" };
    if (station.ev) return { name: "car-electric", color: "green" };
    if (station.cng) return { name: "fire", color: "red" };
    return { name: "map-marker", color: "gray" };
  };

  const getFuelText = (station) => {
    const types = [];
    if (station.petrol) types.push("Petrol");
    if (station.diesel) types.push("Diesel");
    if (station.ev) types.push("EV");
    if (station.cng) types.push("CNG");
    return types.join(", ");
  };

  const onArrowPress = (station, distance) => {
    Alert.alert(
      "Station Info",
      `Name: ${station.name}\nLatitude: ${station.latitude}\nLongitude: ${station.longitude}\nDistance: ${
        distance ? distance + " km" : "N/A"
      }`
    );
  };

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
            <TouchableOpacity onPress={() => {}}>
              <Icon name="magnify" size={24} color="gray" style={{ marginRight: 10 }} />
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
                    style={styles.searchResultItem}
                    onPress={() => goToStation(station)}
                  >
                    <Text>{station.name}</Text>
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
          {filteredStations.map((station) => {
            const { name: iconName, color: iconColor } = getMarkerIcon(station);
            return (
              <Marker
                key={station.id}
                ref={(ref) => (markerRefs.current[station.id] = ref)}
                coordinate={{
                  latitude: station.latitude,
                  longitude: station.longitude,
                }}
                onPress={() => onMarkerPress(station)}
                title={station.name}
                description={`${getFuelText(station)} ${
                  selectedStationDistance ? `(${selectedStationDistance} km)` : ""
                }`}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Icon name={iconName} size={22} color={iconColor} />
                  <TouchableOpacity
                    onPress={() => onArrowPress(station, selectedStationDistance)}
                    style={{ marginLeft: 8, padding: 4 }}
                  >
                    <Icon name="arrow-right" size={18} color="#007AFF" />
                  </TouchableOpacity>
                </View>
              </Marker>
            );
          })}

          {routeCoordinates.length > 0 && (
            <Polyline
              coordinates={routeCoordinates.map(([lat, lng]) => ({
                latitude: lat,
                longitude: lng,
              }))}
              strokeColor="blue"
              strokeWidth={5}
            />
          )}
        </MapView>

        <View style={styles.controlsContainer}>
          <TouchableOpacity
            onPress={toggleFilterPanel}
            style={styles.filterButton}
            activeOpacity={0.8}
          >
            <Icon name="filter" size={28} color="#007AFF" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={recenterMap}
            style={styles.locationButton}
            activeOpacity={0.8}
          >
            <Icon name="crosshairs-gps" size={32} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {filterVisible && (
          <TouchableWithoutFeedback onPress={toggleFilterPanel}>
            <View style={styles.filterOverlay}>
              <Animated.View
                style={[styles.filterPanel, { transform: [{ translateY: filterTranslateY }] }]}
              >
                <Text style={styles.filterTitle}>Select Fuel Type</Text>
                {FILTER_OPTIONS.map(({ key, label }) => {
                  const selected = selectedFilter === key;
                  return (
                    <TouchableOpacity
                      key={key}
                      style={[styles.filterOption, selected && styles.filterOptionSelected]}
                      onPress={() => onSelectFilter(key)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.filterOptionText,
                          selected && styles.filterOptionTextSelected,
                        ]}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </Animated.View>
            </View>
          </TouchableWithoutFeedback>
        )}
      </View>
    </MenuProvider>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f8f8" },
  map: { ...StyleSheet.absoluteFillObject },
  searchContainer: {
    position: "absolute",
    top: 40,
    left: 10,
    right: 10,
    zIndex: 3,
  },
  searchBar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 6,
    borderRadius: 30,
    alignItems: "center",
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    paddingLeft: 12,
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
  controlsContainer: {
    position: "absolute",
    bottom: 15,
    right: 10,
    alignItems: "center",
  },
  filterButton: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 50,
    marginBottom: 12,
    elevation: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  locationButton: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 50,
    elevation: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  filterOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
    zIndex: 10,
  },
  filterPanel: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 25,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    elevation: 10,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  filterOption: {
    paddingVertical: 12,
    borderRadius: 8,
    marginVertical: 5,
    backgroundColor: "#f2f2f2",
    alignItems: "center",
  },
  filterOptionSelected: {
    backgroundColor: "#007AFF",
  },
  filterOptionText: {
    fontSize: 16,
    color: "#333",
  },
  filterOptionTextSelected: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default MapScreen;
