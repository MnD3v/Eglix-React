import { Outlet, Link, Routes, Route } from 'react-router-dom';

function MainLayout() {
  return (
    <div className="app-container">
      {/* 1. L'AppBar fixe qui ne bougera jamais */}
      <nav style={{ background: '#2c3e50', color: 'white', padding: '1rem' }}>
        <h2>Mon Application</h2>
        <Link to="/">Accueil</Link> | <Link to="/app_bar">Profil</Link>
      </nav>
      

      {/* 2. L'endroit où les pages vont s'afficher */}
      <main style={{ padding: '20px' }}>
        {/* <Outlet />  */}
      </main>
      
      <footer>© 2026 - Pied de page fixe</footer>
    </div>
  );
}

export default MainLayout;
