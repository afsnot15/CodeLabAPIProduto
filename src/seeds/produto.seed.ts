import { Factory, Seeder } from 'typeorm-seeding';
import { Produto } from '../core/produto/entities/produto.entity';

export class ProdutoSeed implements Seeder {
  public async run(factory: Factory): Promise<void> {
    await factory(Produto)().createMany(10);
  }
}
