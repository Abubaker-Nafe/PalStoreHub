import React, { createContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";
import LoadingIndicator from "../UI/LoadingIndicator";

// Updated User Data Interface
interface Profile {
  firstName: string;
  lastName: string;
  bio?: string;
  dateOfBirth?: string;
  location?: string;
  image?: string | null;
}

interface UserData {
  username: string;
  email: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
  roles?: string[];
  profile: Profile;
}

// Define the Store Data Interface
interface Store {
  id: string;
  name: string;
  rating: number;
  location: {
    address: string;
    city: string;
    zipCode?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  email: string;
  image: string;
}

// Updated User Context Type
interface UserContextType {
  isLogin: boolean;
  setIsLogin: React.Dispatch<React.SetStateAction<boolean>>;
  userData: UserData | null;
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>;
  userStores: Store[] | null;
  setUserStores: React.Dispatch<React.SetStateAction<Store[] | null>>;
  fetchUserStores: () => Promise<void>;
}

// Initialize UserContext with default values
const UserContext = createContext<UserContextType>({
  isLogin: false,
  setIsLogin: () => {},
  userData: null,
  setUserData: () => {},
  userStores: null,
  setUserStores: () => {},
  fetchUserStores: async () => {},
});

// Props for the provider component
interface UserContextProviderProps {
  children: ReactNode;
}

// UserContextProvider Component
const UserContextProvider: React.FC<UserContextProviderProps> = ({ children }) => {
  // Initialize isLogin and userData from localStorage
  const [isLogin, setIsLogin] = useState<boolean>(() => {
    const savedUser = localStorage.getItem("storeOwner");
    return !!savedUser; // Return true if user exists in localStorage
  });

  const [userData, setUserData] = useState<UserData | null>(() => {
    const savedUser = localStorage.getItem("storeOwner");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [userStores, setUserStores] = useState<Store[] | null>(null);
  const [isInitialized, setIsInitialized] = useState(false); // Track initialization status

  // Load user data and update isLogin on initial render
  useEffect(() => {
    const savedUser = localStorage.getItem("storeOwner");
    if (savedUser) {
      setUserData(JSON.parse(savedUser));
      setIsLogin(true);
    }
    setIsInitialized(true); // Mark initialization as complete
  }, []);

  // Update localStorage whenever userData changes
  useEffect(() => {
    if (userData) {
      localStorage.setItem("storeOwner", JSON.stringify(userData));
    } else {
      localStorage.removeItem("storeOwner");
      setIsLogin(false);
    }
  }, [userData]);

  // Fetch user stores based on username
  const fetchUserStores = async () => {
    if (!userData?.username) return;

    const apiUrl = `https://pal-store-api.azurewebsites.net/api/stores/getStoreByOwnerName/${userData.username}`;
    try {
      const response = await axios.get(apiUrl);
      setUserStores(response.data);
    } catch (error) {
      console.error("Failed to fetch user stores:", error);
      setUserStores([]);
    }
  };

  // Show the LoadingIndicator until initialization is complete
  if (!isInitialized) {
    return <LoadingIndicator message="Loading your data..." />;
  }

  return (
    <UserContext.Provider
      value={{
        isLogin,
        setIsLogin,
        userData,
        setUserData,
        userStores,
        setUserStores,
        fetchUserStores,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export { UserContext, UserContextProvider };
