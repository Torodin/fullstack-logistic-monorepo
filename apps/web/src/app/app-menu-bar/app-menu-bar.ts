import { Component, computed, inject } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { MenubarModule } from 'primeng/menubar';
import { AuthService } from '../../auth/auth.service';
import { Role } from '@fullstack-logistic-wrk/prisma/generated';

@Component({
    selector: 'app-menu-bar',
    template: `
        <div class="card m-1">
            <p-menubar [model]="items()"></p-menubar>
        </div>
    `,
    standalone: true,
    imports: [MenubarModule],
})
export class AppMenuBar {
    private readonly authService = inject(AuthService);

    readonly items = computed<MenuItem[]>(() => {
        const baseItems: MenuItem[] = [
            {
                label: 'Tracking',
                icon: 'pi pi-map-marker',
                routerLink: '/',
            },
        ];

        if (this.authService.isAuthenticated()) {
            const currentUser = this.authService.currentUser();

            if (currentUser && [Role.SUPERVISOR, Role.OPERATOR].includes(currentUser.role)) {
                baseItems.push({
                    label: 'Shipments',
                    icon: 'pi pi-truck',
                    routerLink: '/shipments',
                });
            }

            baseItems.push({
                label: currentUser?.email ?? 'Logout',
                icon: 'pi pi-sign-out',
                routerLink: '/',
                command: () => {
                    this.authService.logout();
                },
            });
        } else {
            baseItems.push({
                label: 'Login',
                icon: 'pi pi-sign-in',
                routerLink: '/login',
            });
        }

        return baseItems;
    });
}
