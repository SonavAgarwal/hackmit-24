import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css";
import FirePage from "./FirePage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <FirePage />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
