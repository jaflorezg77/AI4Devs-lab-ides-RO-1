import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AddCandidateForm from '../components/AddCandidateForm';

// Mock para window.fetch
beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ message: '¡Candidato añadido exitosamente!' }),
    })
  ) as jest.Mock;
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('AddCandidateForm', () => {
  it('renderiza todos los campos obligatorios', () => {
    render(<AddCandidateForm />);
    expect(screen.getByLabelText(/Nombre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Apellido/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Teléfono/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Dirección/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Educación/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Experiencia laboral/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Cargar CV/i)).toBeInTheDocument();
  });

  it('muestra errores si se intenta enviar vacío', async () => {
    render(<AddCandidateForm />);
    fireEvent.click(screen.getByRole('button', { name: /Añadir Candidato/i }));
    await waitFor(() => {
      expect(screen.getByText(/El nombre es obligatorio/i)).toBeInTheDocument();
      expect(screen.getByText(/El apellido es obligatorio/i)).toBeInTheDocument();
      expect(screen.getByText(/El correo es obligatorio/i)).toBeInTheDocument();
      expect(screen.getByText(/El teléfono es obligatorio/i)).toBeInTheDocument();
      expect(screen.getByText(/La dirección es obligatoria/i)).toBeInTheDocument();
      expect(screen.getByText(/La educación es obligatoria/i)).toBeInTheDocument();
      expect(screen.getByText(/La experiencia es obligatoria/i)).toBeInTheDocument();
      expect(screen.getByText(/El CV es obligatorio/i)).toBeInTheDocument();
    });
  });

  it('envía el formulario correctamente con datos válidos', async () => {
    render(<AddCandidateForm />);
    fireEvent.change(screen.getByLabelText(/Nombre/i), { target: { value: 'Juan' } });
    fireEvent.change(screen.getByLabelText(/Apellido/i), { target: { value: 'Pérez' } });
    fireEvent.change(screen.getByLabelText(/Correo electrónico/i), { target: { value: 'juan@example.com' } });
    fireEvent.change(screen.getByLabelText(/Teléfono/i), { target: { value: '+573001112233' } });
    fireEvent.change(screen.getByLabelText(/Dirección/i), { target: { value: 'Calle 123' } });
    fireEvent.change(screen.getByLabelText(/Educación/i), { target: { value: 'Ingeniería' } });
    fireEvent.change(screen.getByLabelText(/Experiencia laboral/i), { target: { value: '2 años en desarrollo' } });
    // Simular archivo
    const file = new File(['cv'], 'cv.pdf', { type: 'application/pdf' });
    const input = screen.getByLabelText(/Cargar CV/i);
    fireEvent.change(input, { target: { files: [file] } });
    fireEvent.click(screen.getByRole('button', { name: /Añadir Candidato/i }));
    await waitFor(() => {
      expect(screen.getByText(/¡Candidato añadido exitosamente!/i)).toBeInTheDocument();
    });
  });
}); 