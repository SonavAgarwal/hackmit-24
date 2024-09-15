import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css";
import FirePage from "./FirePage";
import LookupPage from "./LookupPage";

const router = createBrowserRouter([
    {
        path: "/",
        element: <FirePage />,
    },
    {
        path: "/lookup",
        element: <LookupPage />,
    },
]);

function App() {
    return <RouterProvider router={router} />;
}

export default App;
