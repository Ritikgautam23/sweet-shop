import { Package } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export function PurchaseHistory({ purchases }) {
  if (purchases.length === 0) {
    return (
      <div className="text-center py-12 bg-card rounded-lg border border-border">
        <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="font-serif text-lg font-semibold mb-2">No purchases yet</h3>
        <p className="text-muted-foreground">
          Your purchase history will appear here once you make your first order.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Items</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {purchases.map((purchase) => (
            <TableRow key={purchase.id}>
              <TableCell className="font-mono text-xs">
                #{purchase.id.slice(0, 8)}
              </TableCell>
              <TableCell>
                {new Date(purchase.purchasedAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <div className="max-w-[200px]">
                  {purchase.items.map((item, index) => (
                    <span key={index} className="text-sm">
                      {item.sweetName} x{item.quantity}
                      {index < purchase.items.length - 1 && ', '}
                    </span>
                  ))}
                </div>
              </TableCell>
              <TableCell className="text-right font-semibold">
                ${purchase.totalAmount.toFixed(2)}
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="bg-green-900/50 text-green-200">
                  Completed
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
