import React, { useEffect, useState } from 'react';
import { Container, Typography, Paper, Box, Alert, Card, CardContent, Chip } from '@mui/material';
import ErrorBoundary from '../components/ErrorBoundary';
import { CrmDeal, DealStage, getDeals, updateDealStage } from '../api/crm';

const STAGES: DealStage[] = ['NEW', 'QUALIFIED', 'PROPOSAL', 'WON', 'LOST'];

const STAGE_COLORS: { [key in DealStage]: string } = {
  NEW: '#3b82f6',
  QUALIFIED: '#8b5cf6',
  PROPOSAL: '#f59e0b',
  WON: '#10b981',
  LOST: '#ef4444',
};

export default function CrmKanbanPage() {
  const [deals, setDeals] = useState<CrmDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draggedDeal, setDraggedDeal] = useState<CrmDeal | null>(null);

  useEffect(() => {
    loadDeals();
  }, []);

  const loadDeals = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDeals();
      setDeals(data);
    } catch (e: any) {
      setError(e?.message || 'Failed to load deals');
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (deal: CrmDeal) => {
    setDraggedDeal(deal);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (stage: DealStage) => {
    if (!draggedDeal || draggedDeal.stage === stage) {
      setDraggedDeal(null);
      return;
    }
    try {
      await updateDealStage(draggedDeal._id, stage);
      setDeals((prev) =>
        prev.map((d) => (d._id === draggedDeal._id ? { ...d, stage } : d))
      );
    } catch (e: any) {
      setError(e?.message || 'Failed to update deal stage');
    } finally {
      setDraggedDeal(null);
    }
  };

  const dealsByStage = (stage: DealStage) => deals.filter((d) => d.stage === stage);

  return (
    <ErrorBoundary>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          CRM Deal Pipeline (Kanban)
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Typography>Loading pipeline...</Typography>
        ) : (
          <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2 }}>
            {STAGES.map((stage) => {
              const stageDeals = dealsByStage(stage);
              const totalValue = stageDeals.reduce((sum, d) => sum + d.value, 0);
              return (
                <Paper
                  key={stage}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(stage)}
                  sx={{
                    minWidth: 280,
                    maxWidth: 280,
                    p: 2,
                    bgcolor: 'grey.50',
                    borderTop: `4px solid ${STAGE_COLORS[stage]}`,
                  }}
                >
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" sx={{ color: STAGE_COLORS[stage], fontWeight: 'bold' }}>
                      {stage}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {stageDeals.length} deals • ${totalValue.toLocaleString()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {stageDeals.map((deal) => (
                      <Card
                        key={deal._id}
                        draggable
                        onDragStart={() => handleDragStart(deal)}
                        sx={{
                          cursor: 'grab',
                          '&:active': { cursor: 'grabbing' },
                          opacity: draggedDeal?._id === deal._id ? 0.5 : 1,
                        }}
                      >
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                            {deal.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            ${deal.value.toLocaleString()}
                          </Typography>
                          {deal.contactName && (
                            <Chip label={deal.contactName} size="small" sx={{ mt: 1 }} />
                          )}
                          {deal.companyName && (
                            <Chip label={deal.companyName} size="small" sx={{ mt: 1, ml: 0.5 }} />
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                </Paper>
              );
            })}
          </Box>
        )}
      </Container>
    </ErrorBoundary>
  );
}
