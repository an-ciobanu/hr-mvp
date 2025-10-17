import "./App.css";
import { BrowserRouter } from "react-router-dom";
import Navbar from "./components/Common/Navbar";
import AppRoutes from "./routes";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div className="container">
        <AppRoutes />
      </div>
    </BrowserRouter>
  );
}

export default App;
