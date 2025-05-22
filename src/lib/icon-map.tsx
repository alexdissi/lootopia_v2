import {
  ArrowUpCircle,
  Camera,
  Candy,
  ClipboardList,
  Coins,
  Database,
  FileCode,
  FileText,
  File,
  HelpCircle,
  LayoutDashboard,
  Search,
  Settings,
  Shield,
  ShoppingBag,
  User,
  Users,
} from "lucide-react";

export const iconMap = {
  "arrow-up-circle": ArrowUpCircle,
  camera: Camera,
  candy: Candy,
  "clipboard-list": ClipboardList,
  coins: Coins,
  database: Database,
  "file-code": FileCode,
  "file-text": FileText,
  file: File,
  "help-circle": HelpCircle,
  dashboard: LayoutDashboard,
  search: Search,
  settings: Settings,
  shield: Shield,
  "shopping-bag": ShoppingBag,
  user: User,
  users: Users,
};

export function renderIcon(iconName: string, className: string = "h-5 w-5") {
  const IconComponent = iconMap[iconName as keyof typeof iconMap];

  if (!IconComponent) {
    return null;
  }

  return <IconComponent className={className} />;
}
