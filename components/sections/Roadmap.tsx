import RoadmapClient from "@/components/sections/RoadmapClient";
import { geoGrid, MAPS } from "@/lib/geoGrid";

function Roadmap() {
  return <RoadmapClient grid={geoGrid(MAPS.uk)} />;
}

export default Roadmap;
