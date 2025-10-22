export const seedingEntity = async (Entity, Data, uniqueKey = '') => {
  console.log(`======== SEEDING ${Entity.name} =========`);
  for (const item of Data) {
    const conditionObj = uniqueKey ? { [uniqueKey]: item[uniqueKey] } : { id: item.id };
    const existEntity = await Entity.findOneBy(conditionObj);
    if (existEntity) {
      console.log(`======== ${Entity.name} ID ${existEntity.id} is exist =========`);
      continue;
    }
    await Entity.save(item);
  }
};

export const getListPercentFromEntityArray = (entities: any[]): { id: number; percentage: string }[] => {
  // Generate random numbers for each item
  const randomNumbers = entities.map(() => Math.random());
  // Calculate the sum of the random numbers
  const sumOfRandomNumbers = randomNumbers.reduce((sum, num) => sum + num, 0);
  // Normalize the random numbers to get percentages
  const percentages = randomNumbers.map((num) => (num / sumOfRandomNumbers) * 100);
  // Pair each item with its corresponding percentage
  return entities.map((item, index) => ({
    id: item?.id,
    percentage: percentages[index].toFixed(2), // Round to 2 decimal places
  }));
};
