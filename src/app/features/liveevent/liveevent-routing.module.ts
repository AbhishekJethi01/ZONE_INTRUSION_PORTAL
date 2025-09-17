import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LiveeventComponent } from './liveevent.component';
import { authGuard } from '../../core/guards/auth.guard';

const routes: Routes = [
  {
    path: "", component: LiveeventComponent, canActivate: [authGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LiveeventRoutingModule { }
