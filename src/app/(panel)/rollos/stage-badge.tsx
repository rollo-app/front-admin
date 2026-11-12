import { Badge } from "@/components/ui/badge";
import { STAGE_LABEL } from "@/lib/stages";
import type { Stage } from "@/lib/types";

export function StageBadge({ stage }: { stage: Stage }) {
  // Neutral like every badge in the panel: the cobalt primary is only for actions.
  return <Badge variant="secondary">{STAGE_LABEL[stage]}</Badge>;
}
