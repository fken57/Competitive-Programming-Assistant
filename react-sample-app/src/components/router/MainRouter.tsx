import { Route , Routes } from "react-router-dom";
import Home from "../../pages/Home";
import GraphPage from "../../pages/Graph";
export function MainRouter() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/graph" element={<GraphPage />} />
      <Route path="/array" element={<GraphPage />} />
    </Routes>
  );
}
