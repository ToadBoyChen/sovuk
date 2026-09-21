import Name from "@/components/Name";
import Glyph from "@/components/Glyph";

function Home() {
  return (
    <section className="w-full">
      <main className="h-screen grid grid-cols-10 grid-rows-14">
        <Name />
        <Glyph />
      </main>
    </section>
  );
}

export default Home;
