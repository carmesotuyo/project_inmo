export interface ReservationRequest {
    inquilino: {
      documento: string;
      nombre: string;
      apellido: string;
      email: string;
      telefono: string;
      direccion: string;
      nacionalidad: string;
      pais: string;
    };
    propertyId: number;
    adults: number;
    children: number;
    startDate: string;
    endDate: string;
  }