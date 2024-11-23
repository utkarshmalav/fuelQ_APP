import React from "react";
import { View, Text, StyleSheet, ScrollView, Image } from "react-native";
import { Appbar, Card } from "react-native-paper";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const AboutScreen = () => {
  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.header}>
        <View style={styles.headerContent}>
          <Icon name="fire" size={30} color="red" />
          <Text style={styles.appTitle}>FuelQ</Text>
          <Icon name="fire" size={30} color="red" />
        </View>
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.contentContainerInner}>
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.title}>Acknowledgement</Text>
              <View style={styles.imageContainer}>
                <Image
                  source={require("../../assets/KTMANESIR.jpg")}
                  style={styles.image}
                />
                <Text style={styles.name}>Prof. K T Mane</Text>
                <Text style={styles.role}>(Project Guide)</Text>
              </View>
              <Text style={styles.text}>
                We would like to thank our project guide, Professor K.T. Mane, for
                his valuable guidance and support throughout the development of
                this project.
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.title}>About this Project</Text>
              <Text style={styles.text}>
                This app, named FuelQ, is designed to solve the long queue issues
                at fuel stations, particularly CNG and EV stations. It allows
                users to check the estimated waiting time at fuel stations in
                real-time.
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.title}>Project Information</Text>
              <Text style={styles.text}>
                This app was created by Group 10 students as their final year
                project at D.Y. Patil College of Engineering & Technology,
                Kolhapur. The project was developed under the guidance of Prof. KT
                Mane Sir in the year 2024-2025.
              </Text>
            </Card.Content>
          </Card>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              © 2024 D.Y. Patil College of Engineering & Technology
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  header: {
    elevation: 0,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,

  },
  appTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#4CAF50",
    textAlign: "center",
  },
  contentContainer: {
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  contentContainerInner: {
    flex: 1,
  },
  card: {
    marginBottom: 16,
    borderRadius: 8,
    elevation: 3,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  text: {
    fontSize: 18,
    color: "#555",
    lineHeight: 24,
    marginBottom: 16,
    textAlign: "justify",
  },
  imageContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginTop: 8,
  },
  role: {
    fontSize: 14,
    color: "#777",
  },
  footer: {
    alignItems: "center",
    marginTop: 24,
    paddingVertical: 12,
  },
  footerText: {
    fontSize: 14,
    color: "#888",
    fontStyle: "italic",
  },
});

export default AboutScreen;
