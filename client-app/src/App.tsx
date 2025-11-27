import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "routes/home";
import ApplicationIndex from "routes/application";
import {
  Step1,
  Step2,
  Step3,
  Step4,
  Step5,
  Step6,
  Step7
} from "routes/application/steps";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* Home */}
        <Route path="/" element={<HomePage />} />

        {/* Application Flow */}
        <Route path="/application" element={<ApplicationIndex />} />
        <Route path="/application/step-1" element={<Step1 />} />
        <Route path="/application/step-2" element={<Step2 />} />
        <Route path="/application/step-3" element={<Step3 />} />
        <Route path="/application/step-4" element={<Step4 />} />
        <Route path="/application/step-5" element={<Step5 />} />
        <Route path="/application/step-6" element={<Step6 />} />
        <Route path="/application/step-7" element={<Step7 />} />

        {/* 404 Fallback */}
        <Route
          path="*"
          element={
            <div style={{ padding: "2rem" }}>
              <h2>Page Not Found</h2>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
