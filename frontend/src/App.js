import { useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "sonner";

import Layout from "@/components/layout/Layout";
import Home from "@/pages/Home";
import Catalog from "@/pages/Catalog";
import ProductDetail from "@/pages/ProductDetail";
import Tracking from "@/pages/Tracking";
import Infos from "@/pages/Infos";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <ScrollToTop />
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalogue" element={<Catalog />} />
            <Route path="/produit/:slug" element={<ProductDetail />} />
            <Route path="/tracking" element={<Tracking />} />
            <Route path="/infos" element={<Infos />} />
          </Routes>
        </Layout>
        <Toaster
          theme="light"
          position="top-right"
          toastOptions={{
            style: {
              background: "#FFFFFF",
              border: "1px solid rgba(184, 148, 30, 0.3)",
              color: "#1A1515",
            },
          }}
        />
      </BrowserRouter>
    </div>
  );
}

export default App;
