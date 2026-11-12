import { Badge } from "@/components/ui/badge";
import { STAGE_LABEL } from "@/lib/stages";
import type { Stage } from "@/lib/types";

export function StageBadge({ stage }: { stage: Stage }) {
  return <Badge variant={stage === "active" ? "default" : "secondary"}>{STAGE_LABEL[stage]}</Badge>;
}
