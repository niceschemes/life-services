const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const crypto = require('crypto');

function formatMoney(value) {
  return `R$ ${Number(value || 0).toFixed(2).replace('.', ',')}`;
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
  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  const codigoVal = validationCode('ORC', orcamento._id);

  const buffers = [];
  doc.on('data', buffers.push.bind(buffers));

  const finished = new Promise((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(buffers)));
  });

  await drawHeader(doc, company, `ORÇAMENTO ${orcamento.codigo} · v${orcamento.versao || 1}`);

  doc.fontSize(11).fillColor('#334155');
  doc.text(`Cliente: ${orcamento.clienteNome}`, 50);
  if (orcamento.clienteEmail) doc.text(`E-mail: ${orcamento.clienteEmail}`);
  if (orcamento.clienteTelefone) doc.text(`Telefone: ${orcamento.clienteTelefone}`);
  doc.text(`Status: ${String(orcamento.status).toUpperCase()}`);
  if (orcamento.validade) {
    doc.text(`Validade: ${new Date(orcamento.validade).toLocaleDateString('pt-BR')}`);
  }
  doc.moveDown();

  const tableTop = doc.y + 10;
  doc.rect(50, tableTop, 495, 22).fill('#f1f5f9');
  doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(9);
  doc.text('Descrição', 55, tableTop + 6);
  doc.text('Qtd', 320, tableTop + 6);
  doc.text('Unit.', 370, tableTop + 6);
  doc.text('Total', 470, tableTop + 6, { width: 70, align: 'right' });

  let y = tableTop + 28;
  doc.font('Helvetica').fontSize(9);
  (orcamento.itens || []).forEach((item) => {
    const qtd = Number(item.quantidade) || 1;
    const unit = Number(item.valorUnitario) || 0;
    const desc = Number(item.desconto) || 0;
    const linha = qtd * unit - desc;
    doc.fillColor('#334155').text(item.descricao, 55, y, { width: 250 });
    doc.text(String(qtd), 320, y);
    doc.text(formatMoney(unit), 360, y);
    doc.text(formatMoney(linha), 470, y, { width: 70, align: 'right' });
    y += 20;
  });

  doc.moveDown(2);
  y = Math.max(y + 20, doc.y);
  doc.font('Helvetica-Bold').fontSize(11);
  doc.text(`Subtotal: ${formatMoney(orcamento.subtotal)}`, 350, y, { align: 'right', width: 195 });
  doc.text(`Descontos: ${formatMoney(orcamento.descontoTotal)}`, 350, y + 16, { align: 'right', width: 195 });
  doc.fontSize(14).fillColor('#6366f1');
  doc.text(`TOTAL: ${formatMoney(orcamento.total)}`, 350, y + 36, { align: 'right', width: 195 });

  if (orcamento.observacoes) {
    doc.moveDown(3).fontSize(9).fillColor('#475569').font('Helvetica');
    doc.text('Observações:', 50);
    doc.text(orcamento.observacoes, 50, doc.y, { width: 495 });
  }

  if (orcamento.condicoesComerciais) {
    doc.moveDown().fontSize(8).text(orcamento.condicoesComerciais, 50, doc.y, { width: 495 });
  }

  try {
    const qrUrl = await QRCode.toDataURL(`https://life.services/validar/${codigoVal}`);
    const qrBase64 = qrUrl.replace(/^data:image\/png;base64,/, '');
    doc.image(Buffer.from(qrBase64, 'base64'), 50, doc.page.height - 140, { width: 70 });
  } catch (_) { /* QR opcional */ }

  await drawFooter(doc, codigoVal);
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
