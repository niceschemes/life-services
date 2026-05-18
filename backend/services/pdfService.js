const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const crypto = require('crypto');

function formatMoney(value) {
  return `R$ ${Number(value || 0).toFixed(2).replace('.', ',')}`;
}

function shortText(value, max = 110) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  return text.length > max ? `${text.slice(0, max - 3)}...` : text;
}

function validationCode(entity, id) {
  return crypto.createHash('sha256').update(`${entity}-${id}-${Date.now()}`).digest('hex').slice(0, 12).toUpperCase();
}

async function drawHeader(doc, company, titulo) {
  const primary = company?.branding?.primaryColor || '#6366f1';
  doc.rect(0, 0, doc.page.width, 90).fill(primary);

  doc.fillColor('#ffffff').fontSize(22).font('Helvetica-Bold');
  doc.text(company?.nome || 'Life Services', 50, 28, { width: 400 });
  doc.fontSize(10).font('Helvetica');
  doc.text(titulo, 50, 55);
  doc.text(new Date().toLocaleString('pt-BR'), 50, 70);

  doc.fillColor('#0f172a');
  doc.y = 110;
}

async function drawFooter(doc, codigoValidacao) {
  const y = doc.page.height - 60;
  doc.strokeColor('#e2e8f0').moveTo(50, y).lineTo(doc.page.width - 50, y).stroke();
  doc.fontSize(8).fillColor('#64748b');
  doc.text('Life Services Enterprise — Documento gerado eletronicamente.', 50, y + 10);
  doc.text(`Código de validação: ${codigoValidacao}`, 50, y + 24);
}

async function generateOrcamentoPdf(orcamento, company) {
  const doc = new PDFDocument({
    margin: 32,
    size: 'A4',
    autoFirstPage: true,
    bufferPages: false
  });
  const codigoVal = validationCode('ORC', orcamento._id);

  const buffers = [];
  doc.on('data', buffers.push.bind(buffers));

  const finished = new Promise((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(buffers)));
  });

  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  const left = 34;
  const right = pageWidth - 34;
  const width = right - left;
  const primary = company?.branding?.primaryColor || '#4f46e5';
  const today = new Date().toLocaleDateString('pt-BR');
  const validade = orcamento.validade
    ? new Date(orcamento.validade).toLocaleDateString('pt-BR')
    : 'A combinar';

  // Header compacto para manter tudo em uma página.
  doc.rect(0, 0, pageWidth, 86).fill(primary);
  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(20);
  doc.text(company?.nome || 'Life Services', left, 22, { width: 270 });
  doc.font('Helvetica').fontSize(8.5);
  doc.text(company?.email || 'Sistema de orçamentos e serviços', left, 48, { width: 270 });
  if (company?.whatsapp || company?.telefone) {
    doc.text(`Contato: ${company.whatsapp || company.telefone}`, left, 61, { width: 270 });
  }

  doc.font('Helvetica-Bold').fontSize(17);
  doc.text('ORÇAMENTO', 365, 22, { width: 185, align: 'right' });
  doc.font('Helvetica').fontSize(9);
  doc.text(orcamento.codigo || String(orcamento._id).slice(-8), 365, 46, { width: 185, align: 'right' });
  doc.text(`Emissão: ${today}`, 365, 60, { width: 185, align: 'right' });

  // Dados principais.
  let y = 108;
  doc.roundedRect(left, y, width, 78, 10).strokeColor('#e2e8f0').lineWidth(1).stroke();
  doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(10);
  doc.text('Dados do cliente', left + 14, y + 12);
  doc.font('Helvetica').fontSize(9).fillColor('#334155');
  doc.text(`Cliente: ${shortText(orcamento.clienteNome, 70)}`, left + 14, y + 30, { width: 260 });
  doc.text(`E-mail: ${shortText(orcamento.clienteEmail || 'Não informado', 58)}`, left + 14, y + 45, { width: 260 });
  doc.text(`Telefone: ${shortText(orcamento.clienteTelefone || 'Não informado', 50)}`, left + 14, y + 60, { width: 260 });

  doc.font('Helvetica-Bold').fillColor('#0f172a');
  doc.text('Resumo', left + 330, y + 12);
  doc.font('Helvetica').fontSize(9).fillColor('#334155');
  doc.text(`Status: ${String(orcamento.status || 'rascunho').toUpperCase()}`, left + 330, y + 30, { width: 185 });
  doc.text(`Validade: ${validade}`, left + 330, y + 45, { width: 185 });
  doc.text(`Versão: ${orcamento.versao || 1}`, left + 330, y + 60, { width: 185 });

  // Itens.
  y = 206;
  doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(11);
  doc.text('Itens do orçamento', left, y);
  y += 18;

  doc.rect(left, y, width, 22).fill('#f1f5f9');
  doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(8.5);
  doc.text('Descrição', left + 8, y + 7, { width: 260 });
  doc.text('Qtd', left + 318, y + 7, { width: 38, align: 'center' });
  doc.text('Valor unit.', left + 362, y + 7, { width: 72, align: 'right' });
  doc.text('Total', left + 438, y + 7, { width: 80, align: 'right' });

  y += 22;
  doc.font('Helvetica').fontSize(8.5);
  const itens = (orcamento.itens || []).slice(0, 10);
  itens.forEach((item, index) => {
    const qtd = Number(item.quantidade) || 1;
    const unit = Number(item.valorUnitario) || 0;
    const desc = Number(item.desconto) || 0;
    const linha = qtd * unit - desc;
    const rowH = 24;

    if (index % 2 === 0) {
      doc.rect(left, y, width, rowH).fill('#fbfdff');
    }

    doc.fillColor('#334155');
    doc.text(shortText(item.descricao, 72), left + 8, y + 7, { width: 260 });
    doc.text(String(qtd), left + 318, y + 7, { width: 38, align: 'center' });
    doc.text(formatMoney(unit), left + 362, y + 7, { width: 72, align: 'right' });
    doc.text(formatMoney(linha), left + 438, y + 7, { width: 80, align: 'right' });
    y += rowH;
  });

  if ((orcamento.itens || []).length > itens.length) {
    doc.font('Helvetica-Oblique').fontSize(8).fillColor('#64748b');
    doc.text(`+ ${(orcamento.itens || []).length - itens.length} item(ns) adicional(is) resumido(s) neste orçamento.`, left + 8, y + 6);
    y += 18;
  }

  // Totais.
  y += 12;
  const totalsX = right - 210;
  doc.roundedRect(totalsX, y, 210, 76, 10).fill('#f8fafc').strokeColor('#e2e8f0').stroke();
  doc.fillColor('#334155').font('Helvetica').fontSize(9);
  doc.text('Subtotal', totalsX + 12, y + 13);
  doc.text(formatMoney(orcamento.subtotal), totalsX + 105, y + 13, { width: 90, align: 'right' });
  doc.text('Descontos', totalsX + 12, y + 31);
  doc.text(formatMoney(orcamento.descontoTotal), totalsX + 105, y + 31, { width: 90, align: 'right' });
  doc.font('Helvetica-Bold').fontSize(14).fillColor(primary);
  doc.text('TOTAL', totalsX + 12, y + 51);
  doc.text(formatMoney(orcamento.total), totalsX + 105, y + 51, { width: 90, align: 'right' });

  // Observações e condições.
  const obsY = y;
  const obsWidth = width - 230;
  doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(10);
  doc.text('Observações', left, obsY);
  doc.fillColor('#475569').font('Helvetica').fontSize(8.5);
  doc.text(shortText(orcamento.observacoes || 'Sem observações adicionais.', 210), left, obsY + 16, {
    width: obsWidth,
    height: 34
  });
  doc.font('Helvetica-Bold').fillColor('#0f172a').fontSize(10);
  doc.text('Condições comerciais', left, obsY + 58);
  doc.font('Helvetica').fillColor('#475569').fontSize(8);
  doc.text(shortText(orcamento.condicoesComerciais, 220), left, obsY + 74, {
    width: obsWidth,
    height: 36
  });

  // Assinatura e validação.
  y = 610;
  doc.strokeColor('#cbd5e1').moveTo(left, y + 38).lineTo(left + 215, y + 38).stroke();
  doc.fillColor('#64748b').font('Helvetica').fontSize(8);
  doc.text('Assinatura / aceite do cliente', left, y + 44, { width: 215, align: 'center' });

  try {
    const qrUrl = await QRCode.toDataURL(`https://life.services/validar/${codigoVal}`);
    const qrBase64 = qrUrl.replace(/^data:image\/png;base64,/, '');
    doc.image(Buffer.from(qrBase64, 'base64'), right - 72, y, { width: 62 });
  } catch (_) {
    doc.rect(right - 72, y, 62, 62).strokeColor('#cbd5e1').stroke();
  }

  doc.font('Helvetica').fontSize(8).fillColor('#64748b');
  doc.text(`Código de validação: ${codigoVal}`, right - 240, y + 68, { width: 230, align: 'right' });

  const footerY = pageHeight - 54;
  doc.strokeColor('#e2e8f0').moveTo(left, footerY).lineTo(right, footerY).stroke();
  doc.fillColor('#64748b').fontSize(7.5);
  doc.text('Life Services — orçamento gerado eletronicamente em uma única página.', left, footerY + 12, {
    width,
    align: 'center'
  });

  doc.end();
  return finished;
}

async function generateOrdemPdf(ordem, company) {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  const codigoVal = validationCode('OS', ordem._id);
  const buffers = [];
  doc.on('data', buffers.push.bind(buffers));

  const finished = new Promise((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(buffers)));
  });

  await drawHeader(doc, company, `ORDEM DE SERVIÇO ${ordem.codigo || ''}`);

  doc.fontSize(11).fillColor('#334155').font('Helvetica');
  doc.text(`Cliente: ${ordem.cliente}`);
  doc.text(`Status: ${ordem.status}`);
  doc.text(`Prioridade: ${ordem.prioridade || 'Media'}`);
  doc.text(`Valor: ${formatMoney(ordem.valor)}`);
  doc.moveDown();
  doc.text('Descrição:', { underline: true });
  doc.text(ordem.descricao || '', { width: 495 });

  if (ordem.assinaturas?.os) {
    doc.moveDown();
    doc.text('Assinatura digital registrada no sistema.', { width: 495 });
  }

  await drawFooter(doc, codigoVal);
  doc.end();
  return finished;
}

module.exports = {
  generateOrcamentoPdf,
  generateOrdemPdf,
  validationCode
};
