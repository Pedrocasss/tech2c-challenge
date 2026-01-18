# Abordagem Técnica

## 1. Extração e Processamento de Dados

### Processo
1. **Leitura**: ExcelJS carrega ficheiro .xlsx
2. **Parsing**: Primeira linha = headers, restantes = dados
3. **Validação**: Verificar colunas obrigatórias
4. **Cálculo**: Agregação e processamento dos indicadores

### Indicadores Calculados

**Total CO₂ por Ano**
```javascript
// Agrupar por ano, somar emissões
yearlyEmissions[year] += emissions
```

**Consumo Médio**
```javascript
// Total consumo / Número de empresas
average = totalConsumption / companiesCount
```

**Top 5 Empresas**
```javascript
// Somar emissões por empresa, ordenar DESC, slice(0,5)
companies.sort((a,b) => b.emissions - a.emissions).slice(0,5)
```

### Error Handling
- Validação de tipo de ficheiro
- Try-catch em operações I/O
- Mensagens de erro claras

## 2. Tech Stack

### Backend: Node.js + Express

**Porquê?**
- Rápido para I/O (upload ficheiros)
- ExcelJS: biblioteca moderna sem vulnerabilidades
- Express: minimalista e direto
- JavaScript full-stack

**Bibliotecas:**
- `exceljs` - Processamento Excel
- `multer` - Upload ficheiros
- `express` - API REST
- `cors` - Cross-origin

### Frontend: React + Vite

**Porquê?**
- React: componentização, hooks, mercado
- Vite: build rápido, HMR instantâneo
- Chart.js: gráficos simples e eficazes
- Tailwind: desenvolvimento rápido, dark mode nativo

**Bibliotecas:**
- `react` - UI framework
- `vite` - Build tool
- `chart.js` + `react-chartjs-2` - Gráficos
- `tailwindcss` - Styling

### Docker

**Porquê?**
- Requisito do challenge (bonus)
- Setup em 1 comando
- Ambiente consistente
- Production-ready

**Config:**
- Node 20 Alpine (leve)
- Volumes para hot reload
- Network bridge