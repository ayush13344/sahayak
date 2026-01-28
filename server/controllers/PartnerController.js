import axios from "axios";
import Partner from "../modal/Partner.js";

// Free geocoding using OpenStreetMap Nominatim
const geocodeLocation = async (address) => {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;

  const res = await axios.get(url, {
    headers: { "User-Agent": "YourAppNameHere" } // Required by OSM
  });

  if (res.data && res.data.length > 0) {
    const loc = res.data[0];
    return { lat: parseFloat(loc.lat), lng: parseFloat(loc.lon) };
  } else {
    throw new Error("Unable to fetch location coordinates");
  }
};


export const applyPartner = async (req, res) => {
  try {
    let location;

    // ✅ CASE 1: Frontend sent real lat/lng (Use Current Location)
    if (req.body.lat && req.body.lng) {
      location = {
        lat: Number(req.body.lat),
        lng: Number(req.body.lng),
      };
    }
    // ✅ CASE 2: User typed address manually
    else if (req.body.location) {
      location = await geocodeLocation(req.body.location);
    } 
    // ❌ No location at all
    else {
      return res.status(400).json({ message: "Location is required" });
    }

    const partner = await Partner.create({
      user: req.user._id,
      fullName: req.body.fullName,
      phone: req.body.phone,
      profession: req.body.profession,
      workType: req.body.workType,
      experience: req.body.experience,
      location, // ✅ CORRECT LOCATION SAVED
      idProof: req.files.idProof[0].path,
      skillProof: req.files.skillProof[0].path,
      status: "pending",
      isAvailable: true,
    });

    res.status(201).json({
      message: "Partner application submitted",
      partner,
    });
  } catch (error) {
    console.error("APPLY PROVIDER ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};
