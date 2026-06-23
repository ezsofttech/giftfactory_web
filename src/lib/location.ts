export interface DetectedAddress {
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  formattedAddress: string;
  latitude?: number;
  longitude?: number;
}

/**
 * Requests the user's current GPS coordinates using the browser Geolocation API.
 */
export function getBrowserCoordinates(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  });
}

/**
 * Reverse geocodes latitude and longitude coordinates into a human-readable address using Google Maps API.
 */
export async function reverseGeocode(latitude: number, longitude: number): Promise<DetectedAddress | null> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error("Google Maps API Key (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) is not defined.");
    return null;
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
    );
    if (!response.ok) {
      throw new Error(`Geocoding API responded with HTTP status ${response.status}`);
    }

    const data = await response.json();
    if (data.status !== "OK" || !data.results || data.results.length === 0) {
      console.warn("Geocoding failed or returned no results:", data);
      return null;
    }

    // Find the best match (usually results[0] is the most specific street address)
    const result = data.results[0];
    const components = result.address_components;

    let streetNumber = "";
    let route = "";
    let sublocality = "";
    let neighborhood = "";
    let city = "";
    let state = "";
    let country = "INDIA";
    let zipCode = "";

    for (const comp of components) {
      const types = comp.types || [];
      if (types.includes("street_number")) {
        streetNumber = comp.long_name;
      } else if (types.includes("route")) {
        route = comp.long_name;
      } else if (types.includes("sublocality") || types.includes("sublocality_level_1")) {
        sublocality = comp.long_name;
      } else if (types.includes("neighborhood")) {
        neighborhood = comp.long_name;
      } else if (types.includes("locality")) {
        city = comp.long_name;
      } else if (types.includes("administrative_area_level_2") && !city) {
        city = comp.long_name; // fallback city
      } else if (types.includes("administrative_area_level_1")) {
        state = comp.long_name;
      } else if (types.includes("country")) {
        country = comp.long_name;
      } else if (types.includes("postal_code")) {
        zipCode = comp.long_name;
      }
    }

    // Construct address lines
    const streetParts = [streetNumber, route].filter(Boolean);
    const line1 = streetParts.join(" ") || sublocality || neighborhood || city;
    const line2 = (streetParts.join(" ") && (sublocality || neighborhood))
      ? [sublocality, neighborhood].filter(Boolean).join(", ")
      : "";

    return {
      addressLine1: line1,
      addressLine2: line2,
      city: city || "Unknown City",
      state: state || "Unknown State",
      country: country.toUpperCase(),
      zipCode: zipCode || "",
      formattedAddress: result.formatted_address || "",
      latitude,
      longitude,
    };
  } catch (error) {
    console.error("Error during reverse geocoding:", error);
    return null;
  }
}

/**
 * Attempts to automatically get user coordinates and resolve them to an address.
 */
export async function autoDetectLocation(): Promise<DetectedAddress | null> {
  try {
    const coords = await getBrowserCoordinates();
    return await reverseGeocode(coords.latitude, coords.longitude);
  } catch (error) {
    console.warn("Failed to automatically detect location:", error);
    return null;
  }
}
