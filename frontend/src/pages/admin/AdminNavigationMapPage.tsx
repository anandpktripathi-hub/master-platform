import React, { useEffect, useMemo, useState } from 'react';
import { Container, Typography, Paper, Box, Table, TableBody, TableCell, TableHead, TableRow, Chip, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import api from '../../lib/api';
import { NAV_ITEMS } from '../../navigation/navConfig';

type FeatureNode = {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  allowedRoles?: string[];
  allowedTenants?: string[];
  children?: FeatureNode[];
};

function flattenFeatures(nodes: FeatureNode[] = [], acc: FeatureNode[] = []): FeatureNode[] {
  for (const n of nodes) {
    acc.push(n);
    if (n.children && Array.isArray(n.children)) {
      flattenFeatures(n.children, acc);
    }
  }
  return acc;
}

export default function AdminNavigationMapPage() {
  const [features, setFeatures] = useState<FeatureNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const resp = await api.get('/features');
        const tree = Array.isArray(resp) ? (resp as FeatureNode[]) : [];
        if (mounted) setFeatures(tree);
      } catch (e: unknown) {
        const message =
          typeof e === 'object' && e && 'message' in e
            ? String((e as { message?: unknown }).message)
            : 'Failed to load feature registry';
        if (mounted) setError(message);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const featureIdToRoute = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of NAV_ITEMS) {
      if (item.featureId) {
        map.set(item.featureId, item.to);
      }
      // also map by nav id (useful for platform-admin leaf nodes that match nav ids)
      map.set(item.id, item.to);
    }
    return map;
  }, []);

  const flat = useMemo(() => flattenFeatures(features, []), [features]);

  const rows = useMemo(() => {
    return flat.map((f) => {
      const to = featureIdToRoute.get(f.id);
      const uiRequired = !['module', 'submodule'].includes(String(f.type || '').toLowerCase());
      return {
        id: f.id,
        name: f.name,
        type: f.type,
        enabled: !!f.enabled,
        allowedRoles: f.allowedRoles || [],
        to,
        uiRequired,
      };
    });
  }, [flat, featureIdToRoute]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Navigation Map
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        This page maps backend feature registry nodes to UI entry points. Enabled feature nodes without a UI link are launch blockers.
      </Typography>

      <Paper sx={{ p: 2 }}>
        {loading && (
          <Box sx={{ py: 2 }}>
            <Typography>Loading feature registry…</Typography>
          </Box>
        )}
        {error && (
          <Box sx={{ py: 2 }}>
            <Typography color="error">{error}</Typography>
            <Button variant="outlined" sx={{ mt: 1 }} onClick={() => window.location.reload()}>
              Retry
            </Button>
          </Box>
        )}

        {!loading && !error && (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Feature</TableCell>
                <TableCell>ID</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Enabled</TableCell>
                <TableCell>Roles</TableCell>
                <TableCell>UI Entry</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.name}</TableCell>
                  <TableCell sx={{ fontFamily: 'monospace' }}>{r.id}</TableCell>
                  <TableCell>{r.type}</TableCell>
                  <TableCell>
                    {r.enabled ? <Chip size="small" label="enabled" color="success" /> : <Chip size="small" label="disabled" />}
                  </TableCell>
                  <TableCell>
                    {r.allowedRoles.length ? r.allowedRoles.join(', ') : '—'}
                  </TableCell>
                  <TableCell>
                    {!r.uiRequired ? (
                      <Chip size="small" label="N/A" />
                    ) : !r.enabled ? (
                      <Chip size="small" label="Disabled" />
                    ) : r.to ? (
                      <Button component={RouterLink} to={r.to} variant="text">
                        Open
                      </Button>
                    ) : (
                      <Chip size="small" label="Missing UI" color="error" />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>
    </Container>
  );
}
