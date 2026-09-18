import { DataSource } from 'typeorm';

export const clearDatabase = async (dataSource: DataSource) => {
  const entities = dataSource.entityMetadatas;
  
  for (const entity of entities) {
    const repository = dataSource.getRepository(entity.name);
    // Ignore views or tables that shouldn't be cleared
    if (entity.tableType !== 'view') {
      await repository.query(`TRUNCATE TABLE "${entity.tableName}" CASCADE;`);
    }
  }
};
