const express = require('express');
const cors = require('cors');
const multer = require('multer');
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

const ensureUploadsDir = async () => {
  try {
    await fs.mkdir('uploads', { recursive: true });
  } catch (error) {
    console.error('Error creating uploads directory:', error);
  }
};

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Tech2C Backend a funcionar',
    timestamp: new Date().toISOString()
  });
});


app.get('/api/data', async (req, res) => {
  try {
    const filePath = path.join(__dirname, 'data', 'Dados_DGEG_Challenge.xlsx');
    const indicators = await processExcelFile(filePath);
    res.json(indicators);
  } catch (error) {
    console.error('Erro a carregar o default data', error);
    res.status(500).json({ 
      error: 'Erro a carregar data', 
      details: error.message 
    });
  }
});

app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum ficheiro foi enviado' });
    }
    const allowedExtensions = ['.xlsx', '.xls'];
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    
    if (!allowedExtensions.includes(fileExtension)) {
      await fs.unlink(req.file.path);
      return res.status(400).json({ 
        error: 'Tipo de ficheiro inválido. Apenas ficheiros .xlsx ou .xls são permitidos.' 
      });
    }

    if (req.file.size > 10 * 1024 * 1024) {
      await fs.unlink(req.file.path);
      return res.status(400).json({ 
        error: 'Ficheiro muito grande. Tamanho máximo: 10MB.' 
      });
    }

    const indicators = await processExcelFile(req.file.path);
    
    await fs.unlink(req.file.path);
    
    res.json(indicators);
  } catch (error) {
    console.error('Erro a processar ficheiro:', error);
    
    if (req.file && req.file.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Erro a deletar ficheiro:', unlinkError);
      }
    }
    
    res.status(500).json({ 
      error: 'Erro ao processar ficheiro', 
      details: error.message 
    });
  }
});

async function processExcelFile(filePath) {
  let workbook;
  
  try {
    workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
  } catch (error) {
    throw new Error('Ficheiro Excel corrompido ou inválido');
  }
  
  if (workbook.worksheets.length === 0) {
    throw new Error('Ficheiro Excel não contém nenhuma folha');
  }
  
  const worksheet = workbook.worksheets[0];
  
  if (worksheet.rowCount < 2) {
    throw new Error('Ficheiro Excel não contém dados suficientes (mínimo 2 linhas)');
  }
  
  const headers = [];
  const headerRow = worksheet.getRow(1);
  headerRow.eachCell((cell) => {
    headers.push(cell.value ? String(cell.value).trim() : '');
  });
  
  const requiredColumns = [
    'Empresa',
    'Ano',
    'Setor',
    'Consumo de Energia (MWh)',
    'Emissões de CO2 (toneladas)'
  ];
  
  const missingColumns = requiredColumns.filter(col => !headers.includes(col));
  if (missingColumns.length > 0) {
    throw new Error(`Colunas obrigatórias em falta: ${missingColumns.join(', ')}`);
  }
  
  const data = [];
  let validRows = 0;
  let skippedRows = 0;
  
  for (let i = 2; i <= worksheet.rowCount; i++) {
    const row = worksheet.getRow(i);
    const rowData = {};
    let isEmptyRow = true;
    
    row.eachCell((cell, colNumber) => {
      const header = headers[colNumber - 1];
      if (header) {
        rowData[header] = cell.value;
        if (cell.value !== null && cell.value !== undefined && cell.value !== '') {
          isEmptyRow = false;
        }
      }
    });
    
    if (isEmptyRow) {
      skippedRows++;
      continue;
    }
    
    if (!rowData['Empresa'] || !rowData['Ano']) {
      skippedRows++;
      continue;
    }
    const year = Number(rowData['Ano']);
    const consumption = Number(rowData['Consumo de Energia (MWh)']);
    const emissions = Number(rowData['Emissões de CO2 (toneladas)']);
    
    if (isNaN(year) || year < 1900 || year > 2100) {
      skippedRows++;
      continue;
    }
    
    if (isNaN(consumption) || consumption < 0) {
      skippedRows++;
      continue;
    }
    
    if (isNaN(emissions) || emissions < 0) {
      skippedRows++;
      continue;
    }
    
    data.push(rowData);
    validRows++;
  }
  
  if (validRows === 0) {
    throw new Error('Nenhuma linha de dados válida encontrada no ficheiro');
  }
  
  if (validRows < 3) {
    throw new Error('Ficheiro contém poucos dados válidos (mínimo 3 linhas)');
  }
  
  const indicators = {
    totalEmissionsByYear: calculateTotalEmissionsByYear(data),
    averageConsumption: calculateAverageConsumption(data),
    topCompanies: getTopCompanies(data, 5),
    sectorAnalysis: analyzeBySector(data),
    rawDataCount: validRows,
    skippedRows: skippedRows,
    years: [...new Set(data.map(row => row['Ano']))].sort()
  };
  
  return indicators;
}

function calculateTotalEmissionsByYear(data) {
  const yearlyEmissions = {};
  
  data.forEach(row => {
    const year = row['Ano'];
    const emissions = row['Emissões de CO2 (toneladas)'] || 0;
    
    if (!yearlyEmissions[year]) {
      yearlyEmissions[year] = 0;
    }
    yearlyEmissions[year] += emissions;
  });
  
  return Object.entries(yearlyEmissions)
    .map(([year, emissions]) => ({
      year: parseInt(year),
      emissions: Math.round(emissions * 100) / 100
    }))
    .sort((a, b) => a.year - b.year);
}

function calculateAverageConsumption(data) {
  const companyConsumption = {};
  
  data.forEach(row => {
    const company = row['Empresa'];
    const consumption = row['Consumo de Energia (MWh)'] || 0;
    
    if (!companyConsumption[company]) {
      companyConsumption[company] = { total: 0, count: 0 };
    }
    
    companyConsumption[company].total += consumption;
    companyConsumption[company].count += 1;
  });
  
  const totalConsumption = Object.values(companyConsumption)
    .reduce((sum, company) => sum + company.total, 0);
  const totalCompanies = Object.keys(companyConsumption).length;
  
  return {
    overallAverage: Math.round((totalConsumption / totalCompanies) * 100) / 100,
    byCompany: Object.entries(companyConsumption)
      .map(([company, data]) => ({
        company,
        average: Math.round((data.total / data.count) * 100) / 100
      }))
      .sort((a, b) => b.average - a.average)
  };
}

function getTopCompanies(data, limit = 5) {
  const companyEmissions = {};
  
  data.forEach(row => {
    const company = row['Empresa'];
    const emissions = row['Emissões de CO2 (toneladas)'] || 0;
    
    if (!companyEmissions[company]) {
      companyEmissions[company] = 0;
    }
    companyEmissions[company] += emissions;
  });
  
  return Object.entries(companyEmissions)
    .map(([company, emissions]) => ({
      company,
      totalEmissions: Math.round(emissions * 100) / 100
    }))
    .sort((a, b) => b.totalEmissions - a.totalEmissions)
    .slice(0, limit);
}

function analyzeBySector(data) {
  const sectorData = {};
  
  data.forEach(row => {
    const sector = row['Setor'];
    const emissions = row['Emissões de CO2 (toneladas)'] || 0;
    const consumption = row['Consumo de Energia (MWh)'] || 0;
    
    if (!sectorData[sector]) {
      sectorData[sector] = { 
        emissions: 0, 
        consumption: 0, 
        count: 0 
      };
    }
    
    sectorData[sector].emissions += emissions;
    sectorData[sector].consumption += consumption;
    sectorData[sector].count += 1;
  });
  
  return Object.entries(sectorData)
    .map(([sector, data]) => ({
      sector,
      totalEmissions: Math.round(data.emissions * 100) / 100,
      totalConsumption: Math.round(data.consumption * 100) / 100,
      companies: data.count
    }))
    .sort((a, b) => b.totalEmissions - a.totalEmissions);
}

ensureUploadsDir().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Backend server running on port ${PORT}`);
  });
});