import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { NotfoundComponent } from './layout/notfound/notfound.component';

export const routes: Routes = [
    {
        path: 'Zone',
        children: [
            {
                path: 'login',
                component: LoginComponent,
                data: { title: 'Login' }
            },
            {
                path: 'dashboard',
                data: { title: 'Dashboard' },
                loadChildren: () =>
                    import('./features/dashboard/dashboard.module').then(m => m.DashboardModule)
            },
            {
                path: 'liveevent',
                data: { title: 'Live Event' },
                loadChildren: () =>
                    import('./features/liveevent/liveevent.module').then(m => m.LiveeventModule)
            },
            {
                path: 'eventviewer',
                data: { title: 'Event Viewer' },
                loadChildren: () =>
                    import('./features/eventviewer/eventviewer.module').then(m => m.EventviewerModule)
            },
            {
                path: 'camera',
                data: { title: 'Camera' },
                loadChildren: () =>
                    import('./features/camera/camera.module').then(m => m.CameraModule)
            },
            {
                path: 'notification',
                data: { title: 'Notification' },
                loadChildren: () =>
                    import('./features/notification/notification.module').then(m => m.NotificationModule)
            },
            {
                path: 'user',
                data: { title: 'User' },
                loadChildren: () =>
                    import('./features/user/user.module').then(m => m.UserModule)
            },
            {
                path: 'configuration',
                data: { title: 'Configuration' },
                loadChildren: () =>
                    import('./features/configuration/configuration.module').then(m => m.ConfigurationModule)
            },
            {
                path: 'roi',
                data: {title: 'Configuration'},
                loadChildren:() => import('./features/roi/roi.module').then(m => m.RoiModule)
            },
            {
                path: '',
                redirectTo: 'login',
                pathMatch: 'full'
            },
            {
                path: '**',
                component: NotfoundComponent
            }
        ]
    },
    // fallback root redirect
    {
        path: '',
        redirectTo: 'Zone/login',
        pathMatch: 'full'
    }
];
