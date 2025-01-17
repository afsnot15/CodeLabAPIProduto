import { Injectable } from '@nestjs/common';
import jsPDF from 'jspdf';
import autoTable, { UserOptions } from 'jspdf-autotable';

@Injectable()
export class ExportPdfService {
  private readonly exportPath = 'tmp/export';

  async export(
    titulo: string,
    idUsuario: number,
    data: UserOptions,
  ): Promise<string> {
    const dataHora = new Date();
    const dataHoraFormatada = dataHora.toLocaleString('pt-BR');
    const timestamp = dataHora.getTime();
    const fileName = titulo.replace(/ /g, '_').toLowerCase();
    const filePath = `${this.exportPath}/${fileName}-${idUsuario}-${timestamp}.pdf`;

    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.text(titulo, 15, 10, { align: 'left' });
    doc.text(`Data/Hora: ${dataHoraFormatada}`, 195, 10, {
      align: 'right',
    });

    Object.assign(data, {
      margin: { top: 15 },
      headStyles: { fillColor: '#e86800' },
    });

    autoTable(doc, data);

    doc.close();

    await doc.save(filePath, { returnPromise: true });

    return filePath;
  }
}
