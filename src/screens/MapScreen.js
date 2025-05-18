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
import MapView, {
  Marker,
  PROVIDER_GOOGLE,
  Polyline,
  Callout,
} from "react-native-maps";
import * as Location from "expo-location";
import Constants from "expo-constants";
import { getRoadDistance } from "./getRoadDistance";
import PolylineDecoder from "polyline-encoded";
import { MenuProvider } from "react-native-popup-menu";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import StationData from "./StationData.js";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
const { height: screenHeight } = Dimensions.get("window");

const FILTER_OPTIONS = [
  { key: "all", label: "All" },
  { key: "cng", label: "CNG" },
  { key: "ev", label: "EV" },
  { key: "petrol", label: "Petrol/Diesel" },
];

const MapScreen = () => {
    const navigation = useNavigation();
  const googleMapsApiKey =
    Constants.expoConfig?.extra?.googleMapsApiKey || "API Key not found";

  const [location, setLocation] = useState({ latitude: 0, longitude: 0 });
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [selectedStationDistance, setSelectedStationDistance] = useState(null);
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedStationInfo, setSelectedStationInfo] = useState(null);

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
    setSelectedStationInfo(null); 

    if (!location.latitude || !location.longitude) return;

    try {
      const distance = await getRoadDistance(
        { latitude: location.latitude, longitude: location.longitude },
        { latitude: station.latitude, longitude: station.longitude }
      );
      setSelectedStationDistance(distance);
      setSelectedStationInfo({
        name: station.name,
        latitude: station.latitude,
        longitude: station.longitude,
      });

      if (station.routes?.[0]?.geometry) {
        const decoded = PolylineDecoder.decode(station.routes[0].geometry);
        setRouteCoordinates(decoded);
      } else {
        setRouteCoordinates([]);
      }
    } catch (error) {
      console.error("Error fetching distance:", error);
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
    if (station.petrol || station.diesel)
      return { name: "gas-station", color: "blue" };
    if (station.ev) return { name: "car-electric", color: "green" };
    if (station.cng) return { name: "fire", color: "red" };
    return { name: "map-marker", color: "gray" };
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

            const availableTypes = [];
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
                description={`Avialable : ${availableTypes.join(", ")}`}
                onPress={() => onMarkerPress(station)}
              >
                <Icon name={iconName} size={22} color={iconColor} />
              </Marker>
            );
          })}

          {routeCoordinates.length > 0 && (
            <Polyline
              coordinates={routeCoordinates.map(([lat, lon]) => ({
                latitude: lat,
                longitude: lon,
              }))}
              strokeColor="#009688"
              strokeWidth={4}
            />
          )}
        </MapView>

        <TouchableOpacity
          style={styles.myLocationButton}
          onPress={recenterMap}
          activeOpacity={0.7}
        >
          <Icon name="crosshairs-gps" size={30} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.filterToggleButton}
          onPress={toggleFilterPanel}
          activeOpacity={0.8}
        >
          <Icon name="filter-variant" size={24} color="white" />
        </TouchableOpacity>

        {selectedStationDistance !== null && (
          <TouchableOpacity
            style={styles.distanceBox}
            onPress={() => {
              if (!selectedStationInfo || !selectedStationDistance) {
                Alert.alert("No station info available");
                return;
              }

              const formattedName = `${selectedStationInfo.name}_${selectedStationInfo.latitude}_${selectedStationInfo.longitude}`;

              navigation.navigate("Details", {
                stationName: formattedName,
                stationCategory: "EV",
                distance: selectedStationDistance,
              });
            }}
            activeOpacity={0.8}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>
              Distance: {selectedStationDistance} km
            </Text>
            <Icon name="arrow-right" size={20} color="white" />
          </TouchableOpacity>
        )}

        {filterVisible && (
          <TouchableWithoutFeedback onPress={toggleFilterPanel}>
            <View style={styles.filterBackdrop} />
          </TouchableWithoutFeedback>
        )}

        <Animated.View
          style={[
            styles.filterPanel,
            {
              transform: [{ translateY: filterTranslateY }],
            },
          ]}
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {FILTER_OPTIONS.map(({ key, label }) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.filterOption,
                  selectedFilter === key && styles.filterOptionSelected,
                ]}
                onPress={() => onSelectFilter(key)}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    selectedFilter === key && styles.filterOptionTextSelected,
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>
      </View>
    </MenuProvider>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  searchContainer: {
    position: "absolute",
    top: 40,
    left: 10,
    right: 10,
    zIndex: 10,
  },
searchBar: {
  flexDirection: "row",
  backgroundColor: "#f9f9f9",
  borderRadius: 40,
  alignItems: "center",
  paddingHorizontal: 10,
  paddingVertical: 2,
  borderWidth: 1,
  borderColor: "#ddd",
  shadowColor: "#000",
  shadowOpacity: 0.05,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 1 },
  elevation: 4,
},

searchInput: {
  flex: 1,
  fontSize: 14,
  paddingHorizontal: 10,
  color: "#333",
},

  searchResults: {
    marginTop: 5,
    maxHeight: 200,
    backgroundColor: "#fff",
    borderRadius: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  searchResultItem: {
    padding: 10,
    left:10,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  noResults: {
    padding: 10,
  },
  myLocationButton: {
    position: "absolute",
    bottom: 75,
    right: 15,
    backgroundColor: "#009688",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },
  filterToggleButton: {
    position: "absolute",
    bottom: 15,
    right: 15,
    backgroundColor: "#009688",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },
  distanceBox: {
    position: "absolute",
    bottom: 140,
    right: 15,
    backgroundColor: "#009688",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },
  filterBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  filterPanel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    paddingVertical: 15,
    elevation: 15,
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -5 },
  },
  filterOption: {
    marginHorizontal: 15,
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#009688",
  },
  filterOptionSelected: {
    backgroundColor: "#009688",
  },
  filterOptionText: {
    color: "#009688",
    fontWeight: "bold",
    fontSize: 14,
  },
  filterOptionTextSelected: {
    color: "#fff",
  },
});

export default MapScreen;
