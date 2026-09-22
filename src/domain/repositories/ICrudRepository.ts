export interface ICrudRepository<T, Filters> {
  create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
  findById(id: string, userId: string): Promise<T | null>;
  findAll(userId: string, skip: number, take: number, filters?: Filters): Promise<T[]>;
  update(
    id: string,
    userId: string,
    data: Partial<Omit<T, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>,
  ): Promise<T | null>;
  delete(id: string, userId: string): Promise<boolean>;
  count(userId: string, filters?: Filters): Promise<number>;
}
