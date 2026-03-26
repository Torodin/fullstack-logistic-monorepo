import { Route } from '@angular/router';
import { Tracking } from '../tracking/tracking';
import { Login } from '../auth/login/login';
import { ShipmentList } from '../shipments/shipment-list/shipment-list';
import { roleGuard } from '../auth/guards/role.guard';
import { Role } from '@fullstack-logistic-wrk/prisma/generated';

export const appRoutes: Route[] = [
    {
        path: 'login',
        component: Login,
    },
    {
        path: 'shipments',
        component: ShipmentList,
        canActivate: [roleGuard],
        data: {
            roles: [Role.SUPERVISOR, Role.OPERATOR],
        },
    },
    {
        path: '',
        component: Tracking,
    }
];
