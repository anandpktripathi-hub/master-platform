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
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  ResponsiveContainer,
  LineChart,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { useSnackbar } from 'notistack';
import accountingService, { AccountPayload, TransactionPayload, InvoicePayload } from '../services/accountingService';
import { publicSettingsApi, ReportsSettingsDto } from '../lib/api';

interface Account extends AccountPayload {
  _id: string;
}

interface Transaction extends TransactionPayload {
  _id: string;
  date: string;
}

interface Invoice extends InvoicePayload {
  _id: string;
}

const AccountingDashboard: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [summary, setSummary] = useState<{
    income: number;
    expense: number;
    outstandingInvoices: number;
    last6Months?: { month: string; income: number; expense: number; net: number }[];
  } | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [pnl, setPnl] = useState<{
    period: { from: string; to: string };
    totals: { income: number; expense: number; net: number };
    byMonth: { month: string; income: number; expense: number; net: number }[];
  } | null>(null);
  const [balanceSheet, setBalanceSheet] = useState<{
    asOf: string;
    byType: { type: string; balance: number }[];
    totals: { assets: number; liabilities: number; equity: number };
  } | null>(null);
  const [exportingPnl, setExportingPnl] = useState(false);
  const [exportingBalanceSheet, setExportingBalanceSheet] = useState(false);
  const [pnlFrom, setPnlFrom] = useState<string>('');
  const [pnlTo, setPnlTo] = useState<string>('');
  const [balanceAsOf, setBalanceAsOf] = useState<string>('');

  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [newAccount, setNewAccount] = useState<AccountPayload>({ name: '', code: '', type: 'asset', description: '' });

  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
  const [newTransaction, setNewTransaction] = useState<TransactionPayload>({ accountId: '', amount: 0, type: 'debit', description: '' });

  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [newInvoice, setNewInvoice] = useState<InvoicePayload>({
    number: '',
    customerName: '',
    currency: 'USD',
    totalAmount: 0,
    issueDate: new Date().toISOString().substring(0, 10),
    dueDate: new Date().toISOString().substring(0, 10),
    status: 'draft',
    notes: '',
  });

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError(null);
      const [summaryData, accountsData, transactionsData, invoicesData, reportsSettings] = await Promise.all<[
        any,
        any,
        any,
        any,
        ReportsSettingsDto | null
      ]>([
        accountingService.getSummary(),
        accountingService.getAccounts(),
        accountingService.getTransactions(),
        accountingService.getInvoices(),
        (async () => {
          try {
            return await publicSettingsApi.getReportsDefaults();
          } catch {
            return null;
          }
        })(),
      ]);

      setSummary(summaryData);
      setAccounts(accountsData || []);
      setTransactions(transactionsData || []);
      setInvoices(invoicesData || []);

      // Initialize reporting ranges using Reports settings if available
      const now = new Date();
      let fromStr = '';
      let toStr = now.toISOString().substring(0, 10);

      if (reportsSettings) {
        const offset = reportsSettings.defaultStartMonthOffset ?? 0;
        const fromDate = new Date(now.getFullYear(), now.getMonth() + offset, 1);
        fromStr = fromDate.toISOString().substring(0, 10);
      }

      setPnlFrom(fromStr);
      setPnlTo(toStr);
      setBalanceAsOf(toStr);

      const [pnlData, balanceData] = await Promise.all([
        accountingService.getProfitAndLoss(fromStr || undefined, toStr || undefined),
        accountingService.getBalanceSheet(toStr || undefined),
      ]);

      setPnl(pnlData);
      setBalanceSheet(balanceData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load accounting data';
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

  const handleCreateAccount = async () => {
    try {
      await accountingService.createAccount(newAccount);
      enqueueSnackbar('Account created successfully', { variant: 'success' });
      setAccountDialogOpen(false);
      setNewAccount({ name: '', code: '', type: 'asset', description: '' });
      fetchAll();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create account';
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  const handleRecordTransaction = async () => {
    try {
      await accountingService.recordTransaction(newTransaction);
      enqueueSnackbar('Transaction recorded successfully', { variant: 'success' });
      setTransactionDialogOpen(false);
      setNewTransaction({ accountId: '', amount: 0, type: 'debit', description: '' });
      fetchAll();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to record transaction';
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  const handleCreateInvoice = async () => {
    try {
      await accountingService.createInvoice(newInvoice);
      enqueueSnackbar('Invoice created successfully', { variant: 'success' });
      setInvoiceDialogOpen(false);
      setNewInvoice({
        number: '',
        customerName: '',
        currency: 'USD',
        totalAmount: 0,
        issueDate: new Date().toISOString().substring(0, 10),
        dueDate: new Date().toISOString().substring(0, 10),
        status: 'draft',
        notes: '',
      });
      fetchAll();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create invoice';
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  const handleApplyPnlFilters = async () => {
    try {
      const data = await accountingService.getProfitAndLoss(
        pnlFrom || undefined,
        pnlTo || undefined,
      );
      setPnl(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load profit & loss report';
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  const handleApplyBalanceAsOf = async () => {
    try {
      const data = await accountingService.getBalanceSheet(balanceAsOf || undefined);
      setBalanceSheet(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load balance sheet';
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  const handleExportPnlCsv = async () => {
    try {
      setExportingPnl(true);
      const blob = await accountingService.exportProfitAndLossCsv(
        pnlFrom || undefined,
        pnlTo || undefined,
      );
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'profit-and-loss.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to export profit & loss report';
      enqueueSnackbar(message, { variant: 'error' });
    } finally {
      setExportingPnl(false);
    }
  };

  const handleExportBalanceSheetCsv = async () => {
    try {
      setExportingBalanceSheet(true);
      const blob = await accountingService.exportBalanceSheetCsv(
        balanceAsOf || undefined,
      );
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'balance-sheet.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to export balance sheet report';
      enqueueSnackbar(message, { variant: 'error' });
    } finally {
      setExportingBalanceSheet(false);
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
    content = (
      <Alert severity="error">{error}</Alert>
    );
  } else {
    content = (
      <>
        {/* Summary KPIs */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary">Total Income</Typography>
                <Typography variant="h5">${summary?.income.toFixed(2) ?? '0.00'}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary">Total Expense</Typography>
                <Typography variant="h5">${summary?.expense.toFixed(2) ?? '0.00'}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary">Outstanding Invoices</Typography>
                <Typography variant="h5">{summary?.outstandingInvoices ?? 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Cashflow chart (last 6 months) */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Cashflow (last 6 months)
            </Typography>
            {!summary?.last6Months || summary.last6Months.length === 0 ? (
              <Typography variant="body2" color="textSecondary">
                Not enough accounting activity to display cashflow yet.
              </Typography>
            ) : (
              <Box sx={{ width: '100%', height: 260 }}>
                <ResponsiveContainer>
                  <ComposedChart
                    data={summary.last6Months}
                    margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: any) =>
                        typeof value === 'number' ? value.toFixed(2) : value
                      }
                    />
                    <Area
                      type="monotone"
                      dataKey="net"
                      stroke="#0ea5e9"
                      fill="#0ea5e9"
                      fillOpacity={0.15}
                      name="Net cashflow"
                    />
                    <Line
                      type="monotone"
                      dataKey="income"
                      stroke="#22c55e"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      name="Income"
                    />
                    <Line
                      type="monotone"
                      dataKey="expense"
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      name="Expense"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Advanced reports: Profit & Loss and Balance Sheet */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Profit &amp; Loss
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleExportPnlCsv}
                    disabled={exportingPnl || !pnl || pnl.byMonth.length === 0}
                  >
                    {exportingPnl ? 'Exporting…' : 'Export CSV'}
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                  <TextField
                    label="From"
                    type="date"
                    size="small"
                    value={pnlFrom}
                    onChange={(e) => setPnlFrom(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    label="To"
                    type="date"
                    size="small"
                    value={pnlTo}
                    onChange={(e) => setPnlTo(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleApplyPnlFilters}
                    disabled={!pnlFrom && !pnlTo}
                  >
                    Apply
                  </Button>
                </Box>
                {!pnl || pnl.byMonth.length === 0 ? (
                  <Typography variant="body2" color="textSecondary">
                    Not enough transactions yet to display profit &amp; loss.
                  </Typography>
                ) : (
                  <Box sx={{ width: '100%', height: 260 }}>
                    <ResponsiveContainer>
                      <LineChart
                        data={pnl.byMonth}
                        margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip
                          formatter={(value: any) =>
                            typeof value === 'number' ? value.toFixed(2) : value
                          }
                        />
                        <Line
                          type="monotone"
                          dataKey="income"
                          stroke="#22c55e"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          name="Income"
                        />
                        <Line
                          type="monotone"
                          dataKey="expense"
                          stroke="#ef4444"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          name="Expense"
                        />
                        <Line
                          type="monotone"
                          dataKey="net"
                          stroke="#0ea5e9"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          name="Net income"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Balance Sheet Snapshot
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleExportBalanceSheetCsv}
                    disabled={exportingBalanceSheet || !balanceSheet}
                  >
                    {exportingBalanceSheet ? 'Exporting…' : 'Export CSV'}
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                  <TextField
                    label="As of"
                    type="date"
                    size="small"
                    value={balanceAsOf}
                    onChange={(e) => setBalanceAsOf(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleApplyBalanceAsOf}
                    disabled={!balanceAsOf}
                  >
                    Apply
                  </Button>
                </Box>
                {!balanceSheet ? (
                  <Typography variant="body2" color="textSecondary">
                    Not enough data yet to build a balance sheet snapshot.
                  </Typography>
                ) : (
                  <>
                    <Typography variant="caption" color="textSecondary">
                      As of {new Date(balanceSheet.asOf).toLocaleDateString()}
                    </Typography>
                    <Box sx={{ mt: 1, mb: 2 }}>
                      <Typography variant="body2">
                        Assets: ${balanceSheet.totals.assets.toFixed(2)}
                      </Typography>
                      <Typography variant="body2">
                        Liabilities: ${balanceSheet.totals.liabilities.toFixed(2)}
                      </Typography>
                      <Typography variant="body2">
                        Equity: ${balanceSheet.totals.equity.toFixed(2)}
                      </Typography>
                    </Box>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      By account type
                    </Typography>
                    {balanceSheet.byType.length === 0 ? (
                      <Typography variant="body2" color="textSecondary">
                        No account balances yet.
                      </Typography>
                    ) : (
                      <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                        {balanceSheet.byType.map((row) => (
                          <li key={row.type}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.25 }}>
                              <Typography variant="body2">{row.type}</Typography>
                              <Typography variant="body2">
                                ${row.balance.toFixed(2)}
                              </Typography>
                            </Box>
                          </li>
                        ))}
                      </Box>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Accounts & Transactions */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Chart of Accounts</Typography>
                  <Button size="small" variant="contained" onClick={() => setAccountDialogOpen(true)}>New Account</Button>
                </Box>
                {accounts.length === 0 ? (
                  <Typography variant="body2" color="textSecondary">No accounts yet. Create your first account.</Typography>
                ) : (
                  <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                    {accounts.slice(0, 10).map((account) => (
                      <li key={account._id}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                          <Typography variant="body2">{account.code}  {account.name}</Typography>
                          <Typography variant="caption" color="textSecondary">{account.type}</Typography>
                        </Box>
                      </li>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Recent Transactions</Typography>
                  <Button size="small" variant="contained" onClick={() => setTransactionDialogOpen(true)}>Record Transaction</Button>
                </Box>
                {transactions.length === 0 ? (
                  <Typography variant="body2" color="textSecondary">No transactions recorded yet.</Typography>
                ) : (
                  <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                    {transactions.slice(0, 10).map((tx) => (
                      <li key={tx._id}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                          <Typography variant="body2">{new Date(tx.date).toLocaleDateString()}  {tx.description || 'Transaction'}</Typography>
                          <Typography variant="caption" color={tx.type === 'credit' ? 'success.main' : 'error.main'}>
                            {tx.type === 'credit' ? '+' : '-'}${tx.amount.toFixed(2)}
                          </Typography>
                        </Box>
                      </li>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Invoices */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Invoices</Typography>
              <Button size="small" variant="contained" onClick={() => setInvoiceDialogOpen(true)}>New Invoice</Button>
            </Box>
            {invoices.length === 0 ? (
              <Typography variant="body2" color="textSecondary">No invoices yet.</Typography>
            ) : (
              <Grid container spacing={1}>
                {invoices.slice(0, 10).map((inv) => (
                  <Grid item xs={12} md={6} key={inv._id}>
                    <Box sx={{ borderRadius: 1, border: '1px solid', borderColor: 'divider', p: 1.5 }}>
                      <Typography variant="subtitle2">Invoice {inv.number}</Typography>
                      <Typography variant="body2" color="textSecondary">{inv.customerName}</Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        Amount: ${inv.totalAmount.toFixed(2)}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Due {new Date(inv.dueDate).toLocaleDateString()}  Status: {inv.status}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            )}
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <ErrorBoundary>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Accounting
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Manage your chart of accounts, journal entries and invoices.
          </Typography>
        </Box>
        {content}

        {/* New Account Dialog */}
        <Dialog open={accountDialogOpen} onClose={() => setAccountDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>New Account</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Name"
                value={newAccount.name}
                onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                fullWidth
              />
              <TextField
                label="Code"
                value={newAccount.code}
                onChange={(e) => setNewAccount({ ...newAccount, code: e.target.value })}
                fullWidth
              />
              <TextField
                select
                label="Type"
                value={newAccount.type}
                onChange={(e) => setNewAccount({ ...newAccount, type: e.target.value as AccountPayload['type'] })}
                fullWidth
              >
                <MenuItem value="asset">Asset</MenuItem>
                <MenuItem value="liability">Liability</MenuItem>
                <MenuItem value="equity">Equity</MenuItem>
                <MenuItem value="income">Income</MenuItem>
                <MenuItem value="expense">Expense</MenuItem>
              </TextField>
              <TextField
                label="Description"
                value={newAccount.description}
                onChange={(e) => setNewAccount({ ...newAccount, description: e.target.value })}
                fullWidth
                multiline
                minRows={2}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAccountDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateAccount} variant="contained">Create</Button>
          </DialogActions>
        </Dialog>

        {/* Record Transaction Dialog */}
        <Dialog open={transactionDialogOpen} onClose={() => setTransactionDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Record Transaction</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                select
                label="Account"
                value={newTransaction.accountId}
                onChange={(e) => setNewTransaction({ ...newTransaction, accountId: e.target.value })}
                fullWidth
              >
                {accounts.map((account) => (
                  <MenuItem key={account._id} value={account._id}>
                    {account.code}  {account.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Amount"
                type="number"
                value={newTransaction.amount}
                onChange={(e) => setNewTransaction({ ...newTransaction, amount: Number(e.target.value) })}
                fullWidth
              />
              <TextField
                select
                label="Type"
                value={newTransaction.type}
                onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value as TransactionPayload['type'] })}
                fullWidth
              >
                <MenuItem value="debit">Debit</MenuItem>
                <MenuItem value="credit">Credit</MenuItem>
              </TextField>
              <TextField
                label="Description"
                value={newTransaction.description}
                onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                fullWidth
                multiline
                minRows={2}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setTransactionDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleRecordTransaction} variant="contained">Save</Button>
          </DialogActions>
        </Dialog>

        {/* New Invoice Dialog */}
        <Dialog open={invoiceDialogOpen} onClose={() => setInvoiceDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>New Invoice</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Invoice Number"
                value={newInvoice.number}
                onChange={(e) => setNewInvoice({ ...newInvoice, number: e.target.value })}
                fullWidth
              />
              <TextField
                label="Customer Name"
                value={newInvoice.customerName}
                onChange={(e) => setNewInvoice({ ...newInvoice, customerName: e.target.value })}
                fullWidth
              />
              <TextField
                label="Currency"
                value={newInvoice.currency}
                onChange={(e) => setNewInvoice({ ...newInvoice, currency: e.target.value })}
                fullWidth
              />
              <TextField
                label="Total Amount"
                type="number"
                value={newInvoice.totalAmount}
                onChange={(e) => setNewInvoice({ ...newInvoice, totalAmount: Number(e.target.value) })}
                fullWidth
              />
              <TextField
                label="Issue Date"
                type="date"
                value={newInvoice.issueDate}
                onChange={(e) => setNewInvoice({ ...newInvoice, issueDate: e.target.value })}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Due Date"
                type="date"
                value={newInvoice.dueDate}
                onChange={(e) => setNewInvoice({ ...newInvoice, dueDate: e.target.value })}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                select
                label="Status"
                value={newInvoice.status}
                onChange={(e) => setNewInvoice({ ...newInvoice, status: e.target.value as NonNullable<InvoicePayload['status']> })}
                fullWidth
              >
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="sent">Sent</MenuItem>
                <MenuItem value="paid">Paid</MenuItem>
                <MenuItem value="overdue">Overdue</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </TextField>
              <TextField
                label="Notes"
                value={newInvoice.notes}
                onChange={(e) => setNewInvoice({ ...newInvoice, notes: e.target.value })}
                fullWidth
                multiline
                minRows={2}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setInvoiceDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateInvoice} variant="contained">Create</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ErrorBoundary>
  );
};

export default AccountingDashboard;
