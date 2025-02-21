import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
} from "react-native";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
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

const MapScreen = () => {
  const googleMapsApiKey =
    Constants.expoConfig?.extra?.googleMapsApiKey || "API Key not found";

  const [location, setLocation] = useState(null);
  const mapRef = useRef(null);

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
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        2000
      );
    }
  };

  return (
    <MenuProvider>
      <View style={styles.container}>
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
            { featureType: "poi.business", stylers: [{ visibility: "off" }] },
            { featureType: "poi.medical", stylers: [{ visibility: "off" }] },
            { featureType: "poi.school", stylers: [{ visibility: "off" }] },
            { featureType: "poi.park", stylers: [{ visibility: "off" }] },
            {
              featureType: "poi.place_of_worship",
              stylers: [{ visibility: "off" }],
            },
            { featureType: "road", stylers: [{ visibility: "on" }] },
            { featureType: "transit", stylers: [{ visibility: "off" }] },
          ]}
        />

        <View style={styles.searchContainer}>
          <Icon
            name="magnify"
            size={24}
            color="gray"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchBar}
            placeholder="Search location"
            placeholderTextColor="gray"
          />
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
              <MenuOption onSelect={() => alert("EV Station")}>
                <View style={styles.menuItem}>
                  <Icon name="car-electric" size={20} color="green" />
                  <Text style={styles.menuText}> Nearest EV Station</Text>
                </View>
              </MenuOption>
              <MenuOption onSelect={() => alert("CNG Station")}>
                <View style={styles.menuItem}>
                  <Icon name="fire" size={20} color="red" />
                  <Text style={styles.menuText}> Nearest CNG Station</Text>
                </View>
              </MenuOption>
              <MenuOption onSelect={() => alert("Petrol Pump")}>
                <View style={styles.menuItem}>
                  <Icon name="gas-station" size={20} color="blue" />
                  <Text style={styles.menuText}> Nearest Petrol Pump</Text>
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    top: 35,
    left: 15,
    right: 15,
    backgroundColor: "#fff",
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 50,
    elevation: 5,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchBar: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  filterIcon: {
    marginLeft: 10,
  },
  menuOptions: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    elevation: 5,
    width: 210,
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
    marginLeft: 10,
  },
  locationButton: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 50,
    elevation: 3,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default MapScreen;
