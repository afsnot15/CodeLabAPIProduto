import { fakerPT_BR as faker } from '@faker-js/faker';
import { define } from 'typeorm-seeding';
import { CreateProdutoDto } from '../core/produto/dto/create-produto.dto';
import { Produto } from './../core/produto/entities/produto.entity';

define(Produto, () => {
  const produto = new CreateProdutoDto();

  const precoCusto = faker.commerce.price({ min: 1, max: 99, dec: 2 });
  const precoVenda = (Number(precoCusto) * 1.3).toFixed(2);

  produto.descricao = faker.commerce.productName();
  produto.precoCusto = Number(precoCusto);
  produto.precoVenda = Number(precoVenda);
  produto.ativo = true;
  produto.codigoBarras = [faker.commerce.isbn(13).replace(/-/g, '')];

  return new Produto(produto);
});
