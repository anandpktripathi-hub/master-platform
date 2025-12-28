import React, { useEffect, useState } from 'react';
import ErrorBoundary from '../components/ErrorBoundary';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button as MuiButton,
  Grid,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import type { Invoice } from '../types/billing.types';
import { InvoiceTable } from '../components/billing/InvoiceTable';
import billingService from '../services/billingService';

const ITEMS_PER_PAGE = 10;

const Invoices: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);

  // Fetch invoices when page changes
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        setError(null);

        // billingService returns unwrapped data now
        const response = await billingService.getInvoices(currentPage, ITEMS_PER_PAGE);
        setInvoices(response.data || []);
        setTotalPages(response.totalPages || 1);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load invoices';
        setError(errorMessage);
        enqueueSnackbar(errorMessage, { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [currentPage, enqueueSnackbar]);

  const handleViewInvoice = async (invoiceId: string) => {
    try {
      const invoice = await billingService.getInvoiceById(invoiceId);
      setSelectedInvoice(invoice);
      setDetailsDialogOpen(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load invoice details';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  const handleDownloadInvoice = async (invoiceId: string) => {
    try {
      setDownloading(invoiceId);
      await billingService.downloadInvoicePDF(invoiceId);
      enqueueSnackbar('Invoice downloaded successfully', { variant: 'success' });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to download invoice';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setDownloading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amountInCents: number) => {
    return `₹${(amountInCents / 100).toFixed(2)}`;
  };

  return (
    <ErrorBoundary>
      <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Invoices
        </Typography>
        <Typography variant="body2" color="textSecondary">
          View and download your billing invoices
        </Typography>
      </Box>

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Invoices Table */}
      {!loading && !error && (
        <>
          <Card sx={{ mb: 4 }}>
            <CardContent sx={{ p: 0 }}>
              <InvoiceTable
                invoices={invoices}
                onView={handleViewInvoice}
                onDownload={handleDownloadInvoice}
                isLoading={downloading !== null}
              />
            </CardContent>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={(_, newPage) => setCurrentPage(newPage)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}

      {/* Empty State */}
      {!loading && !error && invoices.length === 0 && (
        <Alert severity="info">No invoices found. Start by subscribing to a plan.</Alert>
      )}

      {/* Invoice Details Dialog */}
      <Dialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Invoice Details</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedInvoice && (
            <Box>
              {/* Invoice Header */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">
                    Invoice Number
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {selectedInvoice.invoiceNumber}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">
                    Date
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {formatDate(selectedInvoice.createdAt)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">
                    Status
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {selectedInvoice.status}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">
                    Total Amount
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                    {formatCurrency(selectedInvoice.totalAmount)}
                  </Typography>
                </Grid>
              </Grid>

              {/* Line Items */}
              {selectedInvoice.lineItems && selectedInvoice.lineItems.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Line Items
                  </Typography>
                  {selectedInvoice.lineItems.map((item, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        py: 1,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Box>
                        <Typography variant="body2">{item.description}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          Qty: {item.quantity}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {formatCurrency(item.amount)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}

              {/* Payment Info */}
              {selectedInvoice.paymentMethod && (
                <Box sx={{ mb: 3, p: 1.5, backgroundColor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="caption" color="textSecondary">
                    Payment Method
                  </Typography>
                  <Typography variant="body2">{selectedInvoice.paymentMethod}</Typography>

                  {selectedInvoice.paidAt && (
                    <>
                      <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                        Paid On
                      </Typography>
                      <Typography variant="body2">{formatDate(selectedInvoice.paidAt)}</Typography>
                    </>
                  )}
                </Box>
              )}

              {/* Refund Info */}
              {selectedInvoice.refundedAmount !== undefined && selectedInvoice.refundedAmount > 0 && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  Refunded: {formatCurrency(selectedInvoice.refundedAmount)}
                </Alert>
              )}

              {/* Notes */}
              {selectedInvoice.notes && (
                <Box>
                  <Typography variant="caption" color="textSecondary">
                    Notes
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                    {selectedInvoice.notes}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={() => setDetailsDialogOpen(false)}>Close</MuiButton>
          {selectedInvoice && selectedInvoice.status === 'PAID' && (
            <MuiButton
              onClick={() => {
                handleDownloadInvoice(selectedInvoice._id!);
                setDetailsDialogOpen(false);
              }}
              variant="contained"
              disabled={downloading === selectedInvoice._id}
            >
              Download PDF
            </MuiButton>
          )}
        </DialogActions>
      </Dialog>
      </Container>
    </ErrorBoundary>
  );
};

export default Invoices;
