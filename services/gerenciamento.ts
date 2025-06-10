import api from './api';
import type { Crianca, Atividade, Diagnostico, Progresso, ProgressoResumo } from './types';

export const criancaService = {
  async listar() {
    const response = await api.get<Crianca[]>('/criancas');
    return response.data;
  },

  async buscarPorId(id: number) {
    const response = await api.get<Crianca>(`/criancas/${id}`);
    return response.data;
  },

  async criar(data: Omit<Crianca, 'id' | 'createdAt' | 'updatedAt'>) {
    const response = await api.post<Crianca>('/criancas', data);
    return response.data;
  },

  async atualizar(id: number, data: Partial<Crianca>) {
    const response = await api.put<Crianca>(`/criancas/${id}`, data);
    return response.data;
  },

  async excluir(id: number) {
    await api.delete(`/criancas/${id}`);
  }
};

export const atividadeService = {
  async listar() {
    const response = await api.get<Atividade[]>('/atividades');
    return response.data;
  },

  async buscarPorId(id: number) {
    const response = await api.get<Atividade>(`/atividades/${id}`);
    return response.data;
  },

  async criar(data: Omit<Atividade, 'id' | 'createdAt' | 'updatedAt'>) {
    const response = await api.post<Atividade>('/atividades', data);
    return response.data;
  },

  async atualizar(id: number, data: Partial<Atividade>) {
    const response = await api.put<Atividade>(`/atividades/${id}`, data);
    return response.data;
  },

  async excluir(id: number) {
    await api.delete(`/atividades/${id}`);
  }
};

export const diagnosticoService = {
  async listar() {
    const response = await api.get<Diagnostico[]>('/diagnosticos');
    return response.data;
  },

  async buscarPorId(id: number) {
    const response = await api.get<Diagnostico>(`/diagnosticos/${id}`);
    return response.data;
  },

  async criar(data: Omit<Diagnostico, 'id' | 'createdAt' | 'updatedAt'>) {
    const response = await api.post<Diagnostico>('/diagnosticos', data);
    return response.data;
  },

  async atualizar(id: number, data: Partial<Diagnostico>) {
    const response = await api.put<Diagnostico>(`/diagnosticos/${id}`, data);
    return response.data;
  },

  async excluir(id: number) {
    await api.delete(`/diagnosticos/${id}`);
  }
};

export const progressoService = {
  async listarPorCrianca(criancaId: number) {
    const response = await api.get<Progresso[]>(`/progresso/crianca/${criancaId}`);
    return response.data;
  },

  async listarPorAtividade(atividadeId: number) {
    const response = await api.get<Progresso[]>(`/progresso/atividade/${atividadeId}`);
    return response.data;
  },

  async buscarResumoCrianca(criancaId: number) {
    const response = await api.get<ProgressoResumo>(`/progresso/crianca/${criancaId}/resumo`);
    return response.data;
  },

  async registrar(data: Omit<Progresso, 'id' | 'createdAt' | 'updatedAt'>) {
    const response = await api.post<Progresso>('/progresso/registrar', data);
    return response.data;
  }
}; 