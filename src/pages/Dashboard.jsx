import { useState } from 'react';
import { User, Package, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { PurchaseHistory } from '@/components/dashboard/PurchaseHistory';
import { AccountSettings } from '@/components/dashboard/AccountSettings';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Mock purchase history
const mockPurchases = [
  {
    id: 'order-001',
    userId: '2',
    items: [
      { sweetId: '1', sweetName: 'Belgian Dark Chocolate Truffles', quantity: 2, priceAtPurchase: 24.99 },
      { sweetId: '5', sweetName: 'French Butter Croissants', quantity: 4, priceAtPurchase: 4.99 },
    ],
    totalAmount: 69.94,
    purchasedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'order-002',
    userId: '2',
    items: [
      { sweetId: '9', sweetName: 'Red Velvet Layer Cake', quantity: 1, priceAtPurchase: 45.99 },
    ],
    totalAmount: 45.99,
    purchasedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
];

function DashboardContent() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [purchases] = useState(mockPurchases);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl md:text-3xl font-bold">{user?.name}</h1>
                {user?.role === 'admin' && (
                  <Badge className="bg-primary/20 text-primary">Admin</Badge>
                )}
              </div>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Button variant="outline" className="gap-2" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="bg-secondary">
            <TabsTrigger value="orders" className="gap-2">
              <Package className="h-4 w-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <div className="space-y-4">
              <h2 className="font-serif text-xl font-semibold">Purchase History</h2>
              <PurchaseHistory purchases={purchases} />
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <div className="space-y-4">
              <h2 className="font-serif text-xl font-semibold">Account Settings</h2>
              <AccountSettings />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
