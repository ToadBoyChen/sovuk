import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import CTA from "@/components/sections/CTA";
import Hero from "@/components/sections/Hero";
import ProblemMap from "@/components/sections/ProblemMap";
import Request from "@/components/sections/Request";
import ResearchPreview from "@/components/sections/ResearchPreview";
import Roadmap from "@/components/sections/Roadmap";
import Stack from "@/components/sections/Stack";
import Team from "@/components/sections/Team";
import WhoWeAre from "@/components/sections/WhoWeAre";
import Section from "@/components/ui/Section";
import { team } from "@/content/team";
import { brand } from "@/lib/brand";
import { organization, person } from "@/lib/schema";

export const metadata: Metadata = { alternates: { canonical: "/" } };

function Home() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            { ...organization, founder: team.map((m) => ({ "@id": person(m.slug)["@id"] })) },
            ...team.map((m) => person(m.slug)),
            {
              "@type": "WebSite",
              name: brand.name,
              url: brand.url,
              inLanguage: "en-GB",
              publisher: { "@id": organization["@id"] },
            },
          ],
        }}
      />
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
      <Section
        id="research"
        label="Research"
        title="What we're working on."
        intro="Policy briefs and papers on sovereign AI compute, each with a named lead and a target date."
      >
        <ResearchPreview />
      </Section>
      <CTA />
    </>
  );
}

export default Home;
