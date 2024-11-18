import { Outlet } from "react-router-dom";
import Navbar from "../components/navigation/Navbar";
import ScrollToTop from "../components/ScrollTtop";

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      {/* <Footer /> */}
    </div>
  );
};

export default MainLayout;
