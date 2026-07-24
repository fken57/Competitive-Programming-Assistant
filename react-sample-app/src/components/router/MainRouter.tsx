import { Route , Routes } from "react-router-dom";
import Home from "../../pages/Home";
import GraphPage from "../../pages/Graph";
import ArrayPage from "../../pages/Array";
import RandomGenPage from "../../pages/RandomGen";
import NotFound from "../../pages/NotFound";

export function MainRouter() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/graph" element={<GraphPage />} />
      <Route path="/array" element={<ArrayPage />} />
      <Route path="/random-gen" element={<RandomGenPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
