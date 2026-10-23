import HeroHome from "../components/Hero-Home";
import ShopByCategory from "../components/ShopByCategory";
import NewArrivals from "../components/NewArrivals";
import Brands from "../components/Brands";

const Home = () => {
  return (
    <main>
      <HeroHome />
      <ShopByCategory />
      <NewArrivals />
      <Brands />

      {/* Other homepage sections go here */}
    </main>
  );
};

export default Home;
