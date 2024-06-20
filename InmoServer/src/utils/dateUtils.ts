import { Op } from 'sequelize';

export async function checkDateOverlap(
  model: any, // This can be Reservation or PropertyAvailability
  propertyId: number,
  startDate: string,
  endDate: string,
  excludeId?: number, // Optional parameter to exclude a specific ID
): Promise<boolean> {
  const whereClause: any = {
    status: {
      [Op.in]: ['Pending Approval', 'Approved', 'Paid'],
    },
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
  };

  // Add condition to exclude a specific ID if provided
  if (excludeId !== undefined) {
    whereClause.id = {
      [Op.ne]: excludeId,
    };
  }

  const overlappingEntries = await model.findAll({
    where: whereClause,
  });

  console.log('overlappingEntries: =======');
  console.log(overlappingEntries);

  return overlappingEntries.length > 0;
}
