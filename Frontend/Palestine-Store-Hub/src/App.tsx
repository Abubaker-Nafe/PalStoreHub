import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Login } from "./Components/auth/Login";
import { Register } from "./Components/auth/Register";
import { Stores } from "./Components/stores/Stores";
import Products from "./Components/products/Products";
import Profile from "./Components/profile/Profile";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Root from "./Layouts/Root";
import { UserContextProvider } from "./Components/context/UserContext";
import { StoreProvider } from "./Components/context/StoreContext";
import NotFound from "./Components/UI/NotFound";
import { PublicRouter } from "./Components/routing/PublicRouter";
import { ProtectedRouter } from "./Components/routing/ProtectedRouter";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      { path: "/", element: <Stores /> },
      { path: "/login", element: <PublicRouter> <Login /> </PublicRouter> },
      { path: "/register", element: <PublicRouter> <Register /> </PublicRouter> },
      { path: "/profile", element: <ProtectedRouter> <Profile /> </ProtectedRouter> },
      //if you want only the storeowner to see the products you can wrap it with protected
      {path: "/products/:storeId", element: <Products /> },
      { path: "/*", element: <NotFound /> },
    ],
  },
]);

const App: React.FC = () => {
  return (
    <UserContextProvider>
      <StoreProvider>
        <RouterProvider router={router} />
        <ToastContainer />
      </StoreProvider>
    </UserContextProvider>
  );
};

export default App;
