import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import FileUpload from "./components/FileUpload";
import FileUpdate from "./components/FileUpdate";

export const router = createBrowserRouter([
  { path: "/", element: <App /> },
  { path: "/fileupload", element: <FileUpload /> },
  {
    path:"/fileupdate/:id?",
    element:<FileUpdate/>
  }
]);