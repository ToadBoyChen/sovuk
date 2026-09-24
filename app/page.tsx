import CTA from "@/components/sections/CTA";
import Hero from "@/components/sections/Hero";
import Roadmap from "@/components/sections/Roadmap";
import Team from "@/components/sections/Team";
import WhoWeAre from "@/components/sections/WhoWeAre";
import Placeholder from "@/components/ui/Placeholder";
import Section from "@/components/ui/Section";

function Home() {
  return (
    <>
      <Hero />
      <Section
        id="problem"
        label="The problem"
        title="Where does British AI actually run?"
        intro="Most AI used in the UK is trained and served on infrastructure outside UK jurisdiction."
      >
        <Placeholder label="3D dot-globe — coming in phase 3" />
      </Section>
      <WhoWeAre />
      <Section
        id="stack"
        label="The stack"
        title="Sovereignty is a stack, not a slogan."
        intro="Every layer — from energy to policy — has to be British for the whole to be sovereign."
      >
        <Placeholder label="3D sovereign stack — coming in phase 3" />
      </Section>
      <Section
        id="request"
        label="Follow a request"
        title="One prompt. Never leaves the UK."
      >
        <Placeholder label="Follow-a-request animation — coming in phase 3" />
      </Section>
      <Roadmap />
      <Team />
      <Section id="research" label="Research" title="Latest research.">
        <Placeholder label="Latest papers — coming in phase 4" />
      </Section>
      <CTA />
    </>
  );
}

export default Home;
