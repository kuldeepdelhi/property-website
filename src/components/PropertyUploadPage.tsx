import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import PropertyImageUpload, { UploadedImage } from "./PropertyImageUpload";
import { animations, variants } from "../theme";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faBuilding,
  faMapMarkerAlt,
  faTag,
  faBed,
  faBath,
  faRuler,
  faCar,
  faShieldAlt,
  faTree,
  faWifi,
  faWheelchair,
  faSwimmingPool,
  faVideo,
  faChargingStation,
  faUsers,
  faRunning,
  faBolt,
  faPhone,
  faTint,
  faUtensils,
  faTv,
  faWind,
  faCouch,
  faChair,
  faUtensilSpoon,
  faSnowflake,
  faEye,
  faMountain,
  faWater,
  faRoad,
  faSeedling,
  faCity,
  faUmbrellaBeach,
  faCheckCircle,
  faExclamationTriangle,
  faSpinner,
  faUpload,
  faImage,
} from "@fortawesome/free-solid-svg-icons";

import StateCityLocalityPicker from "./StateCityLocalityPicker";

interface PropertyFormData {
  // Basic required fields
  propertyId?: string;
  userId: string;
  addressState: string;
  addressCity: string;
  addressLocality: string;
  category: "Residential" | "Commercial";
  subCategory:
  | "Flats"
  | "Builder Floors"
  | "House Villas"
  | "Plots"
  | "Farmhouses"
  | "Hotels"
  | "Lands"
  | "Office Spaces"
  | "Hostels"
  | "Shops Showrooms"
  | "Restaurants"
  | "Cafes"
  | "Bars";
  title?: string;
  description?: string;
  isSale?: "Sell" | "Rent" | "Lease";

  // Property details
  projectName?: string;
  propertyName?: string;
  totalBathrooms?: number;
  totalRooms?: number;
  propertyPrice?: number;
  carpetArea?: number;
  buildupArea?: number;
  bhks?: string;
  furnishing?: string;
  constructionStatus?: string;
  propertyFacing?: string;
  ageOfTheProperty?: string;
  reraApproved?: boolean;
  amenities?: string[];
  fencing?: string;

  // Dimensions
  width?: number;
  height?: number;
  length?: number;
  totalArea?: number;
  plotArea?: number;
  landArea?: number;
  distFromOutRRoad?: number;
  unit?: string;

  // Additional fields
  viewFromProperty?: string[];
  soilType?: string;
  approachRoad?: string;
  totalfloors?: string;
  officefloor?: string;
  yourfloor?: string;
  cabins?: string;
  parking?: string;
  washroom?: string;
  availablefor?: string;
  agentNotes?: string;
  workingWithAgent?: boolean;
  furnishingAmenities?: string[];
  landType?: "agricultural" | "commercial" | "industrial";
  independent?: boolean;
  seatingCapacity?: string | number;
  noOfWashrooms?: string | number;

  // Hostel-specific fields
  attachedWashroom?: string | null;
  roomType?: string | null;
  genderPreference?: string | null;
  mealIncluded?: string | null;
  liftAvailable?: string | null;
  noOfBedrooms?: number | null;

  // Images
  images: UploadedImage[];
}

type SaleType = "Sell" | "Rent" | "Lease";
type SubCategory = string;

interface FieldConfig {
  name: string;
  required: boolean;
}

export const validationRules: Record<
  SubCategory,
  Partial<Record<SaleType, FieldConfig[]>>
> = {
  // ===== RESIDENTIAL =====
  "Flats": {
    "Sell": [
      { name: "projectName", required: true },
      { name: "propertyPrice", required: true },
      { name: "totalBathrooms", required: true },
      { name: "totalfloors", required: true },
      { name: "yourfloor", required: true },
      { name: "carpetArea", required: true },
      { name: "buildupArea", required: true },
      { name: "bhks", required: true },
      { name: "constructionStatus", required: true },
      { name: "furnishing", required: true },
      { name: "propertyFacing", required: true },
      { name: "ageOfTheProperty", required: true },
      { name: "reraApproved", required: false },
    ],
    "Rent": [
      { name: "projectName", required: true },
      { name: "propertyPrice", required: true },
      { name: "totalBathrooms", required: true },
      { name: "totalfloors", required: true },
      { name: "yourfloor", required: true },
      { name: "carpetArea", required: true },
      { name: "buildupArea", required: true },
      { name: "ageOfTheProperty", required: true },
      { name: "furnishing", required: true },
      { name: "bhks", required: true },
      { name: "propertyFacing", required: true },
      { name: "independent", required: true }
    ],
  },
  "Builder Floors": {
    "Sell": [
      { name: "projectName", required: true },
      { name: "propertyPrice", required: true },
      { name: "totalBathrooms", required: true },
      { name: "totalfloors", required: true },
      { name: "yourfloor", required: true },
      { name: "carpetArea", required: true },
      { name: "buildupArea", required: true },
      { name: "bhks", required: true },
      { name: "constructionStatus", required: true },
      { name: "furnishing", required: true },
      { name: "propertyFacing", required: true },
      { name: "ageOfTheProperty", required: true },
      { name: "reraApproved", required: false },
    ],
    "Rent": [
      { name: "projectName", required: true },
      { name: "propertyPrice", required: true },
      { name: "totalBathrooms", required: true },
      { name: "totalfloors", required: true },
      { name: "yourfloor", required: true },
      { name: "carpetArea", required: true },
      { name: "buildupArea", required: true },
      { name: "ageOfTheProperty", required: true },
      { name: "furnishing", required: true },
      { name: "bhks", required: true },
      { name: "propertyFacing", required: true },
      { name: "independent", required: true }
    ],
  },
  "House Villas": {
    "Sell": [
      { name: "projectName", required: false },
      { name: "totalBathrooms", required: true },
      { name: "propertyPrice", required: true },
      { name: "carpetArea", required: true },
      { name: "buildupArea", required: true },
      { name: "bhks", required: true },
      { name: "propertyFacing", required: true },
      { name: "furnishing", required: true },
      { name: "constructionStatus", required: true },
      { name: "ageOfTheProperty", required: true },
      { name: "totalfloors", required: true },
      { name: "yourfloor", required: true },
      { name: "reraApproved", required: false }
    ],
    "Rent": [
      { name: "projectName", required: false },
      { name: "totalBathrooms", required: true },
      { name: "propertyPrice", required: true },
      { name: "carpetArea", required: true },
      { name: "buildupArea", required: true },
      { name: "bhks", required: true },
      { name: "propertyFacing", required: true },
      { name: "furnishing", required: true },
      { name: "ageOfTheProperty", required: true },
      { name: "totalfloors", required: true },
      { name: "yourfloor", required: true }
    ],
  },
  "Plots": {
    "Sell": [
      { name: "projectName", required: false },
      { name: "propertyPrice", required: true },
      { name: "length", required: true },
      { name: "width", required: true },
      { name: "propertyFacing", required: true },
      { name: "reraApproved", required: false }
    ],
    "Lease": [
      { name: "projectName", required: false },
      { name: "propertyPrice", required: true },
      { name: "length", required: true },
      { name: "width", required: true },
      { name: "propertyFacing", required: true }
    ],
  },
  "Farmhouses": {
    "Sell": [
      { name: "projectName", required: false },
      { name: "propertyPrice", required: true },
      { name: "totalBathrooms", required: false },
      { name: "length", required: true },
      { name: "width", required: true },
      { name: "bhks", required: false },
      { name: "furnishing", required: false },
      { name: "viewFromProperty", required: true },
      { name: "propertyFacing", required: true },
      { name: "ageOfTheProperty", required: false },
      { name: "reraApproved", required: false } //sale me ye option different hai only 
    ],
    "Rent": [
      { name: "projectName", required: false },
      { name: "propertyPrice", required: true },
      { name: "totalBathrooms", required: false },
      { name: "length", required: true },
      { name: "width", required: true },
      { name: "bhks", required: false },
      { name: "furnishing", required: false },
      { name: "viewFromProperty", required: true },
      { name: "propertyFacing", required: true },
      { name: "ageOfTheProperty", required: false },
      { name: "independent", required: true }, //rent me ye option different hai only
    ],
  },

  // ===== COMMERCIAL =====
  "Hotels": {
    "Sell": [
      { name: "propertyName", required: true },
      { name: "totalRooms", required: true },
      { name: "propertyPrice", required: true },
      { name: "carpetArea", required: true },
      { name: "plotArea", required: true },
      { name: "furnishing", required: true },
      { name: "constructionStatus", required: true },
      { name: "ageOfTheProperty", required: true },
      { name: "propertyFacing", required: true },
    ],
    "Lease": [
      { name: "propertyName", required: true },
      { name: "totalRooms", required: true },
      { name: "propertyPrice", required: true },
      { name: "carpetArea", required: true },
      { name: "plotArea", required: true },
      { name: "furnishing", required: true },
      { name: "constructionStatus", required: true },
      { name: "ageOfTheProperty", required: true },
      { name: "propertyFacing", required: true }
    ]
  },
  "Lands": {
    "Sell": [
      { name: "propertyPrice", required: true },
      { name: "landArea", required: true },
      { name: "landType", required: true },
      { name: "approachRoad", required: true }
    ],
    "Rent": [
      { name: "propertyPrice", required: true },
      { name: "landArea", required: true },
      { name: "landType", required: true },
      { name: "approachRoad", required: true }
    ],
    // "Lease": [
    //   { name: "propertyPrice", required: true },
    //   { name: "landArea", required: true },
    //   { name: "landType", required: true },
    //   { name: "approachRoad", required: true }
    // ]
  },
  "Office Spaces": {
    "Sell": [
      { name: "projectName", required: false },
      { name: "propertyPrice", required: true },
      { name: "carpetArea", required: true },
      { name: "buildupArea", required: true },
      { name: "totalfloors", required: false },
      { name: "yourfloor", required: false },
      { name: "cabins", required: false },
      { name: "furnishing", required: false },
      { name: "parking", required: false },
      { name: "washroom", required: false },
      { name: "constructionStatus", required: true },
      { name: "propertyFacing", required: true },
      { name: "ageOfTheProperty", required: true },
      { name: "reraApproved", required: false }  //sale me ye option different hai only 
    ],
    "Rent": [
      { name: "projectName", required: false },
      { name: "propertyPrice", required: true },
      { name: "carpetArea", required: true },
      { name: "buildupArea", required: true },
      { name: "totalfloors", required: false },
      { name: "yourfloor", required: false },
      { name: "cabins", required: false },
      { name: "furnishing", required: false },
      { name: "parking", required: false },
      { name: "washroom", required: false },
      // { name: "constructionStatus", required: true },
      { name: "propertyFacing", required: true },
      { name: "ageOfTheProperty", required: true },
      { name: "reraApproved", required: false }  //sale me ye option different hai only
    ],
  },
  "Shops Showrooms": {
    "Sell": [
      { name: "projectName", required: false },
      { name: "propertyPrice", required: true },
      { name: "length", required: true },
      { name: "width", required: true },
      { name: "totalfloors", required: false },
      { name: "yourfloor", required: false },
      { name: "furnishing", required: false },
      { name: "constructionStatus", required: true },
      { name: "propertyFacing", required: true },
      { name: "ageOfTheProperty", required: true },
      { name: "parking", required: false },
      { name: "washroom", required: false },
      { name: "reraApproved", required: false }
    ],
    "Rent": [
      { name: "projectName", required: false },
      { name: "propertyPrice", required: true },
      { name: "length", required: true },
      { name: "width", required: true },
      { name: "totalfloors", required: false },
      { name: "yourfloor", required: false },
      { name: "furnishing", required: false },
      // { name: "constructionStatus", required:true },
      { name: "propertyFacing", required: true },
      { name: "ageOfTheProperty", required: true },
      { name: "parking", required: false },
      { name: "washroom", required: false },
      { name: "reraApproved", required: false }
    ],
  },
  "Hostels": {
    "Rent": [
      // Fallback for Hostels Sell if ever selected
      { name: "propertyName", required: true },
      { name: "noOfBeds", required: true },
      { name: "propertyPrice", required: true },
      { name: "attachedWashroom", required: true },
      { name: "genderPreference", required: true },
      { name: "mealIncluded", required: true },
      { name: "totalfloors", required: true },
      { name: "yourfloor", required: true },
      { name: "liftAvailable", required: true },
      { name: "roomType", required: true },
      { name: "ageOfTheProperty", required: false },
    ],
    "Sell": [
      { name: "propertyName", required: true },
      { name: "propertyPrice", required: true },
      { name: "totalRooms", required: true },
      { name: "totalfloors", required: true },
      { name: "carpetArea", required: true },
      { name: "plotArea", required: true },
      { name: "furnishing", required: true },
      { name: "propertyFacing", required: false },
      { name: "ageOfTheProperty", required: false },
      { name: "constructionStatus", required: false }
    ],
    "Lease": [
      { name: "propertyName", required: true },
      { name: "totalRooms", required: true },
      { name: "propertyPrice", required: true },
      { name: "totalfloors", required: true },
      { name: "carpetArea", required: true },
      { name: "plotArea", required: true },
      { name: "furnishing", required: true },
      { name: "propertyFacing", required: false },
      { name: "ageOfTheProperty", required: false },
      { name: "constructionStatus", required: false }
    ]
  },
  "Restaurants": {
    "Sell": [
      { name: "propertyName", required: false },
      { name: "propertyPrice", required: true },
      { name: "seatingCapacity", required: true },
      { name: "noOfWashrooms", required: true },
      { name: "totalArea", required: true },
      { name: "furnishing", required: true },
      { name: "propertyFacing", required: true },
      { name: "ageOfTheProperty", required: true },
      { name: "totalfloors", required: false },
      { name: "yourfloor", required: false },
      { name: "parking", required: false },
      { name: "liftAvailable", required: false },
      { name: "reraApproved", required: false }
    ],
    "Lease": [
      { name: "propertyName", required: false },
      { name: "propertyPrice", required: true },
      { name: "seatingCapacity", required: true },
      { name: "noOfWashrooms", required: true },
      { name: "totalArea", required: true },
      { name: "furnishing", required: true },
      { name: "propertyFacing", required: true },
      { name: "ageOfTheProperty", required: true },
      { name: "totalfloors", required: false },
      { name: "yourfloor", required: false },
      { name: "parking", required: false },
      { name: "liftAvailable", required: false }
    ]
  },
  "Cafes": {
    "Sell": [
      { name: "propertyName", required: false },
      { name: "propertyPrice", required: true },
      { name: "seatingCapacity", required: true },
      { name: "noOfWashrooms", required: true },
      { name: "totalArea", required: true },
      { name: "furnishing", required: true },
      { name: "propertyFacing", required: true },
      { name: "ageOfTheProperty", required: true },
      { name: "totalfloors", required: false },
      { name: "yourfloor", required: false },
      { name: "parking", required: false },
      { name: "liftAvailable", required: false },
      { name: "reraApproved", required: false }
    ],
    "Lease": [
      { name: "propertyName", required: true },
      { name: "propertyPrice", required: true },
      { name: "seatingCapacity", required: true },
      { name: "noOfWashrooms", required: true },
      { name: "totalArea", required: true },
      { name: "furnishing", required: true },
      { name: "propertyFacing", required: true },
      { name: "ageOfTheProperty", required: true },
      { name: "totalfloors", required: false },
      { name: "yourfloor", required: false },
      { name: "parking", required: false },
      { name: "liftAvailable", required: false }
    ]
  },
  "Bars": {
    "Sell": [
      { name: "propertyName", required: true },
      { name: "propertyPrice", required: true },
      { name: "seatingCapacity", required: true },
      { name: "noOfWashrooms", required: true },
      { name: "totalArea", required: true },
      { name: "furnishing", required: true },
      { name: "propertyFacing", required: true },
      { name: "ageOfTheProperty", required: true },
      { name: "totalfloors", required: false },
      { name: "yourfloor", required: false },
      { name: "parking", required: false },
      { name: "liftAvailable", required: false },
      { name: "reraApproved", required: false }
    ],
    "Lease": [
      { name: "propertyName", required: true },
      { name: "propertyPrice", required: true },
      { name: "seatingCapacity", required: true },
      { name: "noOfWashrooms", required: true },
      { name: "totalArea", required: true },
      { name: "furnishing", required: true },
      { name: "propertyFacing", required: true },
      { name: "ageOfTheProperty", required: true },
      { name: "totalfloors", required: false },
      { name: "yourfloor", required: false },
      { name: "parking", required: false },
      { name: "liftAvailable", required: false }
    ]
  }
};


const PropertyUploadPage: React.FC = () => {
  const userData = localStorage.getItem("user");
  const userId = JSON.parse(userData || "{}").id;
  const [formData, setFormData] = useState<PropertyFormData>({
    userId: userId,
    addressState: "",
    addressCity: "",
    addressLocality: "",
    category: "Residential",
    subCategory: "Flats",
    title: "",
    description: "",
    isSale: "Sell",

    // Property details
    projectName: undefined,
    propertyName: undefined,
    totalBathrooms: undefined,
    totalRooms: undefined,
    propertyPrice: undefined,
    carpetArea: undefined,
    buildupArea: undefined,
    bhks: undefined,
    furnishing: undefined,
    constructionStatus: undefined,
    propertyFacing: undefined,
    ageOfTheProperty: undefined,
    reraApproved: false,
    amenities: [],
    fencing: undefined,

    // Dimensions
    width: undefined,
    height: undefined,
    length: undefined,
    totalArea: undefined,
    plotArea: undefined,
    landArea: undefined,
    distFromOutRRoad: undefined,
    unit: undefined,

    // Additional fields
    viewFromProperty: [],
    soilType: undefined,
    approachRoad: undefined,
    totalfloors: undefined,
    officefloor: undefined,
    yourfloor: undefined,
    cabins: undefined,
    parking: undefined,
    washroom: undefined,
    availablefor: undefined,
    agentNotes: undefined,
    workingWithAgent: false,
    furnishingAmenities: [],
    landType: undefined,
    independent: false,

    seatingCapacity: undefined,
    noOfWashrooms: undefined,

    // Hostel-specific fields
    attachedWashroom: null,
    roomType: null,
    genderPreference: null,
    mealIncluded: null,
    liftAvailable: null,
    noOfBedrooms: null,

    // Images
    images: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [user, setUser] = useState<any>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const navigate = useNavigate();

  // run after clicked on edit button start here
  const location = useLocation();
  const { propertyId } = location.state || {};

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const res = await fetch(
          "https://nextopson.com/api/v1/property/get-property-by-id",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ propertyId }),
          }
        );

        const data = await res.json();

        if (data) {
          const p = data.property;
          setFormData({
            userId: propertyId ? p.userId : userId,
            addressState: p.address?.state,
            addressCity: p.address?.city,
            addressLocality: p.address?.locality,
            category: p.category,
            subCategory: p.subCategory,
            title: p.title,
            description: p.description,
            isSale: p.isSale,

            // Property details
            projectName: p.projectName || undefined,
            propertyName: p.title || undefined,
            totalBathrooms: p.totalBathrooms || undefined,
            totalRooms: p.totalRooms || undefined,
            propertyPrice: p.propertyPrice || undefined,
            carpetArea: p.carpetArea || undefined,
            buildupArea: p.buildupArea || undefined,
            bhks: p.bhks || undefined,
            furnishing: p.furnishing || undefined,
            constructionStatus: p.constructionStatus || undefined,
            propertyFacing: p.propertyFacing || undefined,
            ageOfTheProperty: p.ageOfTheProperty || undefined,
            reraApproved: p.reraApproved || false,
            amenities: p.amenities || [],
            fencing: p.fencing || undefined,

            // Dimensions
            width: p.width || undefined,
            height: p.height || undefined,
            length: p.length || undefined,
            totalArea: p.totalArea || undefined,
            plotArea: p.plotArea || undefined,
            landArea: p.landArea || undefined,
            distFromOutRRoad: p.distFromOutRRoad || undefined,
            unit: p.unit || undefined,

            // Additional fields
            viewFromProperty: p.viewFromProperty || [],
            soilType: p.soilType || undefined,
            approachRoad: p.approachRoad || undefined,
            totalfloors: p.totalfloors || undefined,
            officefloor: p.officefloor || undefined,
            yourfloor: p.yourfloor || undefined,
            cabins: p.cabins || undefined,
            parking: p.parking || undefined,
            washroom: p.washroom || undefined,
            availablefor: p.availablefor || undefined,
            agentNotes: p.agentNotes || undefined,
            workingWithAgent: p.workingWithAgent || false,
            furnishingAmenities: p.furnishingAmenities || [],
            landType: p.landType || undefined,
            independent: p.independent || false,

            seatingCapacity: p.seatingCapacity || undefined,
            noOfWashrooms: p.noOfWashrooms || undefined,

            // Hostel-specific fields
            attachedWashroom: p.attachedWashroom || null,
            roomType: p.roomType || null,
            genderPreference: p.genderPreference || null,
            mealIncluded: p.mealIncluded || null,
            liftAvailable: p.liftAvailable || null,
            noOfBedrooms: p.noOfBedrooms || null,

            // Images
            images: p.propertyImages?.map((img: any) => img.presignedUrl) || [],
          });
        }
      } catch (err) {
        console.error("Error fetching property:", err);
      }
    };

    if (propertyId) {
      fetchProperty();
    } else {
      console.log("property id not found");
    }
  }, [propertyId, userId]);

  // console.log("form data", formData);
  // run after clicked on edit button end here

  useEffect(() => {
    const userData = localStorage.getItem("user");
    const portalUserData = localStorage.getItem("portalUser");

    if (!portalUserData) {
      localStorage.clear();
      navigate("/portal/login");
    } else if (!userData) {
      navigate("/portal/dashboard");
    } else {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setFormData((prev) => ({ ...prev, userId: parsedUser.id }));
    }
  }, [navigate]);

  const residentialSubCategories = [
    "Flats",
    "Builder Floors",
    "House Villas",
    "Plots",
    "Farmhouses",
  ];

  const commercialSubCategories = [
    "Hotels",
    "Lands",
    "Office Spaces",
    // "Hostels",
    "Shops Showrooms",
    "Restaurants",
    "Cafes",
    "Bars",
  ];

  const furnishingAmenitiesIcons = [
    { id: "dining-table", label: "Dining Table", icon: faUtensils },
    { id: "washing-machine", label: "Washing Machine", icon: faWind },
    { id: "sofa", label: "Sofa", icon: faCouch },
    { id: "microwave", label: "Microwave", icon: faUtensilSpoon },
    { id: "tv", label: "TV", icon: faTv },
    { id: "gas-pipeline", label: "Gas Pipeline", icon: faTint },
    { id: "gas-stove", label: "Gas Stove", icon: faUtensilSpoon },
    { id: "refrigerator", label: "Refrigerator", icon: faSnowflake },
    { id: "water-purifier", label: "Water Purifier", icon: faTint },
    { id: "beds", label: "Beds", icon: faBed },
    { id: "geyser", label: "Geyser", icon: faTint },
    { id: "air-conditioner", label: "Air-conditioner", icon: faWind },
    { id: "almirah", label: "Almirah", icon: faChair },
  ];

  const viewFromPropertyOptions = [
    { id: "sea", label: "Sea", icon: faWater },
    { id: "lake", label: "Lake", icon: faWater },
    { id: "park", label: "Park", icon: faTree },
    { id: "river", label: "River", icon: faWater },
    { id: "mountain", label: "Mountain", icon: faMountain },
    { id: "road", label: "Road", icon: faRoad },
    { id: "garden", label: "Garden", icon: faSeedling },
    { id: "skyline", label: "Skyline", icon: faCity },
    { id: "beach", label: "Beach", icon: faUmbrellaBeach },
    { id: "forest", label: "Forest", icon: faTree },
  ];

  // error auto scroll logic
  const scrollToErrorField = (fieldName: string) => {
    const fieldWrapper = document.querySelector(
      `[data-field="${fieldName}"]`
    ) as HTMLElement | null;

    if (fieldWrapper) {
      fieldWrapper.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      // optional highlight for UX
      fieldWrapper.classList.add("ring-2", "ring-red-400");

      setTimeout(() => {
        fieldWrapper.classList.remove("ring-2", "ring-red-400");
      }, 2000);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : name === "propertyPrice" ||
            name === "totalBathrooms" ||
            name === "totalRooms" ||
            name === "carpetArea" ||
            name === "buildupArea" ||
            name === "width" ||
            name === "height" ||
            name === "length" ||
            name === "totalArea" ||
            name === "plotArea" ||
            name === "landArea" ||
            name === "distFromOutRRoad" ||
            name === "seatingCapacity" ||
            name === "noOfWashrooms"
            ? value === ""
              ? undefined
              : isNaN(Number(value))
                ? undefined
                : Number(value)
            : value,
    }));

    // 🔥 Clear validation errors when context changes
    if (name === "category" || name === "subCategory" || name === "isSale") {
      setValidationErrors([]);
    }

    if (name === "isSale") {
      setFormData((prev) => ({
        ...prev,
        propertyName: undefined,
        propertyPrice: undefined,
      }));
    }


    // Reset subcategory when category changes
    if (name === "category") {
      setFormData((prev) => ({
        ...prev,
        category: value as "Residential" | "Commercial",
        subCategory: value === "Residential" ? "Flats" : "Hotels",
      }));
    }

    // Clear furnishing amenities when furnishing type is changed to Unfurnished
    if (name === "furnishing" && value === "Unfurnished") {
      setFormData((prev) => ({
        ...prev,
        furnishingAmenities: [],
      }));
    }
  };

  const handleImagesChange = useCallback((newImages: UploadedImage[]) => {
    setFormData((prev) => ({ ...prev, images: newImages }));
  }, []);

  const handleLocationChange = useCallback((loc: any) => {
    setValidationErrors((prev) =>
      prev.filter(
        (f: any) =>
          f !== "addressState" &&
          f !== "addressCity" &&
          f !== "addressLocality"
      )
    );

    setFormData((prev) => ({
      ...prev,
      addressState: loc.state,
      addressCity: loc.city,
      addressLocality: loc.locality,
    }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    const tempUserId = localStorage.getItem("portalUser");
    const parsedUserId = tempUserId ? JSON.parse(tempUserId) : null;
    console.log(parsedUserId);

    const error = validateForm();

    if (error) {
      setError(error);  // ya alert(error)
      setLoading(false);
      return;
    }

    try {
      const userId = formData.userId || user?.id;

      // Ensure user is logged in
      if (!userId) {
        setError("Please login to upload properties");
        setLoading(false);
        navigate("/portal/dashboard");
        return;
      }

      // Dynamic required field validation
      setValidationErrors([]);
      const errors: string[] = [];

      // Location (always required)
      if (!formData.addressState) errors.push("addressState");
      if (!formData.addressCity) errors.push("addressCity");
      if (!formData.addressLocality) errors.push("addressLocality");

      // Dynamic required fields
      const requiredFields = getRequiredFields(
        formData.subCategory,
        formData.isSale
      );

      requiredFields.forEach((field) => {
        if (!isFieldRequired(field)) return;

        const val = (formData as any)[field];
        if (
          val === undefined ||
          val === null ||
          val === "" ||
          (Array.isArray(val) && val.length === 0)
        ) {
          errors.push(field);
        }
      });

      // Property price min validation
      if (
        formData.propertyPrice !== undefined &&
        formData.propertyPrice < 1000
      ) {
        errors.push("propertyPrice");
      }

      // Special case for Hostels - ensure at least one amenity if configured?
      // Logic moved to validateForm mostly, but let's check basic presence of "amenities" if it appears in validationRules?
      // No, amenities is array, caught by Array.isArray check above.

      if (errors.length > 0) {
        setValidationErrors(errors);

        // Show the first error message
        const firstField = errors[0];
        scrollToErrorField(firstField);
        if (firstField === "propertyPrice" && formData.propertyPrice && formData.propertyPrice > 0 && formData.propertyPrice < 1000) {
          setError("Price must be at least ₹1,000");
        } else {
          const readableName = firstField
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase());
          setError(`${readableName} is required`);
        }
        setLoading(false);
        return;
      }

      if (!formData.images || formData.images.length === 0) {
        setError("At least one property image is required");
        setLoading(false);
        return;
      }

      // Create FormData object
      const data = new FormData();

      // Append required basic fields
      data.append("userId", String(userId));

      let uploaderId = null;

      try {
        const portalUserStore = localStorage.getItem("portalUser");

        if (portalUserStore) {
          const pUser = JSON.parse(portalUserStore);

          if (pUser?.id) {
            // if id object ho to actual value nikalo
            uploaderId = typeof pUser.id === "object"
              ? pUser.id._id || pUser.id.id
              : pUser.id;
          }
        }
      } catch (err) {
        console.error("Portal user parse error:", err);
      }

      // fallback
      if (!uploaderId && parsedUserId) {
        uploaderId = typeof parsedUserId === "object"
          ? parsedUserId._id || parsedUserId.id
          : parsedUserId;
      }

      // append once only
      if (uploaderId) {
        data.append("uploaderId", String(uploaderId));
      }



      if (propertyId) data.append("propertyId", String(propertyId));
      if (formData.addressState)
        data.append("addressState", formData.addressState);
      if (formData.addressCity)
        data.append("addressCity", formData.addressCity);
      if (formData.addressLocality)
        data.append("addressLocality", formData.addressLocality);
      data.append("category", formData.category);
      data.append("subCategory", formData.subCategory);
      if (formData.isSale) data.append("isSale", formData.isSale);
      data.append("propertyPrice", String(formData.propertyPrice || 0));

      // Append other fields, handling types
      if (formData.title) data.append("title", formData.title);
      if (formData.description)
        data.append("description", formData.description);
      if (formData.projectName)
        data.append("projectName", formData.projectName);
      if (formData.propertyName)
        data.append("propertyName", formData.propertyName);

      // if (formData.totalBathrooms !== undefined)
      if (formData.totalBathrooms)
        data.append("totalBathrooms", String(formData.totalBathrooms));
      if (formData.totalRooms !== undefined)
        data.append("totalRooms", String(formData.totalRooms));
      if (formData.carpetArea !== undefined)
        data.append("carpetArea", String(formData.carpetArea));
      if (formData.buildupArea !== undefined)
        data.append("buildupArea", String(formData.buildupArea));

      if (formData.bhks) data.append("bhks", formData.bhks);
      if (formData.furnishing) data.append("furnishing", formData.furnishing);
      if (formData.constructionStatus)
        data.append("constructionStatus", formData.constructionStatus);
      if (formData.propertyFacing)
        data.append("propertyFacing", formData.propertyFacing);
      if (formData.ageOfTheProperty)
        data.append("ageOfTheProperty", formData.ageOfTheProperty);

      // Boolean to string
      if (formData.reraApproved !== undefined)
        data.append("reraApproved", String(formData.reraApproved));
      if (formData.workingWithAgent !== undefined)
        data.append("workingWithAgent", String(formData.workingWithAgent));
      if (formData.independent !== undefined)
        data.append("independent", String(formData.independent));

      // Arrays - Stringify them as per curl example
      if (formData.amenities && formData.amenities.length > 0) {
        data.append("amenities", JSON.stringify(formData.amenities));
      }
      if (
        formData.furnishingAmenities &&
        formData.furnishingAmenities.length > 0
      ) {
        data.append(
          "furnishingAmenities",
          JSON.stringify(formData.furnishingAmenities)
        );
      }
      if (formData.viewFromProperty && formData.viewFromProperty.length > 0) {
        data.append(
          "viewFromProperty",
          JSON.stringify(formData.viewFromProperty)
        );
      }

      if (formData.fencing) data.append("fencing", formData.fencing);

      // Dimensions
      if (formData.width !== undefined)
        data.append("width", String(formData.width));
      if (formData.height !== undefined)
        data.append("height", String(formData.height));
      if (formData.length !== undefined)
        data.append("length", String(formData.length));
      if (formData.totalArea !== undefined)
        data.append("totalArea", String(formData.totalArea));
      if (formData.plotArea !== undefined)
        data.append("plotArea", String(formData.plotArea));
      if (formData.landArea !== undefined)
        data.append("landArea", String(formData.landArea));
      if (formData.distFromOutRRoad !== undefined)
        data.append("distFromOutRRoad", String(formData.distFromOutRRoad));

      if (formData.unit) data.append("unit", formData.unit);
      if (formData.soilType) data.append("soilType", formData.soilType);
      if (formData.approachRoad)
        data.append("approachRoad", formData.approachRoad);

      if (formData.totalfloors)
        data.append("totalfloors", formData.totalfloors);
      if (formData.officefloor)
        data.append("officefloor", formData.officefloor);
      if (formData.yourfloor) data.append("yourfloor", formData.yourfloor);
      if (formData.cabins) data.append("cabins", formData.cabins);
      if (formData.parking) data.append("parking", formData.parking);
      if (formData.washroom) data.append("washroom", formData.washroom);

      if (formData.availablefor)
        data.append("availablefor", formData.availablefor);
      if (formData.agentNotes) data.append("agentNotes", formData.agentNotes);
      if (formData.landType) data.append("landType", formData.landType);

      if (formData.seatingCapacity) data.append("seatingCapacity", String(formData.seatingCapacity));
      if (formData.noOfWashrooms) data.append("noOfWashrooms", String(formData.noOfWashrooms));

      // Hostel specific
      if (formData.attachedWashroom)
        data.append("attachedWashroom", formData.attachedWashroom);
      if (formData.roomType) data.append("roomType", formData.roomType);
      if (formData.genderPreference)
        data.append("genderPreference", formData.genderPreference);
      if (formData.mealIncluded)
        data.append("mealIncluded", formData.mealIncluded);
      if (formData.liftAvailable)
        data.append("liftAvailable", formData.liftAvailable);
      if (
        formData.noOfBedrooms !== undefined &&
        formData.noOfBedrooms !== null
      ) {
        data.append("noOfBedrooms", String(formData.noOfBedrooms));
      }

      // Handle Images
      // Append each file with the key "images"
      if (formData.images && formData.images.length > 0) {
        formData.images.forEach((img) => {
          if (img.file) {
            data.append("images", img.file);
          }
        });
      }

      const apiUrl = "https://nextopson.com/temp/api/v1/temp/properties";
      // const apiUrl = "http://192.168.1.14:4000/api/v1/temp/properties";
      const response = await fetch(apiUrl, {
        method: "POST",
        body: data,
      });

      let responseData;
      try {
        responseData = await response.json();
      } catch (parseError) {
        // If response is not JSON, handle as error
        setError("Invalid response from server. Please try again.");
        setLoading(false);
        return;
      }

      if (response.status === 201 || response.status === 200) {
        let successMessage =
          responseData.message || "Property uploaded successfully!";
        setSuccess(successMessage);

        // Reset form
        setFormData({
          propertyId: propertyId,
          userId: formData.userId,
          addressState: "",
          addressCity: "",
          addressLocality: "",
          category: "Residential",
          subCategory: "Flats",
          title: "",
          description: "",
          isSale: "Sell",

          // Property details
          projectName: undefined,
          propertyName: undefined,
          totalBathrooms: undefined,
          totalRooms: undefined,
          propertyPrice: undefined,
          carpetArea: undefined,
          buildupArea: undefined,
          bhks: undefined,
          furnishing: undefined,
          constructionStatus: undefined,
          propertyFacing: undefined,
          ageOfTheProperty: undefined,
          reraApproved: false,
          amenities: [],
          fencing: undefined,

          // Dimensions
          width: undefined,
          height: undefined,
          length: undefined,
          totalArea: undefined,
          plotArea: undefined,
          landArea: undefined,
          distFromOutRRoad: undefined,
          unit: undefined,

          // Additional fields
          viewFromProperty: [],
          soilType: undefined,
          approachRoad: undefined,
          totalfloors: undefined,
          officefloor: undefined,
          yourfloor: undefined,
          cabins: undefined,
          parking: undefined,
          washroom: undefined,
          availablefor: undefined,
          agentNotes: undefined,
          workingWithAgent: false,
          furnishingAmenities: [],
          landType: undefined,
          independent: false,

          // Hostel-specific fields
          attachedWashroom: null,
          roomType: null,
          genderPreference: null,
          mealIncluded: null,
          liftAvailable: null,
          noOfBedrooms: null,

          // Images
          images: [],
        });

        // Optionally scroll to top or show success message
        window.scrollTo(0, 0);

        // window.location.reload();
      } else {
        // Handle error responses
        const errorMessage =
          responseData.message ||
          (responseData.error === "PAYLOAD_TOO_LARGE"
            ? `Request payload too large. ${responseData.maxSize || "2GB"
            } maximum.`
            : responseData.error === "TOO_MANY_FILES"
              ? `Too many files. ${responseData.maxFiles || 50} maximum.`
              : responseData.error === "TOTAL_FILE_SIZE_TOO_LARGE"
                ? `Total file size too large. ${responseData.maxTotalSize || "2GB"
                } maximum.`
                : "Property upload failed. Please try again.");
        setError(errorMessage);
      }
    } catch (err: any) {
      console.error("Error uploading property:", err);
      setError(err.message || "Property upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Function to get ALL form fields based on subcategory (configured in validationRules)
  const getFormFields = (
    subCategory: string,
    isSale?: string
  ): FieldConfig[] => {
    if (!subCategory) return [];
    const saleType = (isSale || "Sell") as SaleType;

    const categoryRules = validationRules[subCategory];
    if (!categoryRules) return [];

    let rules = categoryRules[saleType];

    // Improved fallback logic:
    if (!rules && saleType === "Lease") {
      // Fallback to Sell rules for Lease if not strictly defined
      rules = categoryRules["Sell"];
    }
    // If still no rules, try "Sell" as ultimate default?
    if (!rules) rules = categoryRules["Sell"];

    return rules || [];
  };

  // Helper to get only names of REQUIRED fields
  const getRequiredFields = (
    subCategory: string,
    isSale?: string
  ): string[] => {
    const fields = getFormFields(subCategory, isSale);
    return fields.filter(f => f.required).map(f => f.name);
  };

  // Function to get amenities fields based on subcategory
  const getAmenitiesFields = (subCategory: string): string[] => {
    const amenitiesFields = [];

    // Add amenities based on subcategory
    if (
      [
        "Flats",
        "Builder Floors",
        "House Villas",
        "Farmhouses",
        "Hotels",
        "Office Spaces",
        "Restaurants",
        "Cafes",
        "Bars",
      ].includes(subCategory)
    ) {
      amenitiesFields.push("amenities");
    }

    // Add furnishing amenities for furnished properties
    if (
      [
        "Flats",
        "Builder Floors",
        "House Villas",
        "Farmhouses",
        "Hotels",
        "Office Spaces",
        "Hostels",
        "Shops Showrooms",
        "Restaurants",
        "Cafes",
        "Bars",
      ].includes(subCategory)
    ) {
      amenitiesFields.push("furnishingAmenities");
    }

    // Add view from property for specific categories
    if (["Hotels", "Farmhouses"].includes(subCategory)) {
      amenitiesFields.push("viewFromProperty");
    }

    return amenitiesFields;
  };

  // Function to render field based on field name
  const renderField = (fieldName: string) => {

    const requiredFields = getRequiredFields(
      formData.subCategory,
      formData.isSale
    );
    // const isRequired = requiredFields.includes(fieldName);

    let isRequired = requiredFields.includes(fieldName);

    const requiredAsterisk = isRequired ? <span className="text-red-500 ml-1">*</span> : null;

    switch (fieldName) {
      case "description":
        const isHostelRentDesc =
          formData.subCategory === "Hostels" && formData.isSale === "Rent";
        return (
          <div key={fieldName}>
            <label
              htmlFor={fieldName}
              className="form-label flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faTag} className="text-blue-600" />
              Property Description
            </label>
            <textarea
              id={fieldName}
              name={fieldName}
              rows={4}
              value={formData.description || ""}
              onChange={handleInputChange}
              className="form-input focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              placeholder={
                isHostelRentDesc
                  ? "e.g. 3 BHK flat for rent in premium locations"
                  : "Enter property description"
              }
            />
            {isHostelRentDesc && (
              <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                <FontAwesomeIcon
                  icon={faExclamationTriangle}
                  className="text-blue-500"
                />
                <span>
                  Property description will auto generate if you are not filled
                </span>
              </div>
            )}
          </div>
        );

      case "projectName":
        return (
          <div key={fieldName}>
            <label
              htmlFor={fieldName}
              className="form-label flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faBuilding} className="text-blue-600" />
              Project Name {requiredAsterisk}
            </label>
            <input
              type="text"
              id={fieldName}
              name={fieldName}
              value={formData.projectName || ""}
              onChange={handleInputChange}
              className={`form-input focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${validationErrors.includes(fieldName) ? "border-red-500 ring-1 ring-red-500" : ""}`}
              placeholder="Enter project name"
            />
          </div>
        );

      case "propertyName":
        const isHostel = formData.subCategory === "Hostels";
        return (
          <div key={fieldName}>
            <label
              htmlFor={fieldName}
              className="form-label flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faHome} className="text-blue-600" />
              {isHostel ? "PG / Hostel Name" : "Property Name"} {requiredAsterisk}
            </label>
            <input
              type="text"
              id={fieldName}
              name={fieldName}
              value={formData.propertyName || ""}
              onChange={handleInputChange}
              className="form-input focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              placeholder={
                isHostel ? "e.g. Green Valley PG" : "Enter property name"
              }
            />
          </div>
        );

      case "propertyPrice":
        const isHostelRent =
          formData.subCategory === "Hostels" && formData.isSale === "Rent";
        return (
          <div key={fieldName}>
            <label
              htmlFor={fieldName}
              className="form-label flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faTag} className="text-blue-600" />
              {isHostelRent ? "Price (bed/month) (₹)" : "Price (₹)"} {requiredAsterisk}
            </label>
            <input
              type="number"
              id={fieldName}
              name={fieldName}
              // required
              min="1000"
              value={formData.propertyPrice || ""}
              onChange={handleInputChange}
              className={`form-input focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${validationErrors.includes(fieldName) ? "border-red-500 ring-1 ring-red-500" : ""}`}
              placeholder={isHostelRent ? "e.g. 5000" : "Enter price"}
            />
          </div>
        );

      case "totalBathrooms":
        return (
          <div key={fieldName}>
            <label
              htmlFor={fieldName}
              className="form-label flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faBath} className="text-blue-600" />
              Bathrooms {requiredAsterisk}
            </label>
            <input
              type="number"
              id={fieldName}
              name={fieldName}
              min="0"
              value={formData.totalBathrooms || ""}
              onChange={handleInputChange}
              className={`form-input focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${validationErrors.includes(fieldName) ? "border-red-500 ring-1 ring-red-500" : ""}`}
              placeholder="Number of bathrooms"
            />
          </div>
        );

      case "totalRooms":
        return (
          <div key={fieldName}>
            <label
              htmlFor={fieldName}
              className="form-label flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faBed} className="text-blue-600" />
              Rooms {requiredAsterisk}
            </label>
            <input
              type="number"
              id={fieldName}
              name={fieldName}
              min="0"
              value={formData.totalRooms || ""}
              onChange={handleInputChange}
              className={`form-input focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${validationErrors.includes(fieldName) ? "border-red-500 ring-1 ring-red-500" : ""}`}
              placeholder="Number of rooms"
            />
          </div>
        );

      case "cabins":
        return (
          <div key={fieldName}>
            <label
              htmlFor={fieldName}
              className="form-label flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faBed} className="text-blue-600" />
              Cabins {requiredAsterisk}
            </label>
            <input
              type="number"
              id={fieldName}
              name={fieldName}
              min="0"
              value={formData.cabins || ""}
              onChange={handleInputChange}
              className={`form-input focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${validationErrors.includes(fieldName) ? "border-red-500 ring-1 ring-red-500" : ""}`}
              placeholder="Number of Cabins"
            />
          </div>
        );

      case "carpetArea":
        return (
          <div key={fieldName}>
            <label
              htmlFor={fieldName}
              className="form-label flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faRuler} className="text-blue-600" />
              Carpet Area (sq ft) {requiredAsterisk}
            </label>
            <input
              type="number"
              id={fieldName}
              name={fieldName}
              min="0"
              step="0.01"
              value={formData.carpetArea || ""}
              onChange={handleInputChange}
              className={`form-input ${validationErrors.includes(fieldName) ? "border-red-500 ring-1 ring-red-500" : ""}`}
              placeholder="Enter carpet area"
            />
          </div>
        );

      case "buildupArea":
        return (
          <div key={fieldName}>
            <label
              htmlFor={fieldName}
              className="form-label flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faRuler} className="text-blue-600" />
              Built-up Area (sq ft) {requiredAsterisk}
            </label>
            <input
              type="number"
              id={fieldName}
              name={fieldName}
              min="0"
              step="0.01"
              value={formData.buildupArea || ""}
              onChange={handleInputChange}
              className={`form-input focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${validationErrors.includes(fieldName) ? "border-red-500 ring-1 ring-red-500" : ""}`}
              placeholder="Enter built-up area"
            />
          </div>
        );

      case "bhks":
        return (
          <div key={fieldName}>
            <label htmlFor={fieldName} className="form-label">
              BHKs {requiredAsterisk}
            </label>
            <select
              id={fieldName}
              name={fieldName}
              value={formData.bhks || ""}
              onChange={handleInputChange}
              className={`form-input ${validationErrors.includes(fieldName) ? "border-red-500 ring-1 ring-red-500" : ""}`}
            >
              <option value="">Select BHKs</option>
              <option value="1 BHK">1 BHK</option>
              <option value="2 BHK">2 BHK</option>
              <option value="3 BHK">3 BHK</option>
              <option value="4 BHK">4 BHK</option>
              <option value="5+ BHK">5+ BHK</option>
            </select>
          </div>
        );

      case "furnishing":
        return (
          <div key={fieldName}>
            <label htmlFor={fieldName} className="form-label">
              Furnishing {requiredAsterisk}
            </label>
            <select
              id={fieldName}
              name={fieldName}
              value={formData.furnishing || ""}
              onChange={handleInputChange}
              className={`form-input ${validationErrors.includes(fieldName) ? "border-red-500 ring-1 ring-red-500" : ""}`}
            >
              <option value="">Select Furnishing</option>
              <option value="Semi Furnished">Semi Furnished</option>
              <option value="Fully Furnished">Fully Furnished</option>
              <option value="Unfurnished">Unfurnished</option>
            </select>
          </div>
        );

      case "constructionStatus":
        return (
          <div key={fieldName}>
            <label htmlFor={fieldName} className="form-label">
              Construction Status {requiredAsterisk}
            </label>
            <select
              id={fieldName}
              name={fieldName}
              value={formData.constructionStatus || ""}
              onChange={handleInputChange}
              className={`form-input ${validationErrors.includes(fieldName) ? "border-red-500 ring-1 ring-red-500" : ""}`}
            >
              <option value="">Select Status</option>
              <option value="Ready to Move">Ready to Move</option>
              <option value="Under Construction">Under Construction</option>
              <option value="New Launch">New Launch</option>
            </select>
          </div>
        );

      case "propertyFacing":
        return (
          <div key={fieldName}>
            <label htmlFor={fieldName} className="form-label">
              Property Facing {requiredAsterisk}
            </label>
            <select
              id={fieldName}
              name={fieldName}
              value={formData.propertyFacing || ""}
              onChange={handleInputChange}
              className={`form-input ${validationErrors.includes(fieldName) ? "border-red-500 ring-1 ring-red-500" : ""}`}
            >
              <option value="">Select Facing</option>
              <option value="North">North</option>
              <option value="South">South</option>
              <option value="East">East</option>
              <option value="West">West</option>
              <option value="North-East">North-East</option>
              <option value="North-West">North-West</option>
              <option value="South-East">South-East</option>
              <option value="South-West">South-West</option>
            </select>
          </div>
        );

      case "ageOfTheProperty":
        return (
          <div key={fieldName}>
            <label htmlFor={fieldName} className="form-label">
              Age of Property {requiredAsterisk}
            </label>
            <select
              id={fieldName}
              name={fieldName}
              value={formData.ageOfTheProperty || ""}
              onChange={handleInputChange}
              className={`form-input ${validationErrors.includes(fieldName) ? "border-red-500 ring-1 ring-red-500" : ""}`}
            >
              <option value="">Select Age</option>
              <option value="0-5 years">0-5 years</option>
              <option value="5-10 years">5-10 years</option>
              <option value="10+ years">10+ years</option>
            </select>
          </div>
        );

      case "amenities":
        const isHotels = formData.subCategory === "Hotels";
        return (
          <div key={fieldName}>
            <label
              htmlFor={fieldName}
              className="form-label flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faShieldAlt} className="text-blue-600" />
              Amenities
              {isHotels && (
                <span className="text-red-500 text-xs ml-1">
                  * Required (select at least 1)
                </span>
              )}
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2 mt-4">
              {[
                { id: "parking", label: "Parking", icon: faCar },
                { id: "cctv", label: "CCTV", icon: faVideo },
                { id: "security", label: "Security", icon: faShieldAlt },
                { id: "garden", label: "Garden", icon: faTree },
                { id: "wifi", label: "Free WiFi", icon: faWifi },
                { id: "wheelchair", label: "Wheelchair", icon: faWheelchair },
                { id: "pool", label: "Infinity Pool", icon: faSwimmingPool },
                { id: "theater", label: "Private Theater", icon: faVideo },
                {
                  id: "ev-charging",
                  label: "EV Charging",
                  icon: faChargingStation,
                },
                { id: "clubhouse", label: "Club House", icon: faUsers },
                {
                  id: "jogging-track",
                  label: "Jogging Track",
                  icon: faRunning,
                },
                { id: "power-backup", label: "Power Backup", icon: faBolt },
                {
                  id: "24x7-security",
                  label: "24x7 Security",
                  icon: faShieldAlt,
                },
                { id: "intercom", label: "Intercom Facility", icon: faPhone },
                {
                  id: "rain-harvesting",
                  label: "Rain Water Harvesting",
                  icon: faTint,
                },
              ].map((amenity) => (
                <motion.label
                  key={amenity.id}
                  className="flex flex-col items-center justify-center cursor-pointer p-4 rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 group min-h-[100px] relative"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <input
                    type="checkbox"
                    value={amenity.label}
                    checked={
                      formData.amenities?.includes(amenity.label) || false
                    }
                    onChange={(e) => {
                      const currentAmenities = formData.amenities || [];
                      if (e.target.checked) {
                        setFormData((prev) => ({
                          ...prev,
                          amenities: [...currentAmenities, amenity.label],
                        }));
                      } else {
                        setFormData((prev) => ({
                          ...prev,
                          amenities: currentAmenities.filter(
                            (a) => a !== amenity.label
                          ),
                        }));
                      }
                    }}
                    className="sr-only"
                  />
                  <div className="flex flex-col items-center space-y-1">
                    <div className="w-5 h-5 flex items-center justify-center">
                      <FontAwesomeIcon
                        icon={amenity.icon}
                        className="text-sm text-gray-500 group-hover:text-blue-600 transition-colors duration-300"
                      />
                    </div>
                    <span className="text-xs text-center text-gray-700 group-hover:text-gray-900 transition-colors duration-300 font-medium leading-tight px-1">
                      {amenity.label}
                    </span>
                  </div>
                  <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-white rounded-full border-2 border-gray-300 group-hover:border-blue-500 transition-colors duration-300 flex items-center justify-center">
                    {formData.amenities?.includes(amenity.label) && (
                      <FontAwesomeIcon
                        icon={faCheckCircle}
                        className="text-blue-600 text-xs"
                      />
                    )}
                  </div>
                </motion.label>
              ))}
            </div>
          </div>
        );

      case "reraApproved":
        return (
          <div key={fieldName} className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                handleInputChange({
                  target: {
                    name: fieldName,
                    value: !formData.reraApproved, // 🔥 toggle
                  },
                } as any)
              }
              className={`px-3 py-1 rounded text-sm border transition
          ${formData.reraApproved
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                }`}
            >
              Yes
            </button>

            <h4 className="text-sm font-medium text-gray-900">
              RERA Approved {formData.reraApproved && "(Yes)"}
            </h4>
          </div>
        );

      case "independent":
        return (
          <div key={fieldName} className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                handleInputChange({
                  target: {
                    name: fieldName,
                    value: !formData.independent, // 🔥 toggle
                  },
                } as any)
              }
              className={`px-3 py-1 rounded text-sm border transition
          ${formData.independent
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                }`}
            >
              Yes
            </button>

            <h4 className="text-sm font-medium text-gray-900">
              Independent {formData.independent && "(Yes)"}
            </h4>
          </div>
        );

      case "length":
        const isHostelRentLength =
          formData.subCategory === "Hostels" && formData.isSale === "Rent";
        return (
          <div key={fieldName}>
            <label htmlFor={fieldName} className="form-label">
              Length {isHostelRentLength ? "(sq.ft)" : "(ft)"} {requiredAsterisk}
            </label>
            <input
              type="number"
              id={fieldName}
              name={fieldName}
              min="0"
              step="0.01"
              value={formData.length || ""}
              onChange={handleInputChange}
              className={`form-input ${validationErrors.includes(fieldName) ? "border-red-500 ring-1 ring-red-500" : ""}`}
              placeholder={isHostelRentLength ? "e.g. 10" : "Enter length"}
            />
          </div>
        );

      case "width":
        const isHostelRentWidth =
          formData.subCategory === "Hostels" && formData.isSale === "Rent";
        return (
          <div key={fieldName}>
            <label htmlFor={fieldName} className="form-label">
              Width {isHostelRentWidth ? "(sq.ft)" : "(ft)"} {requiredAsterisk}
            </label>
            <input
              type="number"
              id={fieldName}
              name={fieldName}
              min="0"
              step="0.01"
              value={formData.width || ""}
              onChange={handleInputChange}
              className={`form-input ${validationErrors.includes(fieldName) ? "border-red-500 ring-1 ring-red-500" : ""}`}
              placeholder={isHostelRentWidth ? "e.g. 10" : "Enter width"}
            />
          </div>
        );

      case "totalfloors":
        const isHostelRentTotalFloors =
          formData.subCategory === "Hostels" && formData.isSale === "Rent";
        return (
          <div key={fieldName}>
            <label htmlFor={fieldName} className="form-label">
              {isHostelRentTotalFloors ? "Total Floor" : "Total Floors"} {requiredAsterisk}
            </label>
            <input
              type="text"
              id={fieldName}
              name={fieldName}
              value={formData.totalfloors || ""}
              onChange={handleInputChange}
              className={`form-input ${validationErrors.includes(fieldName) ? "border-red-500 ring-1 ring-red-500" : ""}`}
              placeholder={
                isHostelRentTotalFloors ? "e.g. 3" : "Enter total floors"
              }
            />
          </div>
        );

      case "yourfloor":
        const isHostelRentFloor =
          formData.subCategory === "Hostels" && formData.isSale === "Rent";
        return (
          <div key={fieldName}>
            <label htmlFor={fieldName} className="form-label">
              {isHostelRentFloor ? "Room Floor" : "Property Floor"} {requiredAsterisk}
            </label>
            <select
              id={fieldName}
              name={fieldName}
              value={formData.yourfloor || ""}
              onChange={handleInputChange}
              className={`form-input ${validationErrors.includes(fieldName) ? "border-red-500 ring-1 ring-red-500" : ""}`}
            >
              <option value="">
                {isHostelRentFloor ? "choose floor" : "Select floor"}
              </option>

              {/* 🔥 Extra floors */}
              <option value="-2">-2</option>
              <option value="-1">-1</option>
              <option value="G">G (Ground)</option>

              {formData.totalfloors &&
                Array.from(
                  { length: parseInt(formData.totalfloors) || 0 },
                  (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  )
                )}
            </select>
          </div>
        );

      case "viewFromProperty":
        return (
          <div key={fieldName}>
            <label
              htmlFor={fieldName}
              className="form-label flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faEye} className="text-blue-600" />
              Views from Property
              <span className="text-red-500 text-xs ml-1">
                * Required (select at least 1)
              </span>
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2 mt-4">
              {viewFromPropertyOptions.map((view) => (
                <motion.label
                  key={view.id}
                  className="flex flex-col items-center justify-center cursor-pointer p-4 rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 group min-h-[100px] relative"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <input
                    type="checkbox"
                    value={view.label}
                    checked={
                      formData.viewFromProperty?.includes(view.label) || false
                    }
                    onChange={(e) => {
                      const currentViews = formData.viewFromProperty || [];
                      if (e.target.checked) {
                        setFormData((prev) => ({
                          ...prev,
                          viewFromProperty: [...currentViews, view.label],
                        }));
                      } else {
                        setFormData((prev) => ({
                          ...prev,
                          viewFromProperty: currentViews.filter(
                            (v) => v !== view.label
                          ),
                        }));
                      }
                    }}
                    className="sr-only"
                  />
                  <div className="flex flex-col items-center space-y-1">
                    <div className="w-8 h-8 flex items-center justify-center">
                      <FontAwesomeIcon
                        icon={view.icon}
                        className="text-2xl text-gray-500 group-hover:text-blue-600 transition-colors duration-300"
                      />
                    </div>
                    <span className="text-xs text-center text-gray-700 group-hover:text-gray-900 transition-colors duration-300 font-medium leading-tight px-1">
                      {view.label}
                    </span>
                  </div>
                  <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-white rounded-full border-2 border-gray-300 group-hover:border-blue-500 transition-colors duration-300 flex items-center justify-center">
                    {formData.viewFromProperty?.includes(view.label) && (
                      <FontAwesomeIcon
                        icon={faCheckCircle}
                        className="text-blue-600 text-xs"
                      />
                    )}
                  </div>
                </motion.label>
              ))}
            </div>
          </div>
        );

      case "landArea":
        return (
          <div key={fieldName}>
            <label htmlFor={fieldName} className="form-label">
              Land Area (acre) {requiredAsterisk}
            </label>
            <input
              type="number"
              id={fieldName}
              name={fieldName}
              min="0"
              step="0.01"
              value={formData.landArea || ""}
              onChange={handleInputChange}
              className={`form-input ${validationErrors.includes(fieldName) ? "border-red-500 ring-1 ring-red-500" : ""}`}
              placeholder="Enter land area"
            />
          </div>
        );

      case "distFromOutRRoad":
        return (
          <div key={fieldName}>
            <label htmlFor={fieldName} className="form-label">
              Distance from Main Road (km) {requiredAsterisk}
            </label>
            <input
              type="number"
              id={fieldName}
              name={fieldName}
              min="0"
              step="0.01"
              value={formData.distFromOutRRoad || ""}
              onChange={handleInputChange}
              className={`form-input ${validationErrors.includes(fieldName) ? "border-red-500 ring-1 ring-red-500" : ""}`}
              placeholder="Enter distance"
            />
          </div>
        );

      case "soilType":
        return (
          <div key={fieldName}>
            <label htmlFor={fieldName} className="form-label">
              Soil Type
            </label>
            <select
              id={fieldName}
              name={fieldName}
              value={formData.soilType || ""}
              onChange={handleInputChange}
              className="form-input"
            >
              <option value="">Select Soil Type</option>
              <option value="Sandy">Sandy</option>
              <option value="Clay">Clay</option>
              <option value="Loamy">Loamy</option>
              <option value="Rocky">Rocky</option>
              <option value="Silty">Silty</option>
              <option value="Peaty">Peaty</option>
              <option value="Saline">Saline</option>
            </select>
          </div>
        );

      case "landType":
        return (
          <div key={fieldName}>
            <label htmlFor={fieldName} className="form-label">
              Land Type {requiredAsterisk}
            </label>
            <select
              id={fieldName}
              name={fieldName}
              value={formData.landType || ""}
              onChange={handleInputChange}
              className={`form-input ${validationErrors.includes(fieldName) ? "border-red-500 ring-1 ring-red-500" : ""}`}
            >
              <option value="">Select Land Type</option>
              <option value="agricultural">Agricultural</option>
              <option value="commercial">Commercial</option>
              <option value="industrial">Industrial</option>
            </select>
          </div>
        );

      case "approachRoad":
        return (
          <div key={fieldName}>
            <label htmlFor={fieldName} className="form-label">
              Approach Road {requiredAsterisk}
            </label>
            <select
              id={fieldName}
              name={fieldName}
              value={formData.approachRoad || ""}
              onChange={handleInputChange}
              className={`form-input ${validationErrors.includes(fieldName) ? "border-red-500 ring-1 ring-red-500" : ""}`}
            >
              <option value="">Select Road</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
        );

      case "fencing":
        return (
          <div key={fieldName}>
            <label htmlFor={fieldName} className="form-label">
              Fencing
            </label>
            <select
              id={fieldName}
              name={fieldName}
              value={formData.fencing || ""}
              onChange={handleInputChange}
              className={`form-input ${validationErrors.includes(fieldName) ? "border-red-500 ring-1 ring-red-500" : ""}`}
            >
              <option value="">Select Fencing</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
              <option value="Partial">Partial</option>
            </select>
          </div>
        );

      case "seatingCapacity":
        return (
          <div key={fieldName}>
            <label
              htmlFor={fieldName}
              className="form-label flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faUsers} className="text-blue-600" />
              Seating Capacity {requiredAsterisk}
            </label>
            <input
              type="number"
              id={fieldName}
              name={fieldName}
              min="0"
              value={formData.seatingCapacity || ""}
              onChange={handleInputChange}
              className={`form-input focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${validationErrors.includes(fieldName) ? "border-red-500 ring-1 ring-red-500" : ""}`}
              placeholder="Enter seating capacity"
            />
          </div>
        );

      case "noOfWashrooms":
        return (
          <div key={fieldName}>
            <label
              htmlFor={fieldName}
              className="form-label flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faBath} className="text-blue-600" />
              Number of Washrooms {requiredAsterisk}
            </label>
            <input
              type="number"
              id={fieldName}
              name={fieldName}
              min="0"
              value={formData.noOfWashrooms || ""}
              onChange={handleInputChange}
              className={`form-input focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${validationErrors.includes(fieldName) ? "border-red-500 ring-1 ring-red-500" : ""}`}
              placeholder="Enter number of washrooms"
            />
          </div>
        );

      case "totalArea":
        return (
          <div key={fieldName}>
            <label htmlFor={fieldName} className="form-label">
              Total Area (sq ft) {requiredAsterisk}
            </label>
            <input
              type="number"
              id={fieldName}
              name={fieldName}
              min="0"
              step="0.01"
              value={formData.totalArea || ""}
              onChange={handleInputChange}
              className={`form-input ${validationErrors.includes(fieldName) ? "border-red-500 ring-1 ring-red-500" : ""}`}
              placeholder="Enter total area"
            />
          </div>
        );

      case "plotArea":
        return (
          <div key={fieldName}>
            <label htmlFor={fieldName} className="form-label">
              Plot Area (sq ft) {requiredAsterisk}
            </label>
            <input
              type="number"
              id={fieldName}
              name={fieldName}
              min="0"
              step="0.01"
              value={formData.plotArea || ""}
              onChange={handleInputChange}
              className={`form-input ${validationErrors.includes(fieldName) ? "border-red-500 ring-1 ring-red-500" : ""}`}
              placeholder="Enter plot area"
            />
          </div>
        );

      case "parking":
        return (
          <div key={fieldName}>
            <label htmlFor={fieldName} className="form-label">
              Parking
            </label>
            <select
              id={fieldName}
              name={fieldName}
              value={formData.parking || ""}
              onChange={handleInputChange}
              className={`form-input ${validationErrors.includes(fieldName) ? "border-red-500 ring-1 ring-red-500" : ""}`}
            >
              <option value="">Select Parking</option>
              <option value="Public">Public</option>
              <option value="Private">Private</option>
            </select>
          </div>
        );

      case "washroom":
        return (
          <div key={fieldName}>
            <label htmlFor={fieldName} className="form-label">
              Washrooms Type
            </label>

            <select
              id={fieldName}
              name={fieldName}
              value={formData.washroom || ""}
              onChange={handleInputChange}
              className={`form-input ${validationErrors.includes(fieldName) ? "border-red-500 ring-1 ring-red-500" : ""}`}
            >
              <option value="">Select Washroom</option>
              <option value="Public">Public</option>
              <option value="Private">Private</option>
              <option value="Public, Private">Both</option>
            </select>
          </div>
        );

      case "unit":
        return (
          <div key={fieldName}>
            <label
              htmlFor={fieldName}
              className="form-label flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faRuler} className="text-blue-600" />
              Unit
            </label>
            <select
              id={fieldName}
              name={fieldName}
              value={formData.unit || ""}
              onChange={handleInputChange}
              className={`form-input focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${validationErrors.includes(fieldName) ? "border-red-500 ring-1 ring-red-500" : ""}`}
            >
              <option value="">Select Unit</option>
              <option value="sq ft">Square Feet</option>
              <option value="sq m">Square Meters</option>
              <option value="sq yd">Square Yards</option>
              <option value="acre">Acre</option>
              <option value="hectare">Hectare</option>
            </select>
          </div>
        );

      case "furnishingAmenities":
        // const isUnfurnished = formData.furnishing === "Unfurnished";
        const isUnfurnished =
          !formData.furnishing ||
          formData.furnishing === "Unfurnished" ||
          formData.subCategory === "Shops Showrooms";
        return (
          <div key={fieldName}>
            <label
              htmlFor={fieldName}
              className="form-label flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faCouch} className="text-blue-600" />
              Furnishing Amenities
              {!isUnfurnished && (
                <span className="text-red-500 text-xs ml-1">
                  * Required (select at least 1)
                </span>
              )}
              {isUnfurnished && (
                <span className="text-gray-500 text-sm ml-2">
                  (For select amenities choose Fully Furnished or Semi Furnished option.)
                </span>
              )}
            </label>
            <div
              className={`grid grid-cols-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 mt-4 transition-opacity duration-300 ${isUnfurnished ? "opacity-50 pointer-events-none" : ""
                }`}
            >
              {furnishingAmenitiesIcons.map((amenity) => (
                <motion.label
                  key={amenity.id}
                  className="flex flex-col items-center justify-center cursor-pointer p-4 rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 group min-h-[100px] relative"
                  whileHover={!isUnfurnished ? { scale: 1.05, y: -2 } : {}}
                  whileTap={!isUnfurnished ? { scale: 0.95 } : {}}
                >
                  <input
                    type="checkbox"
                    value={amenity.label}
                    checked={
                      formData.furnishingAmenities?.includes(amenity.label) ||
                      false
                    }
                    disabled={isUnfurnished}
                    onChange={(e) => {
                      if (isUnfurnished) return;
                      const currentAmenities =
                        formData.furnishingAmenities || [];
                      if (e.target.checked) {
                        setFormData((prev) => ({
                          ...prev,
                          furnishingAmenities: [
                            ...currentAmenities,
                            amenity.label,
                          ],
                        }));
                      } else {
                        setFormData((prev) => ({
                          ...prev,
                          furnishingAmenities: currentAmenities.filter(
                            (a) => a !== amenity.label
                          ),
                        }));
                      }
                    }}
                    className="sr-only"
                  />
                  <div className="flex flex-col items-center space-y-1">
                    <div className="w-5 h-5 flex items-center justify-center">
                      <FontAwesomeIcon
                        icon={amenity.icon}
                        className="text-sm text-gray-500 group-hover:text-blue-600 transition-colors duration-300"
                      />
                    </div>
                    <span className="text-xs text-center text-gray-700 group-hover:text-gray-900 transition-colors duration-300 font-medium leading-tight px-1">
                      {amenity.label}
                    </span>
                  </div>
                  <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-white rounded-full border-2 border-gray-300 group-hover:border-blue-500 transition-colors duration-300 flex items-center justify-center">
                    {formData.furnishingAmenities?.includes(amenity.label) && (
                      <FontAwesomeIcon
                        icon={faCheckCircle}
                        className="text-blue-600 text-xs"
                      />
                    )}
                  </div>
                </motion.label>
              ))}
            </div>
          </div>
        );

      case "attachedWashroom":
        return (
          <div key={fieldName}>
            <label htmlFor={fieldName} className="form-label">
              Attached Washroom {requiredAsterisk}
            </label>
            <div className="flex gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name={fieldName}
                  value="Yes"
                  checked={formData.attachedWashroom === "Yes"}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      attachedWashroom: e.target.value,
                    }))
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-gray-700">Yes</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name={fieldName}
                  value="No"
                  checked={formData.attachedWashroom === "No"}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      attachedWashroom: e.target.value,
                    }))
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-gray-700">No</span>
              </label>
            </div>
          </div>
        );

      case "roomType":
        return (
          <div key={fieldName}>
            <label htmlFor={fieldName} className="form-label">
              Room Type  {requiredAsterisk}
            </label>
            <div className="flex gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name={fieldName}
                  value="Sharing"
                  checked={formData.roomType === "Sharing"}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      roomType: e.target.value,
                    }))
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-gray-700">Sharing</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name={fieldName}
                  value="Private"
                  checked={formData.roomType === "Private"}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      roomType: e.target.value,
                    }))
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-gray-700">Private</span>
              </label>
            </div>
          </div>
        );

      case "genderPreference":
        return (
          <div key={fieldName}>
            <label htmlFor={fieldName} className="form-label">
              For {requiredAsterisk}
            </label>
            <div className="flex gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name={fieldName}
                  value="Boys"
                  checked={formData.genderPreference === "Boys"}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      genderPreference: e.target.value,
                    }))
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-gray-700">Boys</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name={fieldName}
                  value="Girls"
                  checked={formData.genderPreference === "Girls"}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      genderPreference: e.target.value,
                    }))
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-gray-700">Girls</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name={fieldName}
                  value="Co-ed"
                  checked={formData.genderPreference === "Co-ed"}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      genderPreference: e.target.value,
                    }))
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-gray-700">Co-ed</span>
              </label>
            </div>
          </div>
        );

      case "mealIncluded":
        return (
          <div key={fieldName}>
            <label htmlFor={fieldName} className="form-label">
              Meal Included {requiredAsterisk}
            </label>
            <div className="flex gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name={fieldName}
                  value="Yes"
                  checked={formData.mealIncluded === "Yes"}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      mealIncluded: e.target.value,
                    }))
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-gray-700">Yes</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name={fieldName}
                  value="No"
                  checked={formData.mealIncluded === "No"}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      mealIncluded: e.target.value,
                    }))
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-gray-700">No</span>
              </label>
            </div>
            {/* {validationErrors.includes(fieldName) && (
              <p className="text-red-500 mt-1 text-sm">
                {validationErrors[fieldName]}
              </p>
            )} */}
          </div>
        );

      case "liftAvailable":
        return (
          <div key={fieldName}>
            <label htmlFor={fieldName} className="form-label">
              Lift Available {requiredAsterisk}
            </label>
            <div className="flex gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name={fieldName}
                  value="Yes"
                  checked={formData.liftAvailable === "Yes"}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      liftAvailable: e.target.value,
                    }))
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-gray-700">Yes</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name={fieldName}
                  value="No"
                  checked={formData.liftAvailable === "No"}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      liftAvailable: e.target.value,
                    }))
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-gray-700">No</span>
              </label>
            </div>
            {/* {validationErrors.includes(fieldName) && (
              <p className="text-red-500 mt-1 text-sm">
                {validationErrors[fieldName]}
              </p>
            )} */}
          </div>
        );

      case "noOfBedrooms":
        return (
          <div key={fieldName}>
            <label
              htmlFor={fieldName}
              className="form-label flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faBed} className="text-blue-600" />
              How many beds {requiredAsterisk}
            </label>
            <input
              type="number"
              id={fieldName}
              name={fieldName}
              min="1"
              value={formData.noOfBedrooms || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  noOfBedrooms: e.target.value ? Number(e.target.value) : null,
                }))
              }
              className={`form-input focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${validationErrors.includes(fieldName) ? "border-red-500 ring-1 ring-red-500" : ""}`}
              placeholder="e.g. 2"
            />
          </div>
        );

      default:
        return null;
    }
  };

  // Furnishing/viewFromProperty required fiels error logic
  const validateForm = () => {
    if (formData.subCategory === "Flats") {
      if (formData.propertyName) {
        return "Please enter property name";
      }
      return
    }
    if (formData.subCategory === "Builder Floors") {
      if (formData.propertyName) {
        return "Please enter property name";
      }
      return
    }
    if (
      formData.subCategory !== "Shops Showrooms" &&
      formData.furnishing &&
      formData.furnishing !== "Unfurnished" &&
      (!formData.furnishingAmenities ||
        formData.furnishingAmenities.length === 0)
    ) {
      return "Please select at least one furnishing amenity";
    }



    if (formData.subCategory === "Hotels") {
      if (!formData.amenities || formData.amenities.length === 0) {
        return "Please select at least one amenity";
      }
      if (
        !formData.viewFromProperty ||
        formData.viewFromProperty.length === 0
      ) {
        return "Please select at least one view from the property";
      }
      return;
    }

    return null;
  };

  const isFieldRequired = (fieldName: string) => {
    const requiredFields = getRequiredFields(
      formData.subCategory,
      formData.isSale
    );

    return requiredFields.includes(fieldName);
  };



  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 lg:px-4"
      variants={variants.springDrop}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={animations.springDrop}
    >
      <div className="md:container max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <FontAwesomeIcon icon={faHome} className="text-2xl text-blue-600" />
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
            Upload Property
          </h2>
          <p className="text-gray-600 text-lg">
            List your property for sale or rent with our professional platform
          </p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Address Fields */}
              <motion.div
                className="lg:col-span-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faMapMarkerAlt}
                      className="text-blue-600"
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Property Address
                  </h3>
                </div>
              </motion.div>

              <motion.div
                className="lg:col-span-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}>
                <StateCityLocalityPicker
                  value={{
                    state: formData.addressState,
                    city: formData.addressCity,
                    locality: formData.addressLocality,
                  }}
                  errorFields={validationErrors}
                  onChange={handleLocationChange}
                />
              </motion.div>

              {/* address section end */}

              {/* Property Type */}
              <motion.div
                className="lg:col-span-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.0, duration: 0.5 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faBuilding}
                      className="text-blue-600"
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Property Type
                  </h3>
                </div>
              </motion.div>

              <motion.div
                className="form-group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1, duration: 0.5 }}
              >
                <label
                  htmlFor="category"
                  className="form-label flex items-center gap-2"
                >
                  <FontAwesomeIcon icon={faHome} className="text-blue-600" />
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleInputChange}
                  className="form-input focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                >
                  <option value="Residential">Residential</option>
                  <option value="Commercial">Commercial</option>
                </select>
              </motion.div>

              <motion.div
                className="form-group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.5 }}
              >
                <label
                  htmlFor="subCategory"
                  className="form-label flex items-center gap-2"
                >
                  <FontAwesomeIcon
                    icon={faBuilding}
                    className="text-blue-600"
                  />
                  Sub Category *
                </label>
                <select
                  id="subCategory"
                  name="subCategory"
                  required
                  value={formData.subCategory}
                  onChange={handleInputChange}
                  className="form-input focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                >
                  {formData.category === "Residential"
                    ? residentialSubCategories.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))
                    : commercialSubCategories.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                </select>
              </motion.div>

              <motion.div
                className="form-group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3, duration: 0.5 }}
              >
                <label
                  htmlFor="isSale"
                  className="form-label flex items-center gap-2"
                >
                  <FontAwesomeIcon icon={faTag} className="text-blue-600" />
                  Sale Type *
                </label>
                <select
                  id="isSale"
                  name="isSale"
                  required
                  value={formData.isSale}
                  onChange={handleInputChange}
                  className="form-input focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                >
                  <option value="">Select Sale Type</option>
                  <option value="Sell">Sell</option>
                  {formData.subCategory === "Hostels" ? (
                    <>
                      <option value="Rent">Rent</option>
                      <option value="Lease">Lease</option>
                    </>
                  ) : formData.subCategory === "Flats" ||
                    formData.subCategory === "Builder Floors" ||
                    formData.subCategory === "House Villas" ||
                    formData.subCategory === "Farmhouses" ||
                    formData.subCategory === "Office Spaces" ||
                    formData.subCategory === "Shops Showrooms" ? (
                    <option value="Rent">Rent</option>
                  ) : (
                    <option value="Lease">Lease</option>
                  )}
                </select>
              </motion.div>

              <motion.div
                className="lg:col-span-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 0.5 }}
              >
                <label
                  htmlFor="description"
                  className="form-label flex items-center gap-2"
                >
                  <FontAwesomeIcon icon={faTag} className="text-blue-600" />
                  Property Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={formData.description || ""}
                  onChange={handleInputChange}
                  className="form-input focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Enter property description"
                />
              </motion.div>

              {/* Dynamic Fields based on SubCategory */}
              <AnimatePresence>
                {getFormFields(formData.subCategory, formData.isSale).map(
                  (fieldConfig, index) => (
                    <motion.div
                      key={fieldConfig.name}
                      className="form-group"
                      data-field={fieldConfig.name}   // 🔥 IMPORTANT for error auto scroll
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.5 + index * 0.1, duration: 0.5 }}
                    >
                      {renderField(fieldConfig.name)}
                    </motion.div>
                  )
                )}
              </AnimatePresence>

              {/* Amenities Sections */}
              <motion.div
                className="lg:col-span-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 2.0, duration: 0.5 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faShieldAlt}
                      className="text-blue-600"
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Property Amenities & Features
                  </h3>
                </div>
              </motion.div>

              <AnimatePresence>
                {getAmenitiesFields(formData.subCategory).map(
                  (field, index) => (
                    <motion.div
                      key={field}
                      className="lg:col-span-2"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 2.1 + index * 0.2, duration: 0.5 }}
                    >
                      {renderField(field)}
                    </motion.div>
                  )
                )}
              </AnimatePresence>

              {/* Image Upload */}
              <motion.div
                className="lg:col-span-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.5, duration: 0.5 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FontAwesomeIcon icon={faImage} className="text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Property Images
                  </h3>
                </div>
                <PropertyImageUpload
                  images={formData.images}
                  onChange={handleImagesChange}
                  maxImages={10}
                />
              </motion.div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <FontAwesomeIcon
                    icon={faExclamationTriangle}
                    className="text-red-500"
                  />
                  <span className="text-red-700">{error}</span>
                </motion.div>
              )}

              {success && (
                <motion.div
                  className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    className="text-green-500"
                  />
                  <span className="text-green-700">{success}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              className="mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.7, duration: 0.5 }}
            >
              <motion.button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <>
                    <FontAwesomeIcon
                      icon={faSpinner}
                      className="animate-spin"
                    />
                    Uploading Property...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faUpload} />
                    Upload Property
                  </>
                )}
              </motion.button>
            </motion.div>
          </div>
        </motion.form>
      </div>
    </motion.div>
  );
};

export default PropertyUploadPage;