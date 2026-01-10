import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRight, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useBars, useBarInventory, type Bar, type BarInventoryItem } from "@/hooks/useBars";
import { toast } from "sonner";

interface BarToBarTransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BarToBarTransferDialog = ({
  open,
  onOpenChange,
}: BarToBarTransferDialogProps) => {
  const queryClient = useQueryClient();
  const { data: bars = [] } = useBars();
  
  const [sourceBarId, setSourceBarId] = useState<string>("");
  const [destinationBarId, setDestinationBarId] = useState<string>("");
  const [inventoryItemId, setInventoryItemId] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState("");

  const { data: sourceInventory = [] } = useBarInventory(sourceBarId);
  
  const selectedItem = sourceInventory.find(i => i.inventory_item_id === inventoryItemId);

  const transferMutation = useMutation({
    mutationFn: async () => {
      if (!sourceBarId || !destinationBarId || !inventoryItemId || quantity <= 0) {
        throw new Error("Please fill in all required fields");
      }

      if (sourceBarId === destinationBarId) {
        throw new Error("Source and destination bars must be different");
      }

      if (selectedItem && quantity > selectedItem.current_stock) {
        throw new Error("Insufficient stock at source bar");
      }

      const { data: { user } } = await supabase.auth.getUser();

      // Deduct from source bar
      const { error: deductError } = await supabase
        .from('bar_inventory')
        .update({ 
          current_stock: (selectedItem?.current_stock || 0) - quantity,
          updated_at: new Date().toISOString()
        })
        .eq('bar_id', sourceBarId)
        .eq('inventory_item_id', inventoryItemId);

      if (deductError) throw deductError;

      // Check if destination bar has inventory entry
      const { data: destInventory } = await supabase
        .from('bar_inventory')
        .select('*')
        .eq('bar_id', destinationBarId)
        .eq('inventory_item_id', inventoryItemId)
        .maybeSingle();

      if (destInventory) {
        // Update existing entry
        const { error: updateError } = await supabase
          .from('bar_inventory')
          .update({ 
            current_stock: destInventory.current_stock + quantity,
            updated_at: new Date().toISOString()
          })
          .eq('id', destInventory.id);

        if (updateError) throw updateError;
      } else {
        // Create new entry
        const { error: insertError } = await supabase
          .from('bar_inventory')
          .insert({
            bar_id: destinationBarId,
            inventory_item_id: inventoryItemId,
            current_stock: quantity,
            min_stock_level: 5,
          });

        if (insertError) throw insertError;
      }

      // Create transfer record
      const { error: transferError } = await supabase
        .from('inventory_transfers')
        .insert({
          source_type: 'bar',
          source_bar_id: sourceBarId,
          destination_bar_id: destinationBarId,
          inventory_item_id: inventoryItemId,
          quantity,
          notes,
          transferred_by: user?.id,
          status: 'completed',
          completed_at: new Date().toISOString(),
        });

      if (transferError) throw transferError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bars'] });
      toast.success('Inventory transferred successfully');
      onOpenChange(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to transfer inventory');
    },
  });

  const resetForm = () => {
    setSourceBarId("");
    setDestinationBarId("");
    setInventoryItemId("");
    setQuantity(1);
    setNotes("");
  };

  const activeBars = bars.filter(b => b.is_active);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5" />
            Bar to Bar Transfer
          </DialogTitle>
          <DialogDescription>
            Transfer inventory between bar locations
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={(e) => { e.preventDefault(); transferMutation.mutate(); }} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>From Bar</Label>
              <Select value={sourceBarId} onValueChange={(v) => { setSourceBarId(v); setInventoryItemId(""); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  {activeBars.map((bar) => (
                    <SelectItem key={bar.id} value={bar.id} disabled={bar.id === destinationBarId}>
                      {bar.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>To Bar</Label>
              <Select value={destinationBarId} onValueChange={setDestinationBarId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select destination" />
                </SelectTrigger>
                <SelectContent>
                  {activeBars.map((bar) => (
                    <SelectItem key={bar.id} value={bar.id} disabled={bar.id === sourceBarId}>
                      {bar.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {sourceBarId && (
            <div className="space-y-2">
              <Label>Item to Transfer</Label>
              <Select value={inventoryItemId} onValueChange={setInventoryItemId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select item" />
                </SelectTrigger>
                <SelectContent>
                  {sourceInventory.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground text-center">No inventory at this bar</div>
                  ) : (
                    sourceInventory.map((item) => (
                      <SelectItem key={item.inventory_item_id} value={item.inventory_item_id}>
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          <span>{item.inventory_item?.name}</span>
                          <span className="text-muted-foreground">({item.current_stock} {item.inventory_item?.unit})</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          {selectedItem && (
            <div className="p-3 rounded-lg bg-muted/50 text-sm">
              <div className="flex justify-between">
                <span>Available at source:</span>
                <span className="font-bold">{selectedItem.current_stock} {selectedItem.inventory_item?.unit}</span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min={1}
              max={selectedItem?.current_stock || 999}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Reason for transfer..."
              rows={2}
            />
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={transferMutation.isPending || !sourceBarId || !destinationBarId || !inventoryItemId || quantity <= 0}
            >
              {transferMutation.isPending ? "Transferring..." : "Transfer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};