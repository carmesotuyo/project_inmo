export interface PropertyRequest {
    name: string;
    numberOfAdults: number;
    numberOfKids: number;
    numberOfDoubleBeds: number;
    numberOfSingleBeds: number;
    airConditioning: boolean;
    wifi: boolean;
    garage: boolean;
    houseOrApartment: '1' | '2';
    mtsToTheBeach: number;
    countryId: string;
    stateOrProvince: string;
    district: string;
    neighborhood: string;
    images: string[]; // Asumiendo que las imágenes son una matriz de URLs
  }