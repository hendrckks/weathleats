import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/navigation/Navbar";
import ScrollToTop from "../components/ScrollTtop";

const MainLayout: React.FC = () => {
  const { pathname } = useLocation();
  const showFilters = pathname === "/" || pathname === "/";

  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <Navbar showFilters={showFilters} />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
