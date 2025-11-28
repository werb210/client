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
  Step7,
} from "routes/application/steps";
import { ApplicationProvider } from "./context/ApplicationContext";

const App = () => {
  return (
    <BrowserRouter>
      <ApplicationProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />

          <Route path="/application" element={<ApplicationIndex />} />

          <Route path="/application/step-1" element={<Step1 />} />
          <Route path="/application/step-2" element={<Step2 />} />
          <Route path="/application/step-3" element={<Step3 />} />
          <Route path="/application/step-4" element={<Step4 />} />
          <Route path="/application/step-5" element={<Step5 />} />
          <Route path="/application/step-6" element={<Step6 />} />
          <Route path="/application/step-7" element={<Step7 />} />

          {/* 404 fallback */}
          <Route
            path="*"
            element={
              <div style={{ padding: "2rem" }}>
                <h2>Page Not Found</h2>
              </div>
            }
          />
        </Routes>
      </ApplicationProvider>
    </BrowserRouter>
  );
};

export default App;
