import ProblemMapClient from "@/components/sections/ProblemMapClient";
import { geoGrid, MAPS } from "@/lib/geoGrid";

function ProblemMap() {
  return <ProblemMapClient world={geoGrid(MAPS.world)} zoom={geoGrid(MAPS.britishIsles)} />;
}

export default ProblemMap;
