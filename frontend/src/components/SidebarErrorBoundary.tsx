import React from 'react';

interface SidebarErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface SidebarErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

class SidebarErrorBoundary extends React.Component<SidebarErrorBoundaryProps, SidebarErrorBoundaryState> {
  constructor(props: SidebarErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): SidebarErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Sidebar Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="sidebar-fallback">
          <div className="sidebar-header-fallback">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ 
                width: '32px', 
                height: '32px', 
                backgroundColor: '#3b82f6', 
                borderRadius: '8px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'white'
              }}>
                🧠
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '600' }}>Deterioro cognitivo</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Sistema inteligente</div>
              </div>
            </div>
          </div>
          
          <div className="sidebar-content-fallback">
            <div style={{ marginBottom: '16px', color: '#ef4444', fontSize: '14px' }}>
              ⚠️ Error en el sidebar. Recarga la página.
            </div>
            
            <nav>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '8px' }}>
                MÓDULOS
              </div>
              <ul className="sidebar-menu-fallback">
                <li className="sidebar-menu-item-fallback">
                  <a href="/dashboard" className="sidebar-menu-button-fallback">
                    🏠 Dashboard
                  </a>
                </li>
                <li className="sidebar-menu-item-fallback">
                  <a href="/pacientes" className="sidebar-menu-button-fallback">
                    👥 Pacientes
                  </a>
                </li>
                <li className="sidebar-menu-item-fallback">
                  <a href="/evaluaciones" className="sidebar-menu-button-fallback">
                    🧠 Evaluaciones
                  </a>
                </li>
                <li className="sidebar-menu-item-fallback">
                  <a href="/analisis" className="sidebar-menu-button-fallback">
                    📊 Análisis
                  </a>
                </li>
              </ul>
            </nav>
          </div>
          
          <div className="sidebar-footer-fallback">
            <button 
              onClick={() => window.location.href = '/login'}
              className="sidebar-menu-button-fallback"
              style={{ color: '#ef4444' }}
            >
              🚪 Cerrar Sesión
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default SidebarErrorBoundary;
