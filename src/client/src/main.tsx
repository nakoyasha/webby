import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomePage from "./Pages/Home.tsx";
import ErrorPage from "./Pages/Error.tsx";
import TrackersPage from "./Pages/Trackers/index.tsx";
import DiscordTrackerPage from "./Pages/Trackers/Discord/index.tsx";

import "../style/meta.css";
import "../style/animation.css";
import "../style/fonts.css";
import "../style/stickers.css";

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
    path: "*",
    element: <ErrorPage code={404} />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
