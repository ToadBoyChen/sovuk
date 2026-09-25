import TeamClient from "@/components/sections/TeamClient";
import { geoGrid, MAPS } from "@/lib/geoGrid";

function Team() {
  return <TeamClient grid={geoGrid(MAPS.uk)} />;
}

export default Team;
