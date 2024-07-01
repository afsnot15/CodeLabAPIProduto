import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EMensagem } from '../../shared/enums/mensagem.enum';
import { handleFilter } from '../../shared/helpers/sql.helper';
import { IFindAllFilter } from '../../shared/interfaces/find-all-filter.interface';
import { IFindAllOrder } from '../../shared/interfaces/find-all-order.interface';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';
import { Produto } from './entities/produto.entity';

@Injectable()
export class ProdutoService {
  @InjectRepository(Produto)
  private repository: Repository<Produto>;

  async create(createProdutoDto: CreateProdutoDto): Promise<Produto> {
    const created = this.repository.create(new Produto(createProdutoDto));

    return await this.repository.save(created);
  }

  async findAll(
    page: number,
    size: number,
    order: IFindAllOrder,
    filter?: IFindAllFilter | IFindAllFilter[],
  ): Promise<Produto[]> {
    const where = handleFilter(filter);

    return await this.repository.find({
      order: { [order.column]: order.sort },
      where,
      skip: page * size,
      take: size,
    });
  }

  async findOne(id: number): Promise<Produto> {
    return await this.repository.findOne({ where: { id } });
  }

  async update(
    id: number,
    updateProdutoDto: UpdateProdutoDto,
  ): Promise<Produto> {
    if (id !== updateProdutoDto.id) {
      throw new HttpException(
        EMensagem.IDsDiferentes,
        HttpStatus.NOT_ACCEPTABLE,
      );
    }

    return await this.repository.save(new Produto(updateProdutoDto));
  }

  async unactivate(id: number): Promise<boolean> {
    const finded = await this.repository.findOne({ where: { id } });

    if (!finded) {
      throw new HttpException(
        EMensagem.ImpossivelAlterar,
        HttpStatus.NOT_ACCEPTABLE,
      );
    }

    finded.ativo = false;

    return (await this.repository.save(finded)).ativo;
  }
}
