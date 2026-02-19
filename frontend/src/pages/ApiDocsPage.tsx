import "swagger-ui-react/swagger-ui.css";

import React from "react";
import SwaggerUI from "swagger-ui-react";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from "@mui/material";

type SpecKey = "root" | "backend";

function buildBackendSpecUrl(): string {
  const base = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api/v1";
  return `${base.replace(/\/$/, "")}/docs-json`;
}

function buildRootSpecUrl(): string {
  return (
    import.meta.env.VITE_ROOT_OPENAPI_URL || "http://localhost:3000/api/docs-json"
  );
}

export default function ApiDocsPage() {
  const [specKey, setSpecKey] = React.useState<SpecKey>("backend");

  const onChange = (event: SelectChangeEvent) => {
    setSpecKey(event.target.value as SpecKey);
  };

  const specUrl = specKey === "root" ? buildRootSpecUrl() : buildBackendSpecUrl();

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        API Docs
      </Typography>

      <FormControl size="small" sx={{ minWidth: 240, mb: 2 }}>
        <InputLabel id="api-docs-spec-label">Spec</InputLabel>
        <Select
          labelId="api-docs-spec-label"
          value={specKey}
          label="Spec"
          onChange={onChange}
        >
          <MenuItem value="backend">Backend API (api/v1)</MenuItem>
          <MenuItem value="root">Root API</MenuItem>
        </Select>
      </FormControl>

      <SwaggerUI url={specUrl} />
    </Box>
  );
}
