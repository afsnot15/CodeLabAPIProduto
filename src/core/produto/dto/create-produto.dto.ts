import { Type } from 'class-transformer';
import { IsArray, IsBase64, IsNotEmpty, MaxLength } from 'class-validator';
import { EMensagem } from '../../../shared/enums/mensagem.enum';

export class CreateProdutoDto {
  @IsNotEmpty({ message: `Descricao ${EMensagem.NaoPodeSerVazio}` })
  @MaxLength(60, { message: `Descricao ${EMensagem.MaisCaracteresPermitido}` })
  descricao: string;

  @IsNotEmpty({ message: `Descricao ${EMensagem.NaoPodeSerVazio}` })
  precoCusto: number;

  @IsNotEmpty({ message: `Descricao ${EMensagem.NaoPodeSerVazio}` })
  precoVenda: number;

  @IsBase64()
  imagem: string;

  @IsNotEmpty({ message: `Descricao ${EMensagem.NaoPodeSerVazio}` })
  ativo: boolean;

  @IsArray({ message: `Codigo Barras ${EMensagem.NaoValido}` })
  @Type(() => String)
  codigoBarras: string[];
}
