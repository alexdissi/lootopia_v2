import { Crown } from "lucide-react";

interface ShopHeaderProps {
  crownBalance: number;
}

export function ShopHeader({ crownBalance }: ShopHeaderProps) {
  return (
    <div className="flex items-center justify-between bg-card p-4 rounded-lg shadow-sm">
      <div>
        <h2 className="text-lg font-semibold">Solde actuel</h2>
        <p className="text-muted-foreground">
          Utilisez vos couronnes pour acheter des objets
        </p>
      </div>
      <div className="flex items-center bg-amber-100 dark:bg-amber-900/50 px-4 py-2 rounded-full">
        <Crown className="h-5 w-5 text-amber-600 dark:text-amber-400 mr-2" />
        <span className="font-semibold text-lg">{crownBalance}</span>
      </div>
    </div>
  );
}
