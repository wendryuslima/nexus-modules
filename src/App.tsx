import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import HomePage from "@/app/pages/home/page";
import SignInPage from "@/app/pages/signin/page";
import SignUpPage from "@/app/pages/signup/page";
import GuestRoute from "@/app/routes/guest-route";
import ProtectedRoute from "@/app/routes/protected-route";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<GuestRoute />}>
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<HomePage />} />
        </Route>

        <Route path="*" element={<Navigate to="/signin" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
