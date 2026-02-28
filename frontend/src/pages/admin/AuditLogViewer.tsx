import React, { useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Stack,
  TextField,
  MenuItem,
  Button,
  IconButton,
  Collapse,
  TablePagination,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useAuditLogs } from '../../hooks/useAuditLogs';
import { AuditLog, AuditLogFilters } from '../../types/api.types';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';

export default function AuditLogViewer() {
  const [filters, setFilters] = useState<AuditLogFilters>({
    resourceType: '',
    action: '',
    page: 1,
    limit: 25,
  });

  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const { data, isLoading, isError, refetch } = useAuditLogs(filters);
  const auditLogs = useMemo(() => data?.data ?? [], [data]);

  const handleFilterChange = (key: keyof AuditLogFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setFilters({
      resourceType: '',
      action: '',
      page: 1,
      limit: 25,
    });
  };

  const handlePageChange = (_: unknown, newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage + 1 }));
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextLimit = parseInt(event.target.value, 10);
    setFilters((prev) => ({ ...prev, limit: nextLimit, page: 1 }));
  };

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const getStatusChip = (status: string) => {
    const colors: Record<string, 'success' | 'error' | 'warning'> = {
      success: 'success',
      failure: 'error',
      pending: 'warning',
    };
    return <Chip label={status.toUpperCase()} color={colors[status]} size="small" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatActor = (actorId: any) => {
    if (!actorId) return '';
    if (typeof actorId === 'string') return actorId;
    return actorId.email || actorId.name || String(actorId);
  };

  const renderChanges = (log: AuditLog) => {
    if (!log.changes || log.changes.length === 0) {
      return <Typography variant="body2">No changes</Typography>;
    }

    return (
      <Stack spacing={1}>
        {log.changes.map((change, index) => (
          <Box key={index}>
            <Typography variant="caption" color="textSecondary">
              {change}
            </Typography>
          </Box>
        ))}
      </Stack>
    );
  };

  const renderDetails = (log: AuditLog) => {
    const isExpanded = expandedRows.has(log._id);

    return (
      <>
        <TableRow>
          <TableCell>
            <IconButton size="small" onClick={() => toggleRow(log._id)}>
              {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </TableCell>
          <TableCell>{formatDate(log.createdAt)}</TableCell>
          <TableCell>{log.action}</TableCell>
          <TableCell>{log.resourceType}</TableCell>
          <TableCell>
            <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {log.resourceId}
            </Typography>
          </TableCell>
          <TableCell>{getStatusChip(log.status)}</TableCell>
          <TableCell>{formatActor((log as any).actorId)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell colSpan={7} sx={{ py: 0, borderBottom: isExpanded ? undefined : 'none' }}>
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Changes:
                </Typography>
                {renderChanges(log)}

                {log.errorMessage && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {log.errorMessage}
                  </Alert>
                )}

                {log.ip && (
                  <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 1 }}>
                    IP: {log.ip}
                  </Typography>
                )}

                {log.userAgent && (
                  <Typography variant="caption" color="textSecondary" display="block">
                    User Agent: {log.userAgent}
                  </Typography>
                )}
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      </>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Audit Logs
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
            <TextField
              select
              label="Resource Type"
              value={filters.resourceType || ''}
              onChange={(e) => handleFilterChange('resourceType', e.target.value)}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Domain">Domain</MenuItem>
              <MenuItem value="CustomDomain">Custom Domain</MenuItem>
              <MenuItem value="Package">Package</MenuItem>
              <MenuItem value="Coupon">Coupon</MenuItem>
              <MenuItem value="TenantPackage">Tenant Package</MenuItem>
            </TextField>

            <TextField
              label="Action"
              value={filters.action || ''}
              onChange={(e) => handleFilterChange('action', e.target.value)}
              placeholder="e.g., domain_created"
              sx={{ minWidth: 200 }}
            />

            <TextField
              label="Start Date"
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 180 }}
            />

            <TextField
              label="End Date"
              type="date"
              value={filters.endDate || ''}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 180 }}
            />

            <Button variant="outlined" onClick={handleReset}>
              Reset
            </Button>

            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => refetch()}>
              Refresh
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {isLoading && <LoadingState variant="table" />}

      {isError && <ErrorState onRetry={refetch} message="Failed to load audit logs." />}

      {!isLoading && !isError && (
        <Card>
          <CardContent>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell />
                    <TableCell>Timestamp</TableCell>
                    <TableCell>Action</TableCell>
                    <TableCell>Resource Type</TableCell>
                    <TableCell>Resource ID</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actor</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {auditLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <EmptyState
                          title="No audit logs found"
                          description="Try adjusting filters or perform an action to generate new logs."
                        />
                      </TableCell>
                    </TableRow>
                  ) : (
                    auditLogs.map((log) => renderDetails(log))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={data?.total ?? auditLogs.length}
              page={(filters.page ?? 1) - 1}
              onPageChange={handlePageChange}
              rowsPerPage={filters.limit ?? 25}
              onRowsPerPageChange={handleRowsPerPageChange}
              rowsPerPageOptions={[10, 25, 50, 100]}
            />
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
