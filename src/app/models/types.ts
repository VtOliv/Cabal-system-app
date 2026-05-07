export interface CollectionItem {
  id: string;
  name: string;
  stockKey: string;
  required: number;
  owned: number;
}

export interface Reward {
  type: string;
  values: { [key: number]: number }; // Mapeia 30, 60, 100
}

export interface Collection {
  id: string;
  title: string;
  items: CollectionItem[];
  rewards: Reward[];
  open?: boolean;
}

export interface ActiveBonus {
  type: string;
  value: number;
  justUnlocked?: boolean;
}

export interface Character {
  id: string;
  nome: string;
  classe: string;
  meritoDourado: number;
  meritoPlatina: number | null;
  meritoDiamante: number | null;
  nivelAsa: number;
}