# Roteiro do Vídeo de Apresentação

Duração sugerida: 10 a 15 minutos.

## 1. Abertura

Apresentar:

- Nome do projeto: Life Services
- Curso: Análise e Desenvolvimento de Sistemas
- Módulo: Computação em Nuvem
- Instituição: UNIFEOB
- Objetivo: demonstrar uma aplicação web funcional implantada em ambiente de nuvem.

Texto sugerido:

> O Life Services é uma aplicação web criada para auxiliar pequenas empresas e prestadores de serviço no controle de clientes, estoque, orçamentos, ordens de serviço e financeiro.

## 2. Problema identificado

Explicar que muitas pequenas empresas controlam atendimento, peças e orçamentos manualmente, usando papel, planilhas ou mensagens soltas.

Pontos:

- Perda de informações.
- Falta de controle de estoque.
- Dificuldade para gerar orçamentos.
- Ausência de histórico de atendimento.
- Dificuldade para acompanhar entradas e saídas financeiras.

## 3. Beneficiado pelo projeto

Apresentar a empresa ou prestador de serviço beneficiado.

Preencher:

- Nome da empresa:
- CNPJ:
- Segmento:
- Cidade/UF:
- Necessidade observada:

## 4. Ambiente em nuvem

Mostrar:

- Plataforma de deploy: Render.
- Banco de dados: MongoDB.
- Variáveis de ambiente:
  - `MONGO_URL`
  - `JWT_SECRET`
  - `PORT`
- Logs de execução da aplicação.

Texto sugerido:

> A aplicação foi preparada para execução em nuvem usando Node.js e Express no backend, MongoDB como banco de dados externo e variáveis de ambiente para separar informações sensíveis do código.

## 5. Demonstração da aplicação

Fluxo recomendado:

1. Acessar o sistema pelo navegador.
2. Fazer login com usuário administrativo.
3. Mostrar o dashboard simplificado.
4. Cadastrar um cliente.
5. Cadastrar um produto no estoque.
6. Registrar entrada de estoque.
7. Registrar saída de estoque.
8. Criar um orçamento.
9. Gerar PDF do orçamento.
10. Criar uma ordem de serviço.
11. Registrar uma entrada ou saída financeira.

## 6. Qualidade de software

Explicar:

- Separação entre rotas, modelos, controllers, services e middleware.
- Autenticação com JWT.
- Validação de campos obrigatórios.
- Testes/checagens com `npm test`.
- Organização do README e documentação de entrega.
- Uso de Git para versionamento.

## 7. Resultados obtidos

Resultados esperados:

- Sistema funcional para controle operacional.
- Melhor organização dos dados.
- Redução de controles manuais.
- Geração de orçamentos em PDF.
- Controle simples de estoque com entrada e saída.
- Demonstração prática de computação em nuvem.

## 8. Encerramento

Texto sugerido:

> Concluímos que o Life Services atende ao objetivo do Projeto Integrado ao oferecer uma aplicação web funcional, com banco de dados, autenticação, organização de código e estrutura pronta para hospedagem em nuvem. O projeto também contribui para uma necessidade prática de pequenas empresas, alinhando tecnologia, qualidade de software e atividade extensionista.
