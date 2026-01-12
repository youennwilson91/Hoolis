import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    // Tu peux ajouter un service de logging ici (Sentry, etc.)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '20px',
          margin: '20px',
          backgroundColor: 'rgba(255, 0, 0, 0.1)',
          border: '2px solid red',
          borderRadius: '8px',
          color: 'white'
        }}>
          <h2>Une erreur s'est produite</h2>
          <p>Cette section a rencontré un problème.</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              marginTop: '10px',
              padding: '8px 16px',
              cursor: 'pointer',
              backgroundColor: '#efec8f',
              border: 'none',
              borderRadius: '4px'
            }}
          >
            Réessayer
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
