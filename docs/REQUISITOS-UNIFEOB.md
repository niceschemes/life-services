# Requisitos do Projeto Integrado UNIFEOB

Este documento resume o que o PDF do Projeto Integrado solicita e como o projeto **Life Services** atende cada ponto.

## Contexto

- Instituição: UNIFEOB
- Curso: Análise e Desenvolvimento de Sistemas
- Módulo: Computação em Nuvem
- Período: 2º trimestre letivo de 2026
- Projeto: Life Services
- Objetivo técnico: criar uma aplicação web funcional hospedada em ambiente de nuvem.

## Requisitos identificados no PDF

| Requisito | Como o Life Services atende |
| --- | --- |
| Aplicação web funcional | Sistema web com login, clientes, estoque, orçamentos, ordens e financeiro. |
| Hospedagem em nuvem | Projeto preparado para deploy no Render usando variáveis de ambiente. |
| Banco de dados externo | MongoDB/Mongoose, com suporte a `MONGO_URL`. |
| Autenticação e permissões | Login JWT, usuário administrativo e estrutura de papéis. |
| Qualidade de software | Organização em models, routes, controllers, services, middleware e validação por `npm test`. |
| Testes ou validações | Script `npm test` com checagem de sintaxe das rotas principais. |
| Monitoramento/execução | Logs do Node.js e painel da plataforma de hospedagem. |
| Projeto extensionista | Aplicação voltada a pequena empresa/prestador de serviço beneficiado. |
| Vídeo de apresentação | Roteiro disponível em `docs/ROTEIRO-VIDEO.md`. |
| Pôster em PDF | Conteúdo-base disponível em `docs/POSTER-CONTEUDO.md`. |
| Consentimento da empresa | Modelo disponível em `docs/TERMO-CONSENTIMENTO.md`. |
| CNPJ ativo | Deve ser anexado o comprovante de inscrição e situação cadastral da empresa beneficiada. |
| Relatório de extensão | Conteúdo-base disponível em `docs/RELATORIO-EXTENSAO.md`. |
| ODS | Sugestão: ODS 8 - Trabalho decente e crescimento econômico; ODS 9 - Indústria, inovação e infraestrutura. |

## Escopo funcional final do app

Para manter o sistema claro e apresentável, a interface principal foi simplificada para:

- Dashboard
- Clientes
- Estoque com entrada e saída
- Orçamentos
- Ordens de serviço
- Financeiro básico

Módulos avançados foram mantidos no código, mas retirados da navegação principal para evitar excesso de complexidade na apresentação.

## Checklist de entrega

- [ ] Aplicação web rodando localmente e/ou em nuvem.
- [ ] Link do deploy em nuvem.
- [ ] Banco MongoDB configurado.
- [ ] Vídeo de 10 a 15 minutos.
- [ ] Pôster em PDF.
- [ ] Termo de consentimento assinado pela empresa beneficiada.
- [ ] Comprovante de inscrição e situação cadastral do CNPJ.
- [ ] Documento texto com análises das unidades de estudo.
- [ ] Relatório final de extensão na Intranet.
- [ ] Progressão acima de 75% nas unidades do AVA.

## Como demonstrar no vídeo

1. Mostrar o problema: controle manual de serviços, estoque e orçamentos.
2. Mostrar o deploy em nuvem e as variáveis de ambiente.
3. Fazer login no Life Services.
4. Cadastrar cliente.
5. Cadastrar produto e demonstrar entrada/saída de estoque.
6. Criar orçamento e gerar PDF.
7. Criar ordem de serviço.
8. Registrar lançamento financeiro.
9. Explicar qualidade: organização do código, autenticação, validações e testes.
10. Concluir com resultados e benefícios para a empresa.
