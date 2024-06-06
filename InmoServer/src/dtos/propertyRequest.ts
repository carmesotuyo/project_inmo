export interface PropertyRequest{
    name: string; 
    numberOfAdults: number;
    numberOfKids: number;
    numberOfDoubleBeds: number;
    numberOfSingleBeds: number;
    airConditioning: boolean;
    wifi: boolean;
    garage: boolean;
    houseOrApartment: Enumerator<number>;
    mtsToTheBeach: number;
    stateOrProvince: string;
    district: string;
    neighborhood: string;
    images: Array<string>; //TODO: chequear esto
}