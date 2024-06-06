// src/controllers/propertyController.ts
import { Request, Response } from 'express';
import { PropertyService } from '../servicesInterfaces/propertyService';
import { QueueService } from '../servicesInterfaces/queueService';
import { getErrorMessage } from '../utils/handleError';
// import { validateOrReject } from 'class-validator';
// import { plainToClass } from 'class-transformer';

export class PropertyController {
    constructor(private propertyService: PropertyService, private queueService: QueueService) {}
  
    public createProperty = async (req: Request, res: Response) => {
      try {
        // const propertyDto = plainToClass(PropertyDTO, req.body);
        // await validateOrReject(propertyDto);
  
        const property = await this.propertyService.createProperty(req.body); //propertyDto
        this.queueService.addJobToQueue(property.toJSON());
        res.status(201).json(property);
      } catch (error: any) {
        res.status(400).json({ message: 'Error creating property', error: getErrorMessage(error) });
      }
    };
  }
