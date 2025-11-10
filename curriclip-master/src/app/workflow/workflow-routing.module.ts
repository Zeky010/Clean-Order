import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Como importas los standalone en el módulo, puedes referenciarlos directo:
import { OrdersPage } from './pages/orders/orders.page';
import { OrderDetailPage } from './pages/order-detail/order-detail.page';

const routes: Routes = [
  { path: '', redirectTo: 'orders', pathMatch: 'full' },
  { path: 'orders', component: OrdersPage },
  { path: 'detail/:id', component: OrderDetailPage },

];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkflowRoutingModule {}
