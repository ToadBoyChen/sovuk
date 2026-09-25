import CTA from "@/components/sections/CTA";
import Hero from "@/components/sections/Hero";
import ProblemMap from "@/components/sections/ProblemMap";
import Request from "@/components/sections/Request";
import Roadmap from "@/components/sections/Roadmap";
import Stack from "@/components/sections/Stack";
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
        <ProblemMap />
      </Section>
      <WhoWeAre />
      <Section
        id="stack"
        label="The stack"
        title="Sovereignty is a stack, not a slogan."
        intro="Every layer — from energy to policy — has to be British for the whole to be sovereign."
      >
        <Stack />
      </Section>
      <Section
        id="request"
        label="Follow a request"
        title="One prompt. Never leaves the UK."
      >
        <Request />
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
