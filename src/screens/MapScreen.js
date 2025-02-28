import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, TouchableOpacity, Text, Alert } from "react-native";
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
            { featureType: "poi", stylers: [{ visibility: "off" }] },
            { featureType: "transit", stylers: [{ visibility: "off" }] },
            { featureType: "road", stylers: [{ visibility: "on" }] },
            { featureType: "administrative", stylers: [{ visibility: "off" }] },
          ]}
        >
          {StationData.map((station) => {
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
                coordinate={{
                  latitude: station.latitude,
                  longitude: station.longitude,
                }}
                title={station.name}
                description={"Available : " + availableTypes.join(", ")}
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
    marginLeft: 10,
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
    borderRadius: 50,
    padding: 10,
    elevation: 5,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default MapScreen;
