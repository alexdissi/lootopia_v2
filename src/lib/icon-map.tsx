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
  LucideProps,
} from "lucide-react";

// Map des identifiants d'icônes aux composants d'icônes
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

// Fonction pour rendre l'icône à partir de son identifiant
export function renderIcon(iconName: string, className: string = "h-5 w-5") {
  const IconComponent = iconMap[iconName as keyof typeof iconMap];

  if (!IconComponent) {
    console.warn(`Icon "${iconName}" not found in iconMap`);
    return null;
  }

  return <IconComponent className={className} />;
}
