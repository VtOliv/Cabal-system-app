import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../service/api-service';
import { Collection, CollectionItem, ActiveBonus } from '../../models/types';

@Component({
  selector: 'app-colecoes',
  templateUrl: './colecoes.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class ColecoesComponent implements OnInit {
  private apiService = inject(ApiService);

  // Propriedades usadas no HTML
  collections: Collection[] = [];
  activeBonuses: ActiveBonus[] = [];
  drawerOpen = false;
  
  // Controle de estoque
  stock: { [key: string]: number } = {};         // Quantidade física total
  stockBalances: { [key: string]: number } = {}; // Saldo calculado (Total - Usado)
  stockItemNames: string[] = [];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.apiService.getCollections().subscribe(data => {
      this.collections = data;
      this.generateStockItemNames();
      this.refreshGlobalStats();
    });
  }

  /* ============================= */
  /* LÓGICA DE COLEÇÕES */
  /* ============================= */

  updateValue(collection: Collection, item: CollectionItem) {
    if (item.owned > item.required) item.owned = item.required;
    if (item.owned < 0) item.owned = 0;

    this.apiService.updateItemValue(collection.id, item.name, item.owned).subscribe(() => {
      this.refreshGlobalStats();
      this.syncStockBalance(item.stockKey);
    });
  }

  completeItem(collection: Collection, item: CollectionItem): void {
    item.owned = item.required;
    this.updateValue(collection, item);
  }

  resetCollection(collection: Collection) {
    if (!confirm(`Deseja resetar "${collection.title}"?`)) return;

    this.apiService.resetCollection(collection.id).subscribe(() => {
      collection.items.forEach(item => item.owned = 0);
      this.refreshGlobalStats();
      // Atualiza o saldo de todos os itens envolvidos nesta coleção
      collection.items.forEach(i => this.syncStockBalance(i.stockKey));
    });
  }

  /* ============================= */
  /* LÓGICA DE ESTOQUE (STOCK) */
  /* ============================= */

  generateStockItemNames(): void {
    const keys = new Set<string>();
    this.collections.forEach(col => {
      col.items.forEach(item => { if (item.stockKey) keys.add(item.stockKey); });
    });
    this.stockItemNames = Array.from(keys).sort();
    
    // Busca inicial de valores e saldos do backend
    this.stockItemNames.forEach(key => this.syncStockBalance(key));
  }

  // Método chamado pelo HTML para atualizar a quantidade física total
  updateStockLevel(stockKey: string, newValue: number) {
    this.apiService.updateStockLevel(stockKey, newValue).subscribe(() => {
      this.syncStockBalance(stockKey);
    });
  }

  // Método que busca do backend o saldo calculado
  syncStockBalance(stockKey: string) {
    this.apiService.getStockBalance(stockKey).subscribe(balance => {
      this.stockBalances[stockKey] = balance;
    });
  }

  // Helper para o HTML exibir o saldo
  getStockBalance(stockKey: string): number {
    return this.stockBalances[stockKey] || 0;
  }

  /* ============================= */
  /* HELPERS DE INTERFACE */
  /* ============================= */

  getProgress(collection: Collection): number {
    if (!collection.items.length) return 0;
    const completed = collection.items.filter(i => i.owned >= i.required).length;
    return Math.floor((completed / collection.items.length) * 100);
  }

  isSlotCompleted(item: CollectionItem): boolean {
    return item.owned >= item.required;
  }

  getAbs(value: number): number {
    return Math.abs(value);
  }

  toggle(collection: Collection) { collection.open = !collection.open; }
  
  toggleDrawer() { this.drawerOpen = !this.drawerOpen; }

  refreshGlobalStats() {
    this.apiService.getBonuses().subscribe(newBonuses => {
      this.activeBonuses = newBonuses.map(nb => {
        const existing = this.activeBonuses.find(b => b.type === nb.type);
        return { ...nb, justUnlocked: !existing || existing.value !== nb.value };
      });
      setTimeout(() => this.activeBonuses.forEach(b => b.justUnlocked = false), 1000);
    });
  }
}