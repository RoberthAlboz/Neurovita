import Header from "../components/layout/Header";
import Hero from "../components/sections/Hero";
import Specialties from "../components/sections/Specialties";
import BrainSection from "../components/sections/BrainSection";
import Benefits from "../components/sections/Benefits";
import Footer from "../components/layout/Footer";

function Home() {
  return (
    <div className="app min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <div id="especialidades">
          <Specialties />
        </div>
        <div id="brain-section">
          <BrainSection />
        </div>
        <div id="beneficios">
          <Benefits />
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Home;
