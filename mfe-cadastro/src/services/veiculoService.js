// Serviço de integração REST direta com o microsserviço de Veículos (:8081)
// Conexão direta MFE -> Microsserviço via REST API (com fallback offline para dados mock)
const API_BASE_URL = import.meta.env?.VITE_VEICULOS_API_URL || 'http://localhost:8081';
const API_URL = `${API_BASE_URL}/api/veiculos`;

export const INITIAL_VEHICLES = [
  {
    id: 1,
    marca: 'Chevrolet',
    modelo: 'Onix',
    ano: 2021,
    placa: 'ABC-1234',
    cor: 'Branco',
    tipo: 'Carro',
    valorMinimo: 45000,
    descricao: 'Veículo em ótimo estado, apenas um dono.',
  },
  {
    id: 2,
    marca: 'Toyota',
    modelo: 'Hilux',
    ano: 2020,
    placa: 'DEF-5678',
    cor: 'Prata',
    tipo: 'Pickup',
    valorMinimo: 180000,
    descricao: 'Caminhonete 4x4 com pouco uso.',
  },
  {
    id: 3,
    marca: 'Honda',
    modelo: 'CB 500',
    ano: 2022,
    placa: 'GHI-9012',
    cor: 'Preto',
    tipo: 'Moto',
    valorMinimo: 28000,
    descricao: 'Moto em excelente estado, sem sinistro.',
  },
];

async function request(url, options = {}) {
  try {
    const res = await fetch(url, options);
    if (res.ok) {
      return { success: true, res };
    }
    return { success: false, res };
  } catch (err) {
    return { success: false, error: err };
  }
}

export async function listarVeiculos() {
  const result = await request(API_URL);

  if (result.success) {
    try {
      const data = await result.res.json();
      return { data, isOnline: true };
    } catch {
      // Falha ao parsear JSON
    }
  }

  // Fallback para demonstração offline
  return { data: INITIAL_VEHICLES, isOnline: false };
}

export async function cadastrarVeiculo(veiculo) {
  const payload = {
    marca: veiculo.marca,
    modelo: veiculo.modelo,
    ano: Number(veiculo.ano),
    placa: veiculo.placa,
    cor: veiculo.cor,
    tipo: veiculo.tipo,
    valorMinimo: Number(veiculo.valorMinimo),
    descricao: veiculo.descricao || '',
  };

  const result = await request(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (result.success) {
    const data = await result.res.json();
    return { data, isOnline: true };
  }

  // Fallback offline
  const mockCreated = {
    ...veiculo,
    id: Date.now(),
    ano: Number(veiculo.ano),
    valorMinimo: Number(veiculo.valorMinimo),
  };
  return { data: mockCreated, isOnline: false };
}

export async function excluirVeiculo(id) {
  const result = await request(`${API_URL}/${id}`, {
    method: 'DELETE',
  });

  return { success: result.success };
}
