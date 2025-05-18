import { ref, listAll, getDownloadURL, getMetadata } from "firebase/storage";
import { storage } from "../../firebaseConfig";
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Button, Image } from "react-native";
import { Appbar } from "react-native-paper";

const DetailsScreen = ({ route, navigation }) => {
  const { stationId, stationName, stationCategory, distance } = route.params;

  const displayStationName = stationName.split("_")[0];

  const [images, setImages] = useState([]);
  const [vehicleCounts, setVehicleCounts] = useState([]);
  const [timestamps, setTimestamps] = useState([]);
  const [estimatedTime, setEstimatedTime] = useState("");

  const fetchImages = async () => {
    try {
      const folderRef = ref(storage, `${stationCategory}/${stationName}`);
      const fileList = await listAll(folderRef);

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

      const latestFiles = fileData.slice(0, 2);

      const urls = await Promise.all(
        latestFiles.map(({ file }) => getDownloadURL(file))
      );
      setImages(urls);

      const counts = latestFiles.map(({ file }) => {
        const [countPart] = file.name.replace(".jpg", "").split("_");
        return countPart.replace("C", "");
      });
      setVehicleCounts(counts);

      const times = latestFiles.map(({ file }) => {
        const [, timePart, datePart] = file.name.replace(".jpg", "").split("_");
        const time = timePart.replace(/-/g, ":");
        const date = datePart.replace(/-/g, "/");
        return `${date} ${time}`;
      });
      setTimestamps(times);

      if (counts[0]) calculateEstimatedTime(counts[0], stationCategory);
    } catch (error) {
      console.error("Error fetching images: ", error);
    }
  };

  const calculateEstimatedTime = (count, category) => {
    const vehicleCount = parseInt(count) || 1;
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
    setEstimatedTime(`${time} Min`);
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleRefresh = () => {
    fetchImages();
  };

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={<Text style={styles.appTitle}>FuelQ</Text>} />
      </Appbar.Header>

      <View style={styles.detailsContainer}>
        <Text style={styles.stationName}>Station: {displayStationName}</Text>
        <Text style={styles.estimatedTimeText}>
          Waiting Time: {estimatedTime} (Estimated)
        </Text>
        <Text style={styles.estimatedTimeText}>Distance: {distance}</Text>
        <Button title="Refresh" onPress={handleRefresh} />

        {images.length > 0 && (
          <>
            {images.map((url, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image source={{ uri: url }} style={styles.image} />
                <Text style={styles.detailText}>Time: {timestamps[index]}</Text>
              </View>
            ))}
          </>
        )}
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
  detailsContainer: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "flex-start",
    marginTop: 20,
    marginLeft: 20,
  },
  stationName: {
    fontSize: 25,
    fontWeight: "bold",
    marginVertical: 10,
    textAlign: "left",
  },
  estimatedTimeText: {
    fontSize: 18,
    color: "#555",
    marginTop: 5,
  },
  imageContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  image: {
    width: 320,
    height: 180,
  },
  detailText: {
    fontSize: 18,
    color: "#555",
    marginTop: 5,
  },
});

export default DetailsScreen;
