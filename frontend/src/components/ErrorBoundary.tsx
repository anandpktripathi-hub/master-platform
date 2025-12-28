import React, { Component } from 'react';
import { Typography, Button, Stack } from '@mui/material';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-5 text-center">
          <Stack spacing={1.5} alignItems="center">
            <Typography variant="h5" color="error">
              Something went wrong.
            </Typography>
            <Typography variant="body1" color="textSecondary">
              {this.state.error?.toString()}
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" onClick={() => window.location.reload()}>
                Reload
              </Button>
              <Button variant="contained" color="primary" onClick={this.handleReset}>
                Try Again
              </Button>
            </Stack>
          </Stack>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
