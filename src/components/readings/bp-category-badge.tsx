import { getBPCategory, BP_CATEGORY_CONFIG } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";

export function BPCategoryBadge({ systolic, diastolic }: { systolic: number; diastolic: number }) {
  const category = getBPCategory(systolic, diastolic);
  const config = BP_CATEGORY_CONFIG[category];

  return (
    <Badge variant="outline" className={config.bgClass}>
      {config.label}
    </Badge>
  );
}
