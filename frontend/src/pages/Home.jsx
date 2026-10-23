import HeroHome from "../components/Hero-Home";
import ShopByCategory from "../components/ShopByCategory";
import NewArrivals from "../components/NewArrivals";

const Home = () => {
  return (
    <main>
      <HeroHome />
      <ShopByCategory />
        <NewArrivals />

      {/* Other homepage sections go here */}
    </main>
  );
};

export default Home;
