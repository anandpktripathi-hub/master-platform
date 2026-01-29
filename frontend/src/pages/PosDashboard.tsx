import React, { useEffect, useState } from 'react';
import ErrorBoundary from '../components/ErrorBoundary';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import posService, { PosOrderPayload, PosOrderItemPayload, StockAdjustPayload } from '../services/posService';

interface StockItem {
  _id: string;
  productId: { _id: string; name: string; price: number } | string;
  quantity: number;
  minStock: number;
}

interface PosOrder {
  _id: string;
  totalAmount: number;
  createdAt: string;
  customerName?: string;
  paymentMethod?: string;
}

const PosDashboard: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [summary, setSummary] = useState<{ totalSales: number; totalOrders: number; lowStockItems: number } | null>(null);
  const [stock, setStock] = useState<StockItem[]>([]);
  const [orders, setOrders] = useState<PosOrder[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  const [saleDialogOpen, setSaleDialogOpen] = useState(false);
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);

  const [orderItems, setOrderItems] = useState<PosOrderItemPayload[]>([{ productId: '', quantity: 1, unitPrice: undefined }]);
  const [orderMeta, setOrderMeta] = useState<{ customerName: string; paymentMethod: string }>({ customerName: '', paymentMethod: '' });

  const [adjustPayload, setAdjustPayload] = useState<StockAdjustPayload>({ productId: '', quantityDelta: 0, type: 'adjustment', reason: '', minStock: 0 });

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError(null);
      const [summaryData, stockData, ordersData, productsData] = await Promise.all([
        posService.getSummary(),
        posService.getStock(),
        posService.getOrders(),
        posService.getProducts(),
      ]);

      setSummary(summaryData);
      setStock(stockData || []);
      setOrders(ordersData || []);
      setProducts(productsData?.data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load POS data';
      setError(message);
      enqueueSnackbar(message, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddOrderItem = () => {
    setOrderItems([...orderItems, { productId: '', quantity: 1, unitPrice: undefined }]);
  };

  const handleOrderItemChange = (index: number, field: keyof PosOrderItemPayload, value: any) => {
    const updated = [...orderItems];
    // @ts-expect-error dynamic assignment
    updated[index][field] = field === 'quantity' ? Number(value) : value;
    setOrderItems(updated);
  };

  const handleCreateOrder = async () => {
    const payload: PosOrderPayload = {
      items: orderItems.filter((i) => i.productId && i.quantity > 0),
      customerName: orderMeta.customerName || undefined,
      paymentMethod: orderMeta.paymentMethod || undefined,
    };

    if (!payload.items.length) {
      enqueueSnackbar('Add at least one line item', { variant: 'warning' });
      return;
    }

    try {
      await posService.createOrder(payload);
      enqueueSnackbar('Sale recorded successfully', { variant: 'success' });
      setSaleDialogOpen(false);
      setOrderItems([{ productId: '', quantity: 1, unitPrice: undefined }]);
      setOrderMeta({ customerName: '', paymentMethod: '' });
      fetchAll();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to record sale';
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  const handleAdjustStock = async () => {
    if (!adjustPayload.productId || !adjustPayload.quantityDelta) {
      enqueueSnackbar('Select product and quantity', { variant: 'warning' });
      return;
    }
    try {
      await posService.adjustStock(adjustPayload);
      enqueueSnackbar('Stock adjusted', { variant: 'success' });
      setAdjustDialogOpen(false);
      setAdjustPayload({ productId: '', quantityDelta: 0, type: 'adjustment', reason: '', minStock: 0 });
      fetchAll();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to adjust stock';
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  let content;
  if (loading) {
    content = (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  } else if (error) {
    content = <Alert severity="error">{error}</Alert>;
  } else {
    content = (
      <>
        {/* Summary KPIs */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card><CardContent>
              <Typography variant="subtitle2" color="textSecondary">Total Sales</Typography>
              <Typography variant="h5">${summary?.totalSales.toFixed(2) ?? '0.00'}</Typography>
            </CardContent></Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card><CardContent>
              <Typography variant="subtitle2" color="textSecondary">Total Orders</Typography>
              <Typography variant="h5">{summary?.totalOrders ?? 0}</Typography>
            </CardContent></Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card><CardContent>
              <Typography variant="subtitle2" color="textSecondary">Low Stock Items</Typography>
              <Typography variant="h5">{summary?.lowStockItems ?? 0}</Typography>
            </CardContent></Card>
          </Grid>
        </Grid>

        {/* Stock and orders */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Stock</Typography>
                  <Button size="small" variant="contained" onClick={() => setAdjustDialogOpen(true)}>Adjust Stock</Button>
                </Box>
                {stock.length === 0 ? (
                  <Typography variant="body2" color="textSecondary">No stock records yet.</Typography>
                ) : (
                  <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                    {stock.slice(0, 15).map((item) => {
                      const product = typeof item.productId === 'string' ? products.find((p) => p._id === item.productId) : item.productId;
                      const isLow = item.quantity <= item.minStock;
                      return (
                        <li key={item._id}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                            <Typography variant="body2">{product?.name || 'Product'} ({item.quantity})</Typography>
                            <Typography variant="caption" color={isLow ? 'error.main' : 'textSecondary'}>
                              {isLow ? 'Low' : 'OK'}
                            </Typography>
                          </Box>
                        </li>
                      );
                    })}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Recent Orders</Typography>
                  <Button size="small" variant="contained" onClick={() => setSaleDialogOpen(true)}>Record Sale</Button>
                </Box>
                {orders.length === 0 ? (
                  <Typography variant="body2" color="textSecondary">No orders yet.</Typography>
                ) : (
                  <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                    {orders.slice(0, 10).map((order) => (
                      <li key={order._id}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                          <Typography variant="body2">{new Date(order.createdAt).toLocaleString()}</Typography>
                          <Typography variant="caption" color="textSecondary">${order.totalAmount.toFixed(2)}</Typography>
                        </Box>
                      </li>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </>
    );
  }

  return (
    <ErrorBoundary>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            POS & Warehouse
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Record sales, track inventory and watch stock alerts.
          </Typography>
        </Box>
        {content}

        {/* Record Sale Dialog */}
        <Dialog open={saleDialogOpen} onClose={() => setSaleDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Record Sale</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {orderItems.map((item, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    select
                    label="Product"
                    value={item.productId}
                    onChange={(e) => handleOrderItemChange(index, 'productId', e.target.value)}
                    fullWidth
                  >
                    {products.map((p) => (
                      <MenuItem key={p._id} value={p._id}>{p.name}</MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    label="Qty"
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleOrderItemChange(index, 'quantity', e.target.value)}
                    sx={{ width: 100 }}
                  />
                  <TextField
                    label="Unit Price"
                    type="number"
                    value={item.unitPrice ?? ''}
                    onChange={(e) => handleOrderItemChange(index, 'unitPrice', e.target.value)}
                    sx={{ width: 130 }}
                  />
                </Box>
              ))}
              <Button size="small" onClick={handleAddOrderItem}>Add Line Item</Button>
              <TextField
                label="Customer Name"
                value={orderMeta.customerName}
                onChange={(e) => setOrderMeta({ ...orderMeta, customerName: e.target.value })}
                fullWidth
              />
              <TextField
                label="Payment Method"
                value={orderMeta.paymentMethod}
                onChange={(e) => setOrderMeta({ ...orderMeta, paymentMethod: e.target.value })}
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSaleDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateOrder} variant="contained">Save</Button>
          </DialogActions>
        </Dialog>

        {/* Adjust Stock Dialog */}
        <Dialog open={adjustDialogOpen} onClose={() => setAdjustDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Adjust Stock</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                select
                label="Product"
                value={adjustPayload.productId}
                onChange={(e) => setAdjustPayload({ ...adjustPayload, productId: e.target.value })}
                fullWidth
              >
                {products.map((p) => (
                  <MenuItem key={p._id} value={p._id}>{p.name}</MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Type"
                value={adjustPayload.type}
                onChange={(e) => setAdjustPayload({ ...adjustPayload, type: e.target.value as StockAdjustPayload['type'] })}
                fullWidth
              >
                <MenuItem value="purchase">Purchase (+)</MenuItem>
                <MenuItem value="sale">Sale (-)</MenuItem>
                <MenuItem value="adjustment">Adjustment (+/-)</MenuItem>
              </TextField>
              <TextField
                label="Quantity Delta"
                type="number"
                value={adjustPayload.quantityDelta}
                onChange={(e) => setAdjustPayload({ ...adjustPayload, quantityDelta: Number(e.target.value) })}
                fullWidth
              />
              <TextField
                label="Minimum Stock Threshold"
                type="number"
                value={adjustPayload.minStock ?? 0}
                onChange={(e) => setAdjustPayload({ ...adjustPayload, minStock: Number(e.target.value) })}
                fullWidth
              />
              <TextField
                label="Reason"
                value={adjustPayload.reason}
                onChange={(e) => setAdjustPayload({ ...adjustPayload, reason: e.target.value })}
                fullWidth
                multiline
                minRows={2}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAdjustDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAdjustStock} variant="contained">Save</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ErrorBoundary>
  );
};

export default PosDashboard;
