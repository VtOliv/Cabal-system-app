import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Dungeon {
  id: string;
  name: string;
  tier: number;
}

interface WeeklyGoal {
  tier: number;
  target: number;
}

interface WeeklyDungeonEntry {
  id: string;
  name: string;
  tier: number;
  count: number;
}

interface WeeklyRecord {
  id: string;
  startDate: string;
  endDate: string;
  goals: WeeklyGoal[];
  dungeons: WeeklyDungeonEntry[];
}

@Component({
  selector: 'app-metas',
  imports: [CommonModule, FormsModule],
  templateUrl: './metas.html',
  styleUrl: './metas.css',
})
export class MetasComponent {

  tiers = [1, 2, 3, 4];

  weeks: WeeklyRecord[] = [];
  selectedWeek!: WeeklyRecord;

  // modal
  modalOpen = false;
  newDungeonName = '';
  newDungeonTier = 1;
  newDungeonCount = 0;

  constructor() {
    this.createNewWeek();
  }

  createNewWeek() {

    const start = new Date();
    const end = new Date();
    end.setDate(start.getDate() + 6);

    const week: WeeklyRecord = {
      id: crypto.randomUUID(),
      startDate: start.toISOString().slice(0, 10),
      endDate: end.toISOString().slice(0, 10),
      goals: [
        { tier: 1, target: 70 },
        { tier: 2, target: 70 },
        { tier: 3, target: 30 },
        { tier: 4, target: 10 }
      ],
      dungeons: []
    };

    this.weeks.unshift(week);
    this.selectedWeek = week;
  }

  openModal() {
    this.modalOpen = true;
  }

  closeModal() {
    this.modalOpen = false;
    this.newDungeonName = '';
    this.newDungeonTier = 1;
    this.newDungeonCount = 0;
  }

  addDungeon() {

    if (!this.newDungeonName.trim()) return;

    this.selectedWeek.dungeons.push({
      id: crypto.randomUUID(),
      name: this.newDungeonName,
      tier: this.newDungeonTier,
      count: this.newDungeonCount
    });

    this.closeModal();
  }

  getTierTotal(tier: number): number {
    return this.selectedWeek.dungeons
      .filter(d => d.tier === tier)
      .reduce((sum, d) => sum + d.count, 0);
  }

  getGoal(tier: number): number {
    return this.selectedWeek.goals.find(g => g.tier === tier)?.target ?? 0;
  }

  getProgressPercent(tier: number): number {
    const total = this.getTierTotal(tier);
    const goal = this.getGoal(tier);
    if (goal === 0) return 0;
    return Math.min(100, Math.round((total / goal) * 100));
  }

  getTierDungeons(tier: number) {
    return this.selectedWeek.dungeons.filter(d => d.tier === tier);
  }
}
