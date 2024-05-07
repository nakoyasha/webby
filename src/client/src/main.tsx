import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomePage from "./pages/Home.tsx";
import ErrorPage from "./pages/Error.tsx";
import TrackersPage from "./pages/Trackers/index.tsx";
import DiscordTrackerPage from "./pages/Trackers/Discord/index.tsx";

import "../style/meta.css";
import "../style/animation.css";
import "../style/fonts.css";
import "../style/stickers.css";
import "../style/trackers/discord.css";
import AdminPage from "./pages/Admin/index.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/trackers",
    element: <TrackersPage />,
  },
  {
    path: "/trackers/discord",
    element: <DiscordTrackerPage />,
  },
  {
    path: "/aaaammdiinnn",
    element: <AdminPage />,
  },
  {
    path: "*",
    element: <ErrorPage code={404} />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
