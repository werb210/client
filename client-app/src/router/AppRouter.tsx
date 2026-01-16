import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "../pages/HomePage";
import ApplyStep1 from "../pages/apply/ApplyStep1";
import ApplyStep2 from "../pages/apply/ApplyStep2";
import UploadDocuments from "../pages/apply/UploadDocuments";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/apply/step-1" element={<ApplyStep1 />} />
      <Route path="/apply/step-2" element={<ApplyStep2 />} />
      <Route path="/apply/documents" element={<UploadDocuments />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
