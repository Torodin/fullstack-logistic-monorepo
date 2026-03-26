import { Route } from '@angular/router';
import { Tracking } from '../tracking/tracking';
import { Login } from '../auth/login/login';

export const appRoutes: Route[] = [
    {
        path: 'login',
        component: Login,
    },
    {
        path: '',
        component: Tracking,
    }
];
