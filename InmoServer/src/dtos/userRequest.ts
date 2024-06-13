export interface UserRequest {
    document: string;
    document_type: string;
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    phone_number: string;
    role: 'Administrador' | 'Operario' | 'Propietario' | 'Inquilino';
    auth0_id: string;
  }