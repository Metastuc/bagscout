import { Button } from "#/components/ui/button.tsx";
import { cn } from "#/lib/utils.ts";

export function ConnectWalletButton({ className }: { className?: string }) {
  return <Button className={cn("text-sm", className)}>connect wallet</Button>;
}
