import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Grid,
  Card,
  CardContent,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useThemeContext } from "@/theme/ThemeContext";

type EditableVars = Record<string, string>;

interface ThemeError {
  response?: { data?: { message?: string } };
  message?: string;
}

const TenantThemeCustomizerPage: React.FC = () => {
  const { variables, loading, error, updateCustomVariables } = useThemeContext();
  const [localVars, setLocalVars] = useState<EditableVars>({});
  const [saving, setSaving] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (variables?.mergedCssVariables) {
      setLocalVars(variables.mergedCssVariables);
    }
  }, [variables]);

  const handleChange =
    (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setLocalVars((prev) => ({
        ...prev,
        [key]: value,
      }));
      if (typeof document !== "undefined") {
        document.documentElement.style.setProperty(key, value);
      }
    };

  const handleSave = async () => {
    try {
      setSaving(true);
      setLocalError(null);
      // Send only overrides different from merged (optional simplification)
      await updateCustomVariables(localVars);
      setSuccess("Theme customization saved.");
    } catch (err: unknown) {
      console.error(err);
      const error = err as ThemeError;
      setLocalError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to save customizations."
      );
    } finally {
      setSaving(false);
    }
  };

  const editableEntries = Object.entries(localVars || {});

  return (
    <Box p={3}>
      <Typography variant="h5" fontWeight={600} mb={1}>
        Customize Theme
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Adjust colors, spacing and appearance of your tenant dashboard. Changes
        will be applied live as you edit.
      </Typography>

      {loading && !variables ? (
        <Box display="flex" justifyContent="center" mt={6}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" mb={2}>
                  CSS Variables
                </Typography>
                {editableEntries.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No variables available. Please select a theme first.
                  </Typography>
                ) : (
                  editableEntries.map(([key, value]) => (
                    <Box key={key} mb={1.5}>
                      <Typography variant="caption" color="text.secondary">
                        {key}
                      </Typography>
                      <TextField
                        fullWidth
                        size="small"
                        value={value}
                        onChange={handleChange(key)}
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                  ))
                )}
                <Box mt={2} display="flex" justifyContent="flex-end">
                  <Button
                    variant="contained"
                    onClick={() => void handleSave()}
                    disabled={saving || editableEntries.length === 0}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={5}>
            <Card
              sx={{
                borderRadius: 3,
                overflow: "hidden",
                border: "1px solid rgba(0,0,0,0.1)",
              }}
            >
              <CardContent
                sx={{
                  minHeight: 260,
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                <Typography variant="subtitle1" mb={1}>
                  Live Preview
                </Typography>
                <Box
                  sx={{
                    flex: 1,
                    borderRadius: 2,
                    border: "1px solid rgba(0,0,0,0.08)",
                    p: 2,
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.5,
                    backgroundColor: "var(--color-background, #f9fafb)",
                    color: "var(--color-text, #111827)",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 1,
                    }}
                  >
                    <Box
                      sx={{
                        fontWeight: 600,
                        fontSize: 14,
                      }}
                    >
                      Dashboard
                    </Box>
                    <Box
                      sx={{
                        width: 72,
                        height: 24,
                        borderRadius: 999,
                        bgcolor: "var(--color-primary, #1976d2)",
                      }}
                    />
                  </Box>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 1,
                    }}
                  >
                    <Box
                      sx={{
                        borderRadius: 2,
                        p: 1.5,
                        bgcolor: "var(--card-bg, #ffffff)",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                      }}
                    >
                      <Typography variant="caption">Card A</Typography>
                      <Box
                        sx={{
                          mt: 1,
                          width: "100%",
                          height: 6,
                          borderRadius: 999,
                          bgcolor: "var(--color-primary, #1976d2)",
                        }}
                      />
                    </Box>
                    <Box
                      sx={{
                        borderRadius: 2,
                        p: 1.5,
                        bgcolor: "var(--card-bg, #ffffff)",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                      }}
                    >
                      <Typography variant="caption">Card B</Typography>
                      <Box
                        sx={{
                          mt: 1,
                          width: "100%",
                          height: 6,
                          borderRadius: 999,
                          bgcolor: "var(--color-secondary, #9c27b0)",
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Snackbar
        open={!!(error || localError)}
        autoHideDuration={6000}
        onClose={() => setLocalError(null)}
      >
        {error || localError ? (
          <Alert
            onClose={() => setLocalError(null)}
            severity="error"
            variant="filled"
            sx={{ width: "100%" }}
          >
            {localError || error}
          </Alert>
        ) : null}
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={4000}
        onClose={() => setSuccess(null)}
      >
        {success ? (
          <Alert
            onClose={() => setSuccess(null)}
            severity="success"
            variant="filled"
            sx={{ width: "100%" }}
          >
            {success}
          </Alert>
        ) : null}
      </Snackbar>
    </Box>
  );
};

export default TenantThemeCustomizerPage;
