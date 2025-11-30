import React from "react"
import { createBrowserRouter } from "react-router-dom"
import App from "./App"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import Users from "./pages/Users"
import { ProtectedRoute } from "./components/ProtectedRoute"

export const router = createBrowserRouter([
  { path: "/", element: <App /> },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  {
    element: <ProtectedRoute />,
    children: [
      { path: "/dashboard", element: <Dashboard /> },
      { path: "/users", element: <Users /> },
    ],
  },
])
