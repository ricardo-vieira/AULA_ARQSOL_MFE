// Serviço de integração REST direta com o microsserviço de Leilão (:8082)
// Conexão direta MFE -> Microsserviço via REST API (com fallback offline para dados mock)
const API_BASE_URL = import.meta.env?.VITE_LEILAO_API_URL || 'http://localhost:8082';
const API_URL = `${API_BASE_URL}/api/leiloes`;

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
    descricao: 'Veículo em ótimo estado, apenas um dono. Placa par, revisões em dia.',
    lanceAtual: 45000,
    totalLances: 0,
    bids: [],
    tempoRestante: 3600,
    status: 'ativo',
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
    descricao: 'Caminhonete 4x4 com pouco uso. Segundo dono, documentação ok.',
    lanceAtual: 185000,
    totalLances: 3,
    bids: [
      { bidder: 'Carlos M.', valor: 185000, time: '14:32' },
      { bidder: 'Ana S.', valor: 182000, time: '14:28' },
      { bidder: 'Pedro L.', valor: 180000, time: '14:20' },
    ],
    tempoRestante: 7200,
    status: 'ativo',
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
    descricao: 'Moto em excelente estado, sem sinistro. Pneus novos, revisão feita.',
    lanceAtual: 31500,
    totalLances: 5,
    bids: [
      { bidder: 'Lucas R.', valor: 31500, time: '15:10' },
      { bidder: 'Mariana T.', valor: 30000, time: '15:05' },
      { bidder: 'João B.', valor: 29500, time: '15:01' },
      { bidder: 'Fernanda C.', valor: 29000, time: '14:55' },
      { bidder: 'Roberto A.', valor: 28500, time: '14:48' },
    ],
    tempoRestante: 540,
    status: 'ativo',
  },
  {
    id: 4,
    marca: 'Volkswagen',
    modelo: 'Polo',
    ano: 2019,
    placa: 'JKL-3456',
    cor: 'Vermelho',
    tipo: 'Carro',
    valorMinimo: 55000,
    descricao: 'Hatch compacto com câmbio automático. Único dono.',
    lanceAtual: 60000,
    totalLances: 2,
    bids: [
      { bidder: 'Rafael O.', valor: 60000, time: '15:22' },
      { bidder: 'Juliana P.', valor: 57000, time: '15:15' },
    ],
    tempoRestante: 1800,
    status: 'ativo',
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

export async function listarLotes() {
  const result = await request(API_URL);

  if (result.success) {
    try {
      const data = await result.res.json();
      return { data, isOnline: true };
    } catch {
      // Falha ao parsear JSON
    }
  }

  // Fallback offline
  return { data: INITIAL_VEHICLES, isOnline: false };
}

export async function enviarLance(loteId, { bidder, valor }) {
  const result = await request(`${API_URL}/${loteId}/lances`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bidder, valor: Number(valor) }),
  });

  if (result.success) {
    const data = await result.res.json();
    return { data, isOnline: true };
  }

  return { success: false, isOnline: false };
}
