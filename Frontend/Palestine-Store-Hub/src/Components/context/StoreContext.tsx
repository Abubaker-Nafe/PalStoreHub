import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

// Define the Store type
type Location = {
  address: string;
  city: string;
};

type Store = {
  id: string;
  name: string;
  rating: number;
  location: Location;
  email: string;
  ownerId: string;
  image: string;
};

interface StoreContextType {
  stores: Store[] | null;
  loading: boolean;
  error: string | null;
  fetchStores: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Custom Hook
export const useStoreContext = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStoreContext must be used within a StoreProvider");
  }
  return context;
};

// Store Provider Component
export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stores, setStores] = useState<Store[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStores = async () => {
    try {
      // Check if data is available in session storage
      const cachedStores = sessionStorage.getItem("storeData");
      if (cachedStores) {
        setStores(JSON.parse(cachedStores)); // Load from session storage
        setLoading(false);
        return;
      }

      // Fetch data from API if not in session storage
      const response = await axios.get(
        "https://pal-store-api.azurewebsites.net/api/stores/getStores"
      );

      setStores(response.data); // Save data in state
      sessionStorage.setItem("storeData", JSON.stringify(response.data)); // Save data to session storage
      setError(null);
    } catch (err) {
      setError("Failed to fetch stores.");
      setStores([]); // Reset stores on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores(); // Fetch data on first load
  }, []);

  return (
    <StoreContext.Provider value={{ stores, loading, error, fetchStores }}>
      {children}
    </StoreContext.Provider>
  );
};
