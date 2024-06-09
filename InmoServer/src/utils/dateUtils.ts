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
      [Op.or]: [
        {
          startDate: {
            [Op.lte]: endDate,
          },
        },
        {
          endDate: {
            [Op.gte]: startDate,
          },
        },
        {
          [Op.and]: [
            {
              startDate: {
                [Op.lte]: startDate,
              },
            },
            {
              endDate: {
                [Op.gte]: endDate,
              },
            },
          ],
        },
      ],
    },
  });

  return overlappingEntries.length > 0;
}
