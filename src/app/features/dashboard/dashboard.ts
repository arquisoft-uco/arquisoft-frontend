import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, ArrowRight, FileText, GraduationCap, Folder, Send, ClipboardCheck, ClipboardList, TrendingUp, Clock, BarChart3 } from 'lucide-angular';
import type { LucideIconData } from 'lucide-angular';
import { KeycloakService } from '../../core/auth/keycloak.service';

interface QuickCard {
  route: string;
  icon: LucideIconData;
  label: string;
  description: string;
  accent: 'primary' | 'secondary' | 'tertiary';
}

interface StatCard {
  icon: LucideIconData;
  value: string;
  label: string;
  accent: 'primary' | 'secondary' | 'tertiary';
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, LucideAngularModule],
})
export class DashboardComponent {
  protected readonly keycloak = inject(KeycloakService);

  protected readonly ArrowRightIcon: LucideIconData = ArrowRight;

  protected readonly quickCards: QuickCard[] = [
    { route: '/fichas-perfil', icon: FileText, label: 'Fichas de Perfil', description: 'Gestionar expedientes académicos', accent: 'primary' },
    { route: '/proyectos-grado', icon: GraduationCap, label: 'Proyectos de Grado', description: 'Seguimiento de tesis e investigación', accent: 'secondary' },
    { route: '/artefactos', icon: Folder, label: 'Artefactos', description: 'Arquitecturas y diseños técnicos', accent: 'tertiary' },
    { route: '/entregables', icon: Send, label: 'Entregables', description: 'Control de envíos y entregas', accent: 'primary' },
    { route: '/evaluaciones', icon: ClipboardCheck, label: 'Evaluaciones', description: 'Calificar y revisar desempeño', accent: 'secondary' },
    { route: '/solicitudes', icon: ClipboardList, label: 'Solicitudes', description: 'Trámites institucionales', accent: 'tertiary' },
  ];

  protected readonly statCards: StatCard[] = [
    { icon: TrendingUp, value: '12', label: 'Proyectos Activos', accent: 'secondary' },
    { icon: Clock, value: '5', label: 'Entregables Pendientes', accent: 'tertiary' },
    { icon: BarChart3, value: '3', label: 'Evaluaciones Recientes', accent: 'primary' },
  ];
}
