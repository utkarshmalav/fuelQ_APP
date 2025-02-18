import React, { useState } from "react";
import { BottomNavigation } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import SettingScreen from "../screens/SettingScreen";
import AboutScreen from "../screens/AboutScreen";
import MapScreen from "../screens/MapScreen";
import MainScreen from "../screens/MainScreen";

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
    home: () => <MainScreen email={email} />,
    map: () => <MapScreen />,
    settings: (props) => <SettingScreen {...props} />,
    about: () => <AboutScreen />,
  });

  return (
    <BottomNavigation
      navigationState={{ index, routes }}
      onIndexChange={setIndex}
      renderScene={renderScene}
      barStyle={{ backgroundColor: "#4CAF50" }}
      renderIcon={({ route, color }) => <Icon name={route.icon} size={24} color={color} />}
    />
  );
};

export default HomeScreen;
