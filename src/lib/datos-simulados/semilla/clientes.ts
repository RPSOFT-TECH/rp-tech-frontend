import { hoyLima, sumarMeses } from '../fecha';
import type { Cliente, Contacto, Equipo, Sede } from '../types';
import { CAT, ID } from './referencias';

export function sembrarClientes() {
  const hoy = hoyLima();
  const hace8 = sumarMeses(hoy, -8);
  const hace20 = sumarMeses(hoy, -20);
  const hace3 = sumarMeses(hoy, -3);

  const clientes: Cliente[] = [
    cliente(ID.cliAndinos, ID.empRp, 'TEXTILES ANDINOS S.A.C.', '20123456789', '987654321', 'contacto@andinos.com', true, ID.pCoord),
    cliente(ID.cliEstampados, ID.empRp, 'ESTAMPADOS PERÚ S.R.L.', '20123456790', '987654322', 'info@estampadosperu.com', true, ID.pCoord),
    cliente(ID.cliSur, ID.empRp, 'CONFECCIONES DEL SUR S.A.C.', null, '987654323', 'c3@example.com', false, null),
    cliente(ID.cliGrafica, ID.empRp, 'GRAFICA Y MODA E.I.R.L.', null, '987654324', 'c4@example.com', false, null),
    cliente(ID.cliOtra, ID.empOtra, 'TEXTIL AREQUIPA S.A.C.', '20456789012', '954111222', 'hola@arequipa.test', true, ID.pCoordOtra),
  ];

  const sedes: Sede[] = [
    sede(ID.sedeAte, ID.cliAndinos, 'Planta Principal Ate', 'Av. Los Frutales 450', 'Ate', 'Frente al óvalo', true),
    sede(ID.sedeVictoria, ID.cliAndinos, 'Taller La Victoria', 'Jr. Gamarra 1240', 'La Victoria', 'Galería Central Piso 2', false),
    sede(ID.sedeEstampados, ID.cliEstampados, 'Planta Estampados', 'Av. Argentina 880', 'Callao', null, true),
    sede(ID.sedeSur, ID.cliSur, 'Taller Sur', 'Av. Los Héroes 210', 'San Juan de Miraflores', null, true),
    sede(ID.sedeGrafica, ID.cliGrafica, 'Local Gráfica', 'Jr. Huánuco 55', 'Cercado de Lima', null, true),
    sede(ID.sedeOtra, ID.cliOtra, 'Planta Arequipa', 'Av. Ejército 400', 'Cayma', null, true),
  ];

  const contactos: Contacto[] = [
    contacto(ID.conJuan, ID.cliAndinos, 'Juan Pérez', 'Gerente', '987111111', 'juan.perez@andinos.com'),
    contacto(ID.conMaria, ID.cliAndinos, 'María Gómez', 'Compras', '987222222', 'maria.gomez@andinos.com'),
    contacto(ID.conLuis, ID.cliEstampados, 'Luis Torres', 'Propietario', '987333333', 'luis.torres@estampadosperu.com'),
    contacto(ID.conSur, ID.cliSur, 'Rosa Quispe', 'Jefa de planta', null, 'rosa@sursac.com'),
    contacto(ID.conGrafica, ID.cliGrafica, 'Pedro Díaz', 'Administrador', '987555556', null),
    contacto(ID.conOtra, ID.cliOtra, 'Lucía Ramos', 'Coordinadora', '954333444', 'lucia@arequipa.test'),
  ];

  const equipos: Equipo[] = [
    equipo(ID.eqSub, ID.cliAndinos, ID.sedeAte, CAT.lineaSub, 'Texart RT-640', 'SN-TEX-SUB-01', CAT.cabezalI3200, 4, hace8),
    equipo(ID.eqDtf, ID.cliEstampados, ID.sedeEstampados, CAT.lineaDtf, 'DTF Pro 60', 'SN-DTF-02', CAT.cabezalOtro, 2, hace20),
    equipo(ID.eqSur, ID.cliSur, ID.sedeSur, CAT.lineaSub, 'Subli 180', 'SN-SUR-03', CAT.cabezalI3200, 2, hace3),
    equipo(ID.eqGrafica, ID.cliGrafica, ID.sedeGrafica, CAT.lineaDtf, 'DTF Mini', 'SN-GRA-04', CAT.cabezalOtro, 1, hace20),
    equipo(ID.eqOtra, ID.cliOtra, ID.sedeOtra, CAT.lineaSubOtra, 'Subli Sur', 'SN-AQP-01', CAT.cabezalOtroOtra, 2, hace8),
  ];

  return { clientes, sedes, contactos, equipos };
}

function cliente(
  id: string,
  empresa_id: string,
  razon_social: string,
  ruc: string | null,
  telefono: string,
  email: string,
  soporte_vigente: boolean,
  verificado_por: string | null,
): Cliente {
  return {
    id,
    empresa_id,
    razon_social,
    ruc,
    telefono,
    email,
    soporte_vigente,
    soporte_verificado_en: soporte_vigente ? `${hoyLima()}T09:00:00-05:00` : null,
    soporte_verificado_por: soporte_vigente ? verificado_por : null,
    activo: true,
  };
}

function sede(
  id: string,
  cliente_id: string,
  nombre: string,
  direccion: string,
  distrito: string,
  referencia: string | null,
  principal: boolean,
): Sede {
  return { id, cliente_id, nombre, direccion, distrito, referencia, principal, activo: true };
}

function contacto(
  id: string,
  cliente_id: string,
  nombre: string,
  cargo: string,
  telefono: string | null,
  email: string | null,
): Contacto {
  return { id, cliente_id, nombre, cargo, telefono, email, activo: true };
}

function equipo(
  id: string,
  cliente_id: string,
  sede_id: string,
  linea_id: string,
  modelo: string,
  numero_serie: string,
  cabezal_modelo_id: string,
  cabezal_cantidad: 1 | 2 | 4,
  fecha_instalacion: string,
): Equipo {
  return {
    id,
    cliente_id,
    sede_id,
    linea_id,
    modelo,
    numero_serie,
    cabezal_modelo_id,
    cabezal_cantidad,
    fecha_instalacion,
    activo: true,
  };
}
