import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import HeroHome from "../components/Hero-Home";
import ShopByCategory from "../components/ShopByCategory";
import NewArrivals from "../components/NewArrivals";
import Brands from "../components/Brands";

const Home = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash === "#new-arrivals") {
      const element = document.getElementById("new-arrivals");

      if (element) {
        setTimeout(() => {
          element.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 100);
      }
    }
  }, [location]);

  return (
    <main>
      <HeroHome />
      <ShopByCategory />
      <NewArrivals />
      <Brands />
    </main>
  );
};

export default Home;