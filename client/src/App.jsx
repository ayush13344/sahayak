import React from "react";
import {Routes, Route} from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Partner from "./pages/Partner";
import PartnerApplication from "./pages/PartnerApplication";
import MainLayout from "./pages/MainLayout";
import BroadcastRequest from "./pages/BroadcastRequest";
import MyRequests from "./pages/MyRequests";
import AdminDashboard from "./pages/AdminDashboard";
import SearchProviders from "./pages/SearchProvider";
import ProviderDashboard from "./pages/ProviderDasboard";
import ProviderRequest from "./pages/provider/ProviderRequest";

const App=()=>{
  return(
    <>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/pro-requests" element={<ProviderRequest />} />
        <Route element={<MainLayout />}>
      <Route path="/" element={<Home />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/search-providers" element={<SearchProviders />} />
      <Route path="/provider/dashboard" element={<ProviderDashboard />} />
      <Route
          path="/request/:serviceId"
          element={<BroadcastRequest />}
        />
        <Route path="/my-requests" element={<MyRequests />} />

      <Route path="/partner" element={<Partner />} />
      <Route path="/partner/apply/:professionId" element={<PartnerApplication />} />
      </Route>
    </Routes>
    </>
  );
}

export default App;