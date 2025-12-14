import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { SweetForm } from '@/components/sweets/SweetForm';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const API_BASE_URL = 'http://localhost:5000/api';

export default function Admin() {
  const [sweets, setSweets] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSweet, setEditingSweet] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    fetchSweets();
    fetchNotifications();
  }, []);

  const fetchSweets = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/sweets`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setSweets(data.data);
      } else {
        toast.error('Failed to fetch sweets');
      }
    } catch (error) {
      toast.error('Failed to fetch sweets');
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        // Filter for inventory alerts
        const inventoryAlerts = data.data.filter(n => n.type === 'inventory');
        setNotifications(inventoryAlerts);
      }
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  };

  const handleCreateSweet = async (sweetData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/sweets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(sweetData),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Sweet created successfully');
        setSweets([...sweets, data.data]);
        setShowForm(false);
      } else {
        toast.error(data.error || 'Failed to create sweet');
      }
    } catch (error) {
      toast.error('Failed to create sweet');
    }
  };

  const handleUpdateSweet = async (sweetData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/sweets/${editingSweet.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(sweetData),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Sweet updated successfully');
        setSweets(sweets.map(s => s.id === editingSweet.id ? data.data : s));
        setEditingSweet(null);
        setShowForm(false);
      } else {
        toast.error(data.error || 'Failed to update sweet');
      }
    } catch (error) {
      toast.error('Failed to update sweet');
    }
  };

  const handleDeleteSweet = async (sweetId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/sweets/${sweetId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Sweet deleted successfully');
        setSweets(sweets.filter(s => s.id !== sweetId));
      } else {
        toast.error(data.error || 'Failed to delete sweet');
      }
    } catch (error) {
      toast.error('Failed to delete sweet');
    }
  };

  const handleFormSubmit = (sweetData) => {
    if (editingSweet) {
      handleUpdateSweet(sweetData);
    } else {
      handleCreateSweet(sweetData);
    }
  };

  const handleFormCancel = () => {
    setEditingSweet(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <Layout>
        <div className="container px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground">Manage sweets inventory</p>
          </div>
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingSweet(null); setShowForm(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Sweet
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingSweet ? 'Edit Sweet' : 'Add New Sweet'}</DialogTitle>
              </DialogHeader>
              <SweetForm
                sweet={editingSweet}
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
              />
            </DialogContent>
          </Dialog>
        </div>

        {notifications.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-red-600">Inventory Alerts ({notifications.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <div key={notification._id} className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-800">{notification.message}</p>
                    <p className="text-xs text-red-600 mt-1">
                      {new Date(notification.date).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Sweets Inventory ({sweets.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Threshold</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sweets.map((sweet) => (
                     <TableRow key={sweet.id}>
                       <TableCell>
                         <img
                           src={sweet.image}
                           alt={sweet.name}
                           className="w-12 h-12 object-cover rounded"
                         />
                       </TableCell>
                       <TableCell className="font-medium">{sweet.name}</TableCell>
                       <TableCell>
                         <Badge variant="secondary">{sweet.category}</Badge>
                       </TableCell>
                       <TableCell>${sweet.price}</TableCell>
                       <TableCell className={sweet.quantity <= (sweet.lowStockThreshold || 10) ? 'text-red-600 font-semibold' : ''}>
                         {sweet.quantity}
                       </TableCell>
                       <TableCell>{sweet.lowStockThreshold || 10}</TableCell>
                       <TableCell>
                         {sweet.averageRating > 0 ? <span className="flex items-center gap-1">
                           ⭐ {sweet.averageRating}
                           <span className="text-muted-foreground text-sm">
                             ({sweet.reviewCount})
                           </span>
                         </span> : <span className="text-muted-foreground">No reviews</span>}
                       </TableCell>
                       <TableCell>
                         <div className="flex items-center gap-2">
                           <Button
                             variant="ghost"
                             size="sm"
                             onClick={() => { setEditingSweet(sweet); setShowForm(true); }}
                           >
                             <Edit className="h-4 w-4" />
                           </Button>
                           <AlertDialog>
                             <AlertDialogTrigger asChild>
                               <Button variant="ghost" size="sm" className="text-destructive">
                                 <Trash2 className="h-4 w-4" />
                               </Button>
                             </AlertDialogTrigger>
                             <AlertDialogContent>
                               <AlertDialogHeader>
                                 <AlertDialogTitle>Delete Sweet</AlertDialogTitle>
                                 <AlertDialogDescription>
                                   Are you sure you want to delete "{sweet.name}"? This action cannot be undone.
                                 </AlertDialogDescription>
                               </AlertDialogHeader>
                               <AlertDialogFooter>
                                 <AlertDialogCancel>Cancel</AlertDialogCancel>
                                 <AlertDialogAction
                                   onClick={() => handleDeleteSweet(sweet.id)}
                                   className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                 >
                                   Delete
                                 </AlertDialogAction>
                               </AlertDialogFooter>
                             </AlertDialogContent>
                           </AlertDialog>
                         </div>
                       </TableCell>
                     </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}