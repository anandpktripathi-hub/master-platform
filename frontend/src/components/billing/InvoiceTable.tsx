import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import VisibilityIcon from '@mui/icons-material/Visibility';
import type { Invoice } from '../../types/billing.types';
import { useAdminSettings } from '../../contexts/AdminSettingsContext';
import { formatDateWithSystemSettings, formatCurrencyWithSettings } from '../../utils/formatting';

interface InvoiceTableProps {
  invoices: Invoice[];
  onDownload?: (invoiceId: string) => void;
  onView?: (invoiceId: string) => void;
  isLoading?: boolean;
}

const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' => {
  switch (status) {
    case 'PAID':
      return 'success';
    case 'PENDING':
      return 'warning';
    case 'FAILED':
      return 'error';
    case 'REFUNDED':
      return 'info';
    default:
      return 'default';
  }
};

export const InvoiceTable: React.FC<InvoiceTableProps> = ({
  invoices,
  onDownload,
  onView,
  isLoading = false,
}) => {
  const { system, currency } = useAdminSettings();

  const formatDate = (dateString: string) => {
    return formatDateWithSystemSettings(dateString, system);
  };

  const formatCurrency = (amountInCents: number, invoiceCurrency?: string | null) => {
    return formatCurrencyWithSettings(amountInCents, invoiceCurrency || null, currency);
  };

  return (
    <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: 'background.default' }}>
            <TableCell sx={{ fontWeight: 700 }}>Invoice Number</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
            <TableCell sx={{ fontWeight: 700 }} align="right">
              Amount
            </TableCell>
            <TableCell sx={{ fontWeight: 700 }} align="center">
              Status
            </TableCell>
            <TableCell sx={{ fontWeight: 700 }} align="center">
              Actions
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {invoices.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                No invoices found
              </TableCell>
            </TableRow>
          ) : (
            invoices.map((invoice) => (
              <TableRow key={invoice._id} hover>
                <TableCell>
                  <Box sx={{ fontWeight: 500 }}>{invoice.invoiceNumber}</Box>
                </TableCell>

                <TableCell>{formatDate(invoice.createdAt)}</TableCell>

                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  {formatCurrency(
                    (invoice as any).totalAmount ?? (invoice as any).amount ?? 0,
                    invoice.currency,
                  )}
                </TableCell>

                <TableCell align="center">
                  <Chip
                    label={invoice.status}
                    size="small"
                    color={getStatusColor(invoice.status)}
                    variant="outlined"
                  />
                </TableCell>

                <TableCell align="center">
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                    {onView && (
                      <Tooltip title="View Invoice">
                        <IconButton
                          size="small"
                          onClick={() => onView(invoice._id!)}
                          disabled={isLoading}
                          sx={{ color: 'primary.main' }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}

                    {onDownload && invoice.status === 'PAID' && (
                      <Tooltip title="Download PDF">
                        <IconButton
                          size="small"
                          onClick={() => onDownload(invoice._id!)}
                          disabled={isLoading}
                          sx={{ color: 'success.main' }}
                        >
                          <FileDownloadIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
