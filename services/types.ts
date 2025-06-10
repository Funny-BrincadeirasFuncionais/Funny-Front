export interface Crianca {
  id?: number;
  nome: string;
  idade: number;
  responsavelId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Responsavel {
  id?: number;
  nome: string;
  email: string;
  senha: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Diagnostico {
  id?: number;
  tipo: string;
  criancaId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Atividade {
  id?: number;
  titulo: string;
  descricao: string;
  categoria: string;
  nivelDificuldade: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Progresso {
  id?: number;
  criancaId: number;
  atividadeId: number;
  pontuacao: number;
  concluida: boolean;
  dataInicio: string;
  dataFim?: string;
  createdAt?: string;
  updatedAt?: string;
  crianca?: Crianca;
  atividade?: Atividade;
}

export interface ProgressoResumo {
  total: number;
  concluidas: number;
  mediaPontuacao: number;
} 