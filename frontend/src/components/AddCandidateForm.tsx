import React, { useState } from 'react';

interface CandidateForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  education: string;
  experience: string;
  cv: File | null;
}

const initialForm: CandidateForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  education: '',
  experience: '',
  cv: null,
};

const AddCandidateForm: React.FC = () => {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [success, setSuccess] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.firstName.trim()) newErrors.firstName = 'El nombre es obligatorio.';
    if (!form.lastName.trim()) newErrors.lastName = 'El apellido es obligatorio.';
    if (!form.email.trim()) newErrors.email = 'El correo es obligatorio.';
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) newErrors.email = 'Correo inválido.';
    if (!form.phone.trim()) newErrors.phone = 'El teléfono es obligatorio.';
    else if (!/^\+?\d{7,15}$/.test(form.phone)) newErrors.phone = 'Teléfono inválido.';
    if (!form.address.trim()) newErrors.address = 'La dirección es obligatoria.';
    if (!form.education.trim()) newErrors.education = 'La educación es obligatoria.';
    if (!form.experience.trim()) newErrors.experience = 'La experiencia es obligatoria.';
    if (!form.cv) newErrors.cv = 'El CV es obligatorio.';
    else if (!['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'].includes(form.cv.type)) {
      newErrors.cv = 'El CV debe ser PDF o DOCX.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setForm({ ...form, cv: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setSubmitError('');
    if (!validate()) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('firstName', form.firstName);
      formData.append('lastName', form.lastName);
      formData.append('email', form.email);
      formData.append('phone', form.phone);
      formData.append('address', form.address);
      formData.append('education', form.education);
      formData.append('experience', form.experience);
      if (form.cv) {
        formData.append('cv', form.cv);
      }
      const response = await fetch('http://localhost:3010/candidates', {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`
        },
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess(data.message || '¡Candidato añadido exitosamente!');
        setForm(initialForm);
      } else {
        setSubmitError(data.error || 'Ocurrió un error al añadir el candidato.');
      }
    } catch (err) {
      setSubmitError('Ocurrió un error al añadir el candidato. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="add-candidate-form grid-form" onSubmit={handleSubmit} noValidate>
      <h2>Añadir Nuevo Candidato</h2>
      <div className="form-grid">
        <div>
          <label>Nombre *</label>
          <input name="firstName" value={form.firstName} onChange={handleChange} />
          {errors.firstName && <span className="error">{errors.firstName}</span>}
        </div>
        <div>
          <label>Apellido *</label>
          <input name="lastName" value={form.lastName} onChange={handleChange} />
          {errors.lastName && <span className="error">{errors.lastName}</span>}
        </div>
        <div>
          <label>Correo electrónico *</label>
          <input name="email" value={form.email} onChange={handleChange} type="email" />
          {errors.email && <span className="error">{errors.email}</span>}
        </div>
        <div>
          <label>Teléfono *</label>
          <input name="phone" value={form.phone} onChange={handleChange} type="tel" />
          {errors.phone && <span className="error">{errors.phone}</span>}
        </div>
        <div>
          <label>Dirección *</label>
          <input name="address" value={form.address} onChange={handleChange} />
          {errors.address && <span className="error">{errors.address}</span>}
        </div>
        <div>
          <label>Educación *</label>
          <input name="education" value={form.education} onChange={handleChange} />
          {errors.education && <span className="error">{errors.education}</span>}
        </div>
      </div>
      <div>
        <label>Experiencia laboral *</label>
        <textarea name="experience" value={form.experience} onChange={handleChange} rows={3} />
        {errors.experience && <span className="error">{errors.experience}</span>}
      </div>
      <div>
        <label>Cargar CV (PDF o DOCX) *</label>
        <input name="cv" type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={handleFileChange} />
        {errors.cv && <span className="error">{errors.cv}</span>}
      </div>
      <button type="submit" disabled={loading}>{loading ? 'Guardando...' : 'Añadir Candidato'}</button>
      {success && <div className="success">{success}</div>}
      {submitError && <div className="error">{submitError}</div>}
    </form>
  );
};

export default AddCandidateForm; 