import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Appbar } from "react-native-paper";

const DetailsScreen = ({ route, navigation }) => {
  const { stationId, stationName } = route.params;

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={<Text style={styles.appTitle}>FuelQ</Text>} />
      </Appbar.Header>
      <View style={styles.detailsContainer}>
        <Text style={styles.stationName}>Station: {stationName}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f8f8" },
  appbar: { backgroundColor: "#4CAF50" },
  appTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  detailsContainer: { flex: 1, justifyContent: "flex-start", alignItems: "flex-start", marginTop: 20, marginLeft: 20 },
  stationName: {
    fontSize: 25,
    fontWeight: "bold",
    marginVertical: 10,
    textAlign: "left",
  },
});

export default DetailsScreen;
