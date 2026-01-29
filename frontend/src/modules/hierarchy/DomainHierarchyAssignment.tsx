import React, { useEffect, useState } from 'react';
import { DomainHierarchyApi } from './DomainHierarchyApi';
import HierarchyApi, { HierarchyNode } from './HierarchyApi';
import { Button, Card, CardContent, Typography, Stack, Checkbox, FormControlLabel, CircularProgress } from '@mui/material';
import styles from './HierarchyAssignmentTree.module.css';

interface Props {
  domainId: string;
}

const DomainHierarchyAssignment: React.FC<Props> = ({ domainId }) => {
  const [nodes, setNodes] = useState<HierarchyNode[]>([]);
  const [assigned, setAssigned] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNodes();
    fetchAssigned();
  }, [domainId]);

  const fetchNodes = async () => {
    setLoading(true);
    try {
      const tree = await HierarchyApi.getTree();
      setNodes(tree);
    } catch (err) {
      setError('Failed to load hierarchy nodes');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssigned = async () => {
    try {
      const { data } = await DomainHierarchyApi.getNodes(domainId);
      setAssigned(data.nodeIds || []);
    } catch (err) {
      setAssigned([]);
    }
  };

  const handleToggle = (nodeId: string) => {
    setAssigned((prev) =>
      prev.includes(nodeId) ? prev.filter((id) => id !== nodeId) : [...prev, nodeId]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await DomainHierarchyApi.assignNodes(domainId, assigned);
    } catch (err) {
      setError('Failed to assign nodes');
    } finally {
      setSaving(false);
    }
  };

  const renderTree = (nodes: HierarchyNode[], level = 0) => (
    <ul className={styles.treeList}>
      {nodes.map((node) => (
        <li key={node._id}>
          <FormControlLabel
            control={
              <Checkbox
                checked={assigned.includes(node._id)}
                onChange={() => handleToggle(node._id)}
              />
            }
            label={<span><b>{node.name}</b> <i>({node.type})</i></span>}
          />
          {node.children && node.children.length > 0 && renderTree(node.children, level + 1)}
        </li>
      ))}
    </ul>
  );

  return (
    <Card sx={{ mt: 2 }}>
      <CardContent>
        <Typography variant="h6">Assign Features/Options</Typography>
        {error && <Typography color="error">{error}</Typography>}
        {loading ? <CircularProgress /> : renderTree(nodes)}
        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? <CircularProgress size={20} /> : 'Save Assignment'}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default DomainHierarchyAssignment;
