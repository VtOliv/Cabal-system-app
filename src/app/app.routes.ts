
import { Routes } from '@angular/router';
import { ColecoesComponent } from './components/colecoes/colecoes.component';
import { CalculadoraComponent } from './components/calculadora/calculadora.component';
import { MetasComponent } from './components/metas/metas';
import { Merito } from './components/merito/merito';
import { Dourado } from './components/merito/dourado/dourado';
import { Platina } from './components/merito/platina/platina';
import { Diamante } from './components/merito/diamante/diamante';

export const routes: Routes = [
	{ path: 'colecoes', component: ColecoesComponent },
	{ path: 'metas', component: MetasComponent },
	{ path: 'calculadora', component: CalculadoraComponent },
	{
		path: 'merito',
		component: Merito,
		children: [
			{ path: '', redirectTo: 'dourado', pathMatch: 'full' },
			{ path: 'dourado', component: Dourado },
			{ path: 'platina', component: Platina },
			{ path: 'diamante', component: Diamante },
		]
	}
];
