import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { readFileSync } from 'fs';
import { Repository } from 'typeorm';
import { EnviarEmailDto } from '../../shared/dtos/enviar-email.dto';
import { EMensagem } from '../../shared/enums/mensagem.enum';
import { handleFilter } from '../../shared/helpers/sql.helper';
import { IFindAllFilter } from '../../shared/interfaces/find-all-filter.interface';
import { IFindAllOrder } from '../../shared/interfaces/find-all-order.interface';
import { ExportPdfService } from '../../shared/services/export-pdf.service';
import { monetaryFormat } from './../../shared/helpers/formatter.helper';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';
import { Produto } from './entities/produto.entity';

@Injectable()
export class ProdutoService {
  private readonly logger: Logger = new Logger(ProdutoService.name);

  @Inject('MAIL_SERVICE')
  private readonly mailService: ClientProxy;

  @InjectRepository(Produto)
  private repository: Repository<Produto>;

  @Inject(ExportPdfService)
  private exportPdfService: ExportPdfService;

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

  async exportPdf(
    idUsuario: number,
    order: IFindAllOrder,
    filter?: IFindAllFilter | IFindAllFilter[],
  ): Promise<boolean> {
    try {
      const where = handleFilter(filter);
      const size = 100;
      let page = 0;

      const reportData: Produto[] = [];

      let reportDataTemp: Produto[] = [];

      do {
        reportDataTemp = await this.repository.find({
          select: ['id', 'descricao', 'precoCusto', 'precoVenda', 'ativo'],
          order: { [order.column]: order.sort },
          where,
          skip: size * page,
          take: size,
        });

        reportData.push(...reportDataTemp);
        page++;
      } while (reportDataTemp.length === size);

      const filePath = await this.exportPdfService.export(
        'Listagem de Produtos',
        idUsuario,
        {
          columnStyles: {
            2: { halign: 'right' },
            3: { halign: 'right' },
            4: { halign: 'center' },
          },
          columns: [
            'Código',
            'Descrição',
            'Preço de Custo (R$)',
            'preço de Venda (R$)',
            'Ativo',
          ],
          body: reportData.map((produto) => [
            produto.id,
            produto.descricao,
            monetaryFormat(produto.precoCusto, 3),
            monetaryFormat(produto.precoVenda, 2),
            produto.ativo ? 'Sim' : 'Não',
          ]),
        },
      );

      const filename = filePath.split('/').pop();
      const filedata = readFileSync(filePath);
      const base64 = filedata.toString('base64');

      //TODO: obter dados do usuario
      const emailUsuario = 'afsnot15@gmail.com';
      const nomeUsuario = 'Afonso Gomes';

      const data: EnviarEmailDto = {
        subject: 'Exportação de Relatório',
        to: emailUsuario,
        template: 'exportacao-relatorio',
        context: {
          name: nomeUsuario,
        },
        attachments: [{ filename, base64 }],
      };

      this.mailService.emit('enviar-email', data);

      return true;
    } catch (error) {
      this.logger.error(`Erro ao gerar relatorio PDF: ${error.message}`);

      throw new HttpException(
        EMensagem.ErroExportarPDF,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
