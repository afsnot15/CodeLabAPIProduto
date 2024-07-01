# CodeLabAPITemplate

Este é um template para criação de uma API do CodeLab. Utilize este template para criar sua API NestJSS dentro
de um Docker container.

Antes de iniciar o projeto a partir do template, verifique os TODO's e substitua pelos valores corretos

## Development Start

```bash
docker compose up --build
```

## Excecução de testes

- Atenção: "attach" ao container para executar os testes.
- Caso não queira o coverage, remova o cov

## Unit

```bash
npm run test:cov
```

## E2E

```bash
npm run test:e2e:cov
```
