import { Route } from '@angular/router';
import { Tracking } from '../tracking/tracking';
import { Login } from '../auth/login/login';
import { Register } from '../auth/register/register';
import { ShipmentList } from '../shipments/shipment-list/shipment-list';
import { ShipmentDetails } from '../shipments/shipment-details/shipment-details';
import { VehicleAssignation } from '../shipments/vehicle-assignation/vehicle-assignation';
import { roleGuard } from '../auth/guards/role.guard';
import { Role } from '@fullstack-logistic-wrk/prisma/generated';

export const appRoutes: Route[] = [
    {
        path: 'login',
        component: Login,
    },
    {
        path: 'users/register',
        component: Register,
        canActivate: [roleGuard],
        data: {
            roles: [Role.SUPERVISOR],
        },
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
        path: 'shipments/assign-vehicles',
        component: VehicleAssignation,
        canActivate: [roleGuard],
        data: {
            roles: [Role.SUPERVISOR],
        },
    },
    {
        path: 'shipments/:id',
        component: ShipmentDetails,
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
