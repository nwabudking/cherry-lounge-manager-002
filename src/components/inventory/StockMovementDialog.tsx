import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowUp, ArrowDown, RefreshCw, TrendingUp } from "lucide-react";
import type { InventoryItem, MovementType } from "@/types/inventory";

interface StockMovementDialogProps {
  item: InventoryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (type: MovementType, quantity: number, notes?: string, costPrice?: number, sellingPrice?: number) => void;
  isSubmitting: boolean;
}

export const StockMovementDialog = ({
  item,
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: StockMovementDialogProps) => {
  const [type, setType] = useState<MovementType>("in");
  const [quantity, setQuantity] = useState<number>(0);
  const [notes, setNotes] = useState("");
  const [costPrice, setCostPrice] = useState<number | undefined>(undefined);
  const [sellingPrice, setSellingPrice] = useState<number | undefined>(undefined);

  // Initialize prices from item when dialog opens
  useEffect(() => {
    if (item && open) {
      setCostPrice(item.cost_per_unit || undefined);
      setSellingPrice(item.selling_price || undefined);
    }
  }, [item, open]);

  if (!item) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity > 0) {
      onSubmit(type, quantity, notes || undefined, costPrice, sellingPrice);
    }
  };

  const getNewStock = () => {
    if (type === "in") return item.current_stock + quantity;
    if (type === "out") return Math.max(0, item.current_stock - quantity);
    return quantity;
  };

  const formatPrice = (price: number | null | undefined) => {
    if (price === null || price === undefined) return "Not set";
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Stock Movement</DialogTitle>
          <DialogDescription>
            Update stock for <strong>{item.name}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-4 rounded-lg bg-muted/50 flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Current Stock</p>
              <p className="text-2xl font-bold">{item.current_stock} {item.unit}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">New Stock</p>
              <p className={`text-2xl font-bold ${getNewStock() <= item.min_stock_level ? 'text-destructive' : 'text-emerald-500'}`}>
                {getNewStock()} {item.unit}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Movement Type</Label>
            <RadioGroup
              value={type}
              onValueChange={(v) => setType(v as MovementType)}
              className="grid grid-cols-3 gap-3"
            >
              <div
                className={`flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                  type === "in" ? "border-emerald-500 bg-emerald-500/10" : "border-border hover:bg-muted/50"
                }`}
                onClick={() => setType("in")}
              >
                <RadioGroupItem value="in" id="in" className="sr-only" />
                <ArrowUp className="h-4 w-4 text-emerald-500" />
                <Label htmlFor="in" className="cursor-pointer font-medium">
                  Stock In
                </Label>
              </div>

              <div
                className={`flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                  type === "out" ? "border-destructive bg-destructive/10" : "border-border hover:bg-muted/50"
                }`}
                onClick={() => setType("out")}
              >
                <RadioGroupItem value="out" id="out" className="sr-only" />
                <ArrowDown className="h-4 w-4 text-destructive" />
                <Label htmlFor="out" className="cursor-pointer font-medium">
                  Stock Out
                </Label>
              </div>

              <div
                className={`flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                  type === "adjustment" ? "border-primary bg-primary/10" : "border-border hover:bg-muted/50"
                }`}
                onClick={() => setType("adjustment")}
              >
                <RadioGroupItem value="adjustment" id="adjustment" className="sr-only" />
                <RefreshCw className="h-4 w-4 text-primary" />
                <Label htmlFor="adjustment" className="cursor-pointer font-medium">
                  Adjust
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">
              {type === "adjustment" ? "New Stock Level" : "Quantity"}
            </Label>
            <Input
              id="quantity"
              type="number"
              min={0}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              required
            />
          </div>

          {/* Price update section - only for stock in */}
          {type === "in" && (
            <div className="space-y-4 p-4 rounded-lg border border-primary/20 bg-primary/5">
              <div className="flex items-center gap-2 text-primary">
                <TrendingUp className="h-4 w-4" />
                <Label className="font-semibold">Price Update (Optional)</Label>
              </div>
              
              <div className="text-xs text-muted-foreground mb-2">
                Previous prices: Cost {formatPrice(item.cost_per_unit)} | Selling {formatPrice(item.selling_price)}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="costPrice">Cost Price</Label>
                  <Input
                    id="costPrice"
                    type="number"
                    min={0}
                    step={0.01}
                    value={costPrice ?? ""}
                    onChange={(e) => setCostPrice(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="Enter cost"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sellingPrice">Selling Price</Label>
                  <Input
                    id="sellingPrice"
                    type="number"
                    min={0}
                    step={0.01}
                    value={sellingPrice ?? ""}
                    onChange={(e) => setSellingPrice(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="Enter selling"
                  />
                </div>
              </div>

              {costPrice && sellingPrice && sellingPrice > costPrice && (
                <div className="text-xs text-emerald-500">
                  Profit margin: {formatPrice(sellingPrice - costPrice)} ({((sellingPrice - costPrice) / costPrice * 100).toFixed(1)}%)
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Purchase order #123, Sold to customer, etc."
              rows={2}
            />
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || quantity <= 0}>
              {isSubmitting ? "Updating..." : "Update Stock"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};