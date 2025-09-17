import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CameraComponent } from './camera.component';
import { authGuard } from '../../core/guards/auth.guard';

const routes: Routes = [{
  path: "", component: CameraComponent, canActivate: [authGuard]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CameraRoutingModule { }
