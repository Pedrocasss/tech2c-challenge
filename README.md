# Tech2C - DGEG Dashboard

Dashboard para análise de emissões de CO₂ e consumo energético.

## Como Executar

### Pré-requisitos
- Docker e Docker Compose instalados

### Iniciar aplicação
```bash
# Clonar repositório
git clone <url>

# Iniciar containers
docker-compose up --build

# Aceder
Frontend: http://localhost:5173
Backend: http://localhost:3000
```

### Parar aplicação
```bash
docker-compose down
```

## Funcionalidades

- Upload de ficheiros Excel DGEG
- 3 indicadores: Total CO₂/ano, Consumo médio, Top 5 empresas
- Gráficos interativos
- Dark mode
- Responsivo

## Estrutura
```
├── backend/            # Node.js + Express API
├── frontend/           # React + Vite
├── test-data/          # Teste de ficheiros válidos
├── test-data-invalid/  # Teste de ficheiros inválidos
├── docker-compose.yml
└── README.md
```