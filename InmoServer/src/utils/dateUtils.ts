import { Op } from 'sequelize';

export async function checkDateOverlap(
  model: any, // This can be Reservation or PropertyAvailability
  propertyId: number,
  startDate: string,
  endDate: string,
): Promise<boolean> {
  const overlappingEntries = await model.findAll({
    where: {
      propertyId: propertyId,
      [Op.and]: [
        {
          startDate: {
            [Op.lte]: endDate, // Check if start date is before or on the requested end date
          },
        },
        {
          endDate: {
            [Op.gte]: startDate, // Check if end date is after or on the requested start date
          },
        },
      ],
    },
  });

  return overlappingEntries.length > 0;
}
