export const getRoadDistance = async (origin, destination) => {
  const apiKey = "5b3ce3597851110001cf62480a4a21c409dc414a8c40fb82aaba5ed8";
  const url = "https://api.openrouteservice.org/v2/directions/driving-car";

  console.log("Origin Coordinates:", origin);
  console.log("Destination Coordinates:", destination);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        coordinates: [
          [origin.longitude, origin.latitude],
          [destination.longitude, destination.latitude],
        ],
      }),
    });

    const data = await response.json();
    console.log("OpenRouteService Response:", JSON.stringify(data, null, 2));

    const distanceInMeters = data?.routes?.[0]?.segments?.[0]?.distance;
    
    if (distanceInMeters) {
      const distanceInKm = (distanceInMeters / 1000).toFixed(2);
      console.log("Calculated Distance in Km:", distanceInKm);
      return distanceInKm;
    } else {
      console.warn("Distance not found in response.");
      return null;
    }
  } catch (error) {
    console.error("OpenRouteService error:", error);
    return null;
  }
};
