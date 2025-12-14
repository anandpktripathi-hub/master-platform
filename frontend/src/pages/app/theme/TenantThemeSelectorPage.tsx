import React from "react";
import {
  Box,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Button,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
  Grid,
} from "@mui/material";
import { useThemeContext } from "@/theme/ThemeContext";

interface ThemeError {
  response?: { data?: { message?: string } };
  message?: string;
}

const TenantThemeSelectorPage: React.FC = () => {
  const {
    themes,
    currentTheme,
    loading,
    error,
    selectTheme,
  } = useThemeContext();
  const [localError, setLocalError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [savingId, setSavingId] = React.useState<string | null>(null);

  const handleSelect = async (id: string) => {
    try {
      setSavingId(id);
      await selectTheme(id);
      setSuccess("Theme selected successfully.");
    } catch (err: unknown) {
      console.error(err);
      const error = err as ThemeError;
      setLocalError(
        error?.response?.data?.message || error?.message || "Failed to select theme."
      );
    } finally {
      setSavingId(null);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h5" fontWeight={600} mb={1}>
        Choose Your Theme
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Select a theme for your tenant dashboard. You can customize colors and styles later.
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={6}>
          <CircularProgress />
        </Box>
      ) : themes.length === 0 ? (
        <Typography>No themes available. Please contact support.</Typography>
      ) : (
        <Grid container spacing={2}>
          {themes.map((theme) => {
            const isActive = currentTheme?._id === theme._id;
            const isSaving = savingId === theme._id;
            return (
              <Grid item xs={12} sm={6} md={4} key={theme._id}>
                <Card
                  variant={isActive ? "elevation" : "outlined"}
                  sx={{
                    borderColor: isActive ? "primary.main" : undefined,
                  }}
                >
                  {theme.previewImage && (
                    <CardMedia
                      component="img"
                      height="120"
                      image={theme.previewImage}
                      alt={theme.name}
                    />
                  )}
                  <CardContent>
                    <Typography variant="h6">{theme.name}</Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ wordBreak: "break-all" }}
                    >
                      Key: {theme.key}
                    </Typography>
                    <Typography
                      variant="caption"
                      color={theme.status === "ACTIVE" ? "success.main" : "text.secondary"}
                    >
                      {theme.status}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      variant={isActive ? "contained" : "outlined"}
                      disabled={isActive || isSaving}
                      onClick={() => void handleSelect(theme._id)}
                    >
                      {isActive ? "Selected" : isSaving ? "Applying..." : "Use this theme"}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      <Snackbar
        open={!!(error || localError)}
        autoHideDuration={6000}
        onClose={() => {
          setLocalError(null);
        }}
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

export default TenantThemeSelectorPage;
