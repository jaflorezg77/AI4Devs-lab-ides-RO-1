import { Request, Response, NextFunction } from 'express';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import type { StorageEngine } from 'multer';
import Joi from 'joi';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';

dotenv.config();
const prisma = new PrismaClient();

export const app = express();
export default prisma;

const port = 3010;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: 'http://localhost:3000' }));

// Configuración de almacenamiento para los CVs
const storage: StorageEngine = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});

const upload = multer({
  storage,
  fileFilter: (req: Request, file: Express.Multer.File, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos PDF o DOCX.'));
    }
  },
});

// Middleware para verificar JWT
const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado.' });
  }
  jwt.verify(token, process.env.JWT_SECRET || 'secret', (err: jwt.VerifyErrors | null, user: string | jwt.JwtPayload | undefined) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido.' });
    }
    (req as any).user = user;
    next();
  });
};

// Rate limiting para el endpoint de candidatos
const candidatesLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // máximo 10 peticiones por IP cada 15 minutos
  message: { error: 'Demasiadas solicitudes, intenta más tarde.' },
});

app.get('/', (req, res) => {
  res.send('Hola LTI!');
});

// Esquema de validación con Joi
const candidateSchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(50).required(),
  lastName: Joi.string().trim().min(2).max(50).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^\+?\d{7,15}$/).required(),
  address: Joi.string().trim().min(5).max(100).required(),
  education: Joi.string().trim().min(2).max(100).required(),
  experience: Joi.string().trim().min(2).max(500).required(),
});

// Endpoint para crear un candidato
app.post('/candidates', candidatesLimiter, authenticateToken, upload.single('cv'), async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, phone, address, education, experience } = req.body;
    // Validación con Joi
    const { error, value } = candidateSchema.validate({ firstName, lastName, email, phone, address, education, experience });
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'El CV es obligatorio y debe ser PDF o DOCX.' });
    }
    // Guardar candidato en la base de datos
    const candidate = await prisma.candidate.create({
      data: {
        ...value,
        cvUrl: `/uploads/${req.file.filename}`,
      },
    });
    res.status(201).json({ message: 'Candidato añadido exitosamente.', candidate });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'El correo electrónico ya está registrado.' });
    }
    res.status(500).json({ error: 'Error al añadir el candidato.' });
  }
});

// Endpoint de login
app.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son obligatorios.' });
  }
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }
    const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET || 'secret', { expiresIn: '2h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor.' });
  }
});

// Endpoint de registro
app.post('/register', async (req: Request, res: Response) => {
  const { email, password, name } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son obligatorios.' });
  }
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'El email ya está registrado.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
      },
    });
    res.status(201).json({ message: 'Usuario registrado exitosamente.' });
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor.' });
  }
});

// Servir archivos estáticos de la carpeta uploads
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.type('text/plain'); 
  res.status(500).send('Something broke!');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
