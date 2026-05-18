# Life Services

Aplicação web em nuvem para controle de clientes, estoque, orçamentos, ordens de serviço e financeiro básico.

## Projeto Integrado UNIFEOB

O Life Services foi desenvolvido como Projeto Integrado do módulo de **Computação em Nuvem** do curso de **Análise e Desenvolvimento de Sistemas** da UNIFEOB.

O objetivo acadêmico é demonstrar uma aplicação web funcional, preparada para hospedagem em ambiente de nuvem, utilizando banco de dados externo, autenticação, organização de código e práticas de qualidade de software.

## Problema atendido

Pequenas empresas e prestadores de serviço costumam controlar clientes, peças, orçamentos e atendimentos por papel, planilhas ou mensagens. Isso pode gerar perda de informações, dificuldade no controle de estoque e falta de histórico dos serviços.

O Life Services centraliza essas informações em uma aplicação web simples.

## Funcionalidades principais

- Login administrativo com autenticação JWT.
- Cadastro, listagem, edição e exclusão de clientes.
- Controle de estoque com entrada e saída.
- Cadastro de produtos e alerta de estoque baixo.
- Criação de orçamentos.
- Geração de PDF de orçamento.
- Registro de ordens de serviço.
- Controle financeiro básico de entradas e saídas.
- Dashboard com indicadores.
- Tema claro/escuro.

## Tecnologias utilizadas

- Node.js
- Express
- MongoDB / Mongoose
- HTML, CSS e JavaScript
- JWT para autenticação
- Render para deploy em nuvem

## Computação em nuvem

O projeto está preparado para deploy em plataforma PaaS, como Render, usando MongoDB como banco externo.

Variáveis esperadas:

```env
MONGO_URL=mongodb+srv://usuario:senha@cluster/banco
JWT_SECRET=segredo-da-aplicacao
PORT=3000
```

## Qualidade de software

Práticas aplicadas:

- Separação entre models, routes, controllers, services e middleware.
- Autenticação nas rotas protegidas.
- Validação de campos obrigatórios.
- Organização de documentação do projeto.
- Checagem de sintaxe com `node --check`.
- Script `npm test` para validar arquivos principais.
- Testes manuais dos fluxos essenciais.

## Como executar localmente

```bash
cd backend
npm install
node create-admin.js
npm start
```

Depois acesse:

```text
http://localhost:3000
```

Usuário de teste:

```text
Usuário: teste
Senha: 123
```

## Documentos de entrega

Os arquivos de apoio para a entrega acadêmica estão na pasta `docs`:

- `docs/REQUISITOS-UNIFEOB.md`: mapeamento dos requisitos do PDF.
- `docs/ROTEIRO-VIDEO.md`: roteiro para vídeo de 10 a 15 minutos.
- `docs/POSTER-CONTEUDO.md`: conteúdo base para o pôster em PDF.
- `docs/TERMO-CONSENTIMENTO.md`: modelo de consentimento da empresa beneficiada.
- `docs/RELATORIO-EXTENSAO.md`: base para relatório final de extensão.

## Entrega acadêmica

Itens que precisam ser preparados além do código:

- Link da aplicação em nuvem.
- Vídeo de apresentação entre 10 e 15 minutos.
- Pôster em PDF.
- Termo de consentimento assinado pela empresa beneficiada.
- Comprovante de inscrição e situação cadastral do CNPJ.
- Documento texto com análises das unidades de estudo.
- Relatório final de extensão na Intranet.

## ODS sugeridos

- ODS 8: Trabalho decente e crescimento econômico.
- ODS 9: Indústria, inovação e infraestrutura.

## Melhorias futuras

- Integração real com pagamentos.
- Envio de orçamento por WhatsApp/e-mail.
- Relatórios avançados.
- Painel mobile.
- Emissão fiscal.
