import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Sparkles, ArrowRight, FileText, GraduationCap, Folder, Send, ClipboardCheck, ClipboardList } from 'lucide-angular';
import type { LucideIconData } from 'lucide-angular';
import { KeycloakService } from '../../core/auth/keycloak.service';

interface QuickCard {
  route: string;
  icon: LucideIconData;
  label: string;
  description: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, LucideAngularModule],
})
export class DashboardComponent {
  protected readonly keycloak = inject(KeycloakService);

  protected readonly SparklesIcon: LucideIconData = Sparkles;
  protected readonly ArrowRightIcon: LucideIconData = ArrowRight;

  protected readonly quickCards: QuickCard[] = [
    { route: '/fichas-perfil', icon: FileText, label: 'Fichas Perfil', description: 'Gestiona fichas de perfil' },
    { route: '/proyectos-grado', icon: GraduationCap, label: 'Proyectos de Grado', description: 'Administra proyectos' },
    { route: '/artefactos', icon: Folder, label: 'Artefactos', description: 'Gestiona artefactos' },
    { route: '/entregables', icon: Send, label: 'Entregables', description: 'Revisa entregables' },
    { route: '/evaluaciones', icon: ClipboardCheck, label: 'Evaluaciones', description: 'Administra evaluaciones' },
    { route: '/solicitudes', icon: ClipboardList, label: 'Solicitudes', description: 'Gestiona solicitudes' },
  ];
}
