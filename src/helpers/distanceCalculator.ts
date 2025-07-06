import axios from "axios";
import config from "../config";

/**
 * Calculates the distance between a given latitude/longitude and a destination address using Google Distance Matrix API.
 * @param lat Latitude of origin
 * @param long Longitude of origin
 * @param address2 Destination address as a string
 * @returns Distance in kilometers (number) or null if failed
 */
export const calculateDistance = async (
  lat: number,
  long: number,
  address2: string
): Promise<number | null> => {
  try {
    if (!lat || !long || !address2) {
      return null;
    }
    const address1 = `${lat},${long}`;
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
      address1
    )}&destinations=${encodeURIComponent(address2)}&key=${config.google.mapKey}`;

    const response = await axios.get(url);

    const element = response.data?.rows?.[0]?.elements?.[0];
    if (element?.status === "OK") {
      const distanceInMeters = element.distance.value;
      const distanceInKm = distanceInMeters / 1000;
      return distanceInKm;
    } else {
      console.warn("Distance Matrix API returned:", element?.status);
      return null;
    }
  } catch (error) {
    console.error("Error calculating distance:", error);
    return null;
  }
};


// get latitude and longitude from address using google map api
export const getLatLongFromAddress = async (address: string): Promise<{ lat: number; long: number}> =>{
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${config.google.mapKey}`;
    const response = await axios.get(url);
    const result = response.data.results[0];
    const lat = result?.geometry?.location?.lat;
    const long = result?.geometry?.location?.lng;
    return { lat, long };
}

export const calculateDistanceInKm = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const toRad = (value: number) => (value * Math.PI) / 180;
  
    const R = 6371; // Earth radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };
  

