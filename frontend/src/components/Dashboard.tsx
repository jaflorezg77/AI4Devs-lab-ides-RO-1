import React, { useState } from 'react';
import AddCandidateForm from './AddCandidateForm';

const Dashboard: React.FC = () => {
  const [showForm, setShowForm] = useState(false);

  const handleShowForm = () => setShowForm(true);
  const handleHideForm = () => setShowForm(false);

  return (
    <div className="dashboard">
      {!showForm && (
        <>
          <h1>Dashboard del Reclutador</h1>
          <button onClick={handleShowForm}>Adicionar Candidato</button>
        </>
      )}
      {showForm && (
        <div style={{ marginTop: 20 }}>
          <AddCandidateForm />
          <button onClick={handleHideForm} style={{ marginTop: 10 }}>Cerrar Formulario</button>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 