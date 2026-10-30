export type Contacto = {
  id: number;
  cliente_id: number;
  nombre: string;
  cargo: string;
  telefono?: string;
  email?: string;
  activo: boolean;
};

export const contactos: Contacto[] = [
  { id: 1, cliente_id: 1, nombre: 'Juan Pérez', cargo: 'Gerente', telefono: '987111111', email: 'juan.perez@andinos.com', activo: true },
  { id: 2, cliente_id: 1, nombre: 'María Gómez', cargo: 'Compras', telefono: '987222222', email: 'maria.gomez@andinos.com', activo: true },
  { id: 3, cliente_id: 2, nombre: 'Luis Torres', cargo: 'Propietario', telefono: '987333333', email: 'luis.torres@estampadosperu.com', activo: true },
  { id: 4, cliente_id: 2, nombre: 'Ana Ruiz', cargo: 'Ventas', telefono: undefined, email: undefined, activo: true },
  { id: 5, cliente_id: 3, nombre: 'Contacto 3', cargo: 'Director', telefono: '987555555', email: 'c3@client3.com', activo: true },
  { id: 6, cliente_id: 4, nombre: 'Contacto 4', cargo: 'Jefe', telefono: '987555556', email: 'c4@client4.com', activo: true },
  { id: 7, cliente_id: 5, nombre: 'Contacto 5', cargo: 'Gerente', telefono: '987555557', email: 'c5@client5.com', activo: true },
  { id: 8, cliente_id: 6, nombre: 'Contacto 6', cargo: 'Operario', telefono: '987555558', email: 'c6@client6.com', activo: true },
  { id: 9, cliente_id: 7, nombre: 'Contacto 7', cargo: 'Supervisor', telefono: '987555559', email: 'c7@client7.com', activo: true },
  { id: 10, cliente_id: 8, nombre: 'Contacto 8', cargo: 'Encargado', telefono: '987555560', email: 'c8@client8.com', activo: true },
  { id: 11, cliente_id: 9, nombre: 'Contacto 9', cargo: 'Coordinador', telefono: '987555561', email: 'c9@client9.com', activo: true },
  { id: 12, cliente_id: 10, nombre: 'Contacto 10', cargo: 'Administrador', telefono: '987555562', email: 'c10@client10.com', activo: true },
];
