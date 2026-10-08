import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import GavelIcon from '@mui/icons-material/Gavel';
import ClearIcon from '@mui/icons-material/Clear';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import {
  INITIAL_VEHICLES,
  cadastrarVeiculo,
  excluirVeiculo,
  listarVeiculos,
} from '../services/veiculoService';

// ── Dados de Domínio ──────────────────────────────────────────────────────────
const TIPOS = ['Carro', 'SUV', 'Moto', 'Caminhão', 'Van', 'Pickup'];
const CORES = [
  'Branco', 'Preto', 'Prata', 'Cinza', 'Vermelho',
  'Azul', 'Verde', 'Amarelo', 'Marrom', 'Outra',
];
const MARCAS = [
  'Chevrolet', 'Fiat', 'Volkswagen', 'Ford', 'Toyota',
  'Honda', 'Hyundai', 'Renault', 'Jeep', 'BMW', 'Mercedes-Benz', 'Outra',
];

const EMPTY_FORM = {
  marca: '',
  modelo: '',
  ano: '',
  placa: '',
  cor: '',
  tipo: '',
  valorMinimo: '',
  descricao: '',
};

// ── Utilitários ───────────────────────────────────────────────────────────────
const formatCurrency = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

// ── Componente Principal ──────────────────────────────────────────────────────
export default function CadastroVeiculo({ onAddVehicle }) {
  const [vehicles, setVehicles] = useState(INITIAL_VEHICLES);
  const [isOnline, setIsOnline] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [deleteId, setDeleteId] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // ── Carregar veículos do microsserviço ───────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    listarVeiculos().then(({ data, isOnline }) => {
      if (mounted) {
        setVehicles(data);
        setIsOnline(isOnline);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  // ── Validação ──────────────────────────────────────────────────────────────
  const validate = () => {
    const newErrors = {};
    if (!form.marca) newErrors.marca = 'Campo obrigatório';
    if (!form.modelo.trim()) newErrors.modelo = 'Campo obrigatório';
    if (!form.ano || Number(form.ano) < 1900 || Number(form.ano) > new Date().getFullYear() + 1)
      newErrors.ano = 'Ano inválido';
    if (!form.placa.trim()) newErrors.placa = 'Campo obrigatório';
    if (!form.cor) newErrors.cor = 'Campo obrigatório';
    if (!form.tipo) newErrors.tipo = 'Campo obrigatório';
    if (!form.valorMinimo || Number(form.valorMinimo) <= 0)
      newErrors.valorMinimo = 'Informe um valor positivo';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Cadastrar Veículo ──────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const result = await cadastrarVeiculo(form);
    setVehicles((prev) => [...prev, result.data]);
    setIsOnline(result.isOnline);

    if (onAddVehicle) onAddVehicle(result.data);
    handleClear();
    setSnackbar({
      open: true,
      message: result.isOnline
        ? 'Veículo salvo no Microsserviço de Veículos (Spring Boot :8081)!'
        : 'Veículo cadastrado no estado local (Modo Demonstração Offline).',
      severity: result.isOnline ? 'success' : 'info',
    });
  };

  const handleClear = () => {
    setForm(EMPTY_FORM);
    setErrors({});
  };

  // ── Excluir Veículo ────────────────────────────────────────────────────────
  const handleDeleteRequest = (id) => {
    setDeleteId(id);
    setDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    await excluirVeiculo(deleteId);
    setVehicles((prev) => prev.filter((v) => v.id !== deleteId));
    setDialogOpen(false);
    setSnackbar({ open: true, message: 'Veículo removido do cadastro.', severity: 'info' });
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Cabeçalho */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <DirectionsCarIcon color="primary" sx={{ fontSize: 36 }} />
          <Typography variant="h4" fontWeight="bold" color="text.primary">
            Cadastro de Veículos
          </Typography>
        </Box>

        <Tooltip
          title={
            isOnline
              ? 'Conectado diretamente à API REST veiculos-service (:8081)'
              : 'Microsserviço offline — operando com dados mock locais'
          }
          arrow
        >
          <Chip
            icon={isOnline ? <CloudDoneIcon fontSize="small" /> : <CloudOffIcon fontSize="small" />}
            label={isOnline ? 'Microsserviço REST :8081 Online' : 'Modo Fallback Offline'}
            color={isOnline ? 'success' : 'default'}
            variant={isOnline ? 'filled' : 'outlined'}
            size="small"
            sx={{ fontWeight: 600 }}
          />
        </Tooltip>
      </Box>

      {/* ── Formulário ── */}
      <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        <Typography variant="h6" fontWeight={600} color="text.secondary" sx={{ mb: 3 }}>
          Novo Veículo
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={2.5}>
            {/* Marca */}
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth error={!!errors.marca}>
                <InputLabel>Marca *</InputLabel>
                <Select
                  value={form.marca}
                  label="Marca *"
                  onChange={(e) => setForm({ ...form, marca: e.target.value })}
                >
                  {MARCAS.map((m) => (
                    <MenuItem key={m} value={m}>{m}</MenuItem>
                  ))}
                </Select>
                {errors.marca && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                    {errors.marca}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            {/* Modelo */}
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Modelo *"
                value={form.modelo}
                onChange={(e) => setForm({ ...form, modelo: e.target.value })}
                error={!!errors.modelo}
                helperText={errors.modelo}
              />
            </Grid>

            {/* Ano */}
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Ano *"
                type="number"
                value={form.ano}
                onChange={(e) => setForm({ ...form, ano: e.target.value })}
                error={!!errors.ano}
                helperText={errors.ano}
                inputProps={{ min: 1900, max: new Date().getFullYear() + 1 }}
              />
            </Grid>

            {/* Placa */}
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Placa *"
                value={form.placa}
                onChange={(e) =>
                  setForm({ ...form, placa: e.target.value.toUpperCase() })
                }
                error={!!errors.placa}
                helperText={errors.placa}
                placeholder="ABC-1234"
              />
            </Grid>

            {/* Cor */}
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth error={!!errors.cor}>
                <InputLabel>Cor *</InputLabel>
                <Select
                  value={form.cor}
                  label="Cor *"
                  onChange={(e) => setForm({ ...form, cor: e.target.value })}
                >
                  {CORES.map((c) => (
                    <MenuItem key={c} value={c}>{c}</MenuItem>
                  ))}
                </Select>
                {errors.cor && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                    {errors.cor}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            {/* Tipo */}
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth error={!!errors.tipo}>
                <InputLabel>Tipo *</InputLabel>
                <Select
                  value={form.tipo}
                  label="Tipo *"
                  onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                >
                  {TIPOS.map((t) => (
                    <MenuItem key={t} value={t}>{t}</MenuItem>
                  ))}
                </Select>
                {errors.tipo && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                    {errors.tipo}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            {/* Valor Mínimo */}
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Valor Mínimo (R$) *"
                type="number"
                value={form.valorMinimo}
                onChange={(e) => setForm({ ...form, valorMinimo: e.target.value })}
                error={!!errors.valorMinimo}
                helperText={errors.valorMinimo}
                inputProps={{ min: 0, step: 1000 }}
              />
            </Grid>

            {/* Descrição */}
            <Grid item xs={12} sm={12} md={8}>
              <TextField
                fullWidth
                label="Descrição"
                multiline
                rows={2}
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              />
            </Grid>

            {/* Botões */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
                <Button
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  onClick={handleClear}
                >
                  Limpar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<AddIcon />}
                  color="primary"
                >
                  Cadastrar Veículo
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* ── Tabela de Veículos ── */}
      <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        {/* Cabeçalho da tabela */}
        <Box
          sx={{
            p: 2,
            bgcolor: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <GavelIcon sx={{ color: 'white' }} />
          <Typography variant="h6" color="white" fontWeight={600}>
            Veículos Cadastrados ({vehicles.length})
          </Typography>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Veículo</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Ano</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Placa</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Tipo</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Cor</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Valor Mínimo</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="center">
                  Ações
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {vehicles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.disabled' }}>
                    Nenhum veículo cadastrado ainda.
                  </TableCell>
                </TableRow>
              ) : (
                vehicles.map((v) => (
                  <TableRow key={v.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {v.marca} {v.modelo}
                      </Typography>
                      {v.descricao && (
                        <Typography variant="caption" color="text.secondary">
                          {v.descricao.length > 55
                            ? `${v.descricao.substring(0, 55)}…`
                            : v.descricao}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{v.ano}</TableCell>
                    <TableCell>
                      <Chip label={v.placa} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>{v.tipo}</TableCell>
                    <TableCell>{v.cor}</TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        color="success.dark"
                      >
                        {formatCurrency(v.valorMinimo)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        onClick={() => handleDeleteRequest(v.id)}
                        color="error"
                        size="small"
                        title="Remover veículo"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* ── Dialog de Confirmação ── */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>Deseja realmente remover este veículo do cadastro?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Remover
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Snackbar de Feedback ── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
