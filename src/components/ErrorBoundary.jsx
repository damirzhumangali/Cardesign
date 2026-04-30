import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error(error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? null;
    }

    return this.props.children;
  }
}

export function AppRecovery() {
  return (
    <div className="app-recovery">
      <div className="app-recovery-panel">
        <span className="app-recovery-tag">Render Recovery</span>
        <h1>Beyond Motion</h1>
        <p>
          The cinematic scene is reinitializing. Refresh the page after assets are
          ready, or continue once the browser finishes loading the experience.
        </p>
      </div>
    </div>
  );
}

export function SceneRecovery() {
  return (
    <div className="scene-layer scene-layer-fallback" aria-hidden="true">
      <div className="scene-recovery-glow scene-recovery-glow-a" />
      <div className="scene-recovery-glow scene-recovery-glow-b" />
      <div className="scene-recovery-grid" />
    </div>
  );
}
