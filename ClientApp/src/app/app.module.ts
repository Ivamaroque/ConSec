import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { HomeComponent } from './home/home.component';
import { CounterComponent } from './counter/counter.component';
import { FetchDataComponent } from './fetch-data/fetch-data.component';
import { LoginComponent } from './login/login.component';
import { GerenciarTemasComponent } from './gerenciar-temas/gerenciar-temas.component';
import { CadastrarCustosComponent } from './cadastrar-custos/cadastrar-custos.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { GerenciarFuncionariosComponent } from './gerenciar-funcionarios/gerenciar-funcionarios.component';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { AuthGuard } from './guards/auth.guard';
import { MeusCustosComponent } from './meus-custos/meus-custos.component';

@NgModule({
  declarations: [
    AppComponent,
    NavMenuComponent,
    HomeComponent,
    CounterComponent,
    FetchDataComponent,
    LoginComponent,
    GerenciarTemasComponent,
    CadastrarCustosComponent,
    DashboardComponent,
    GerenciarFuncionariosComponent,
    MeusCustosComponent
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'ng-cli-universal' }),
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot([
      { path: 'login', component: LoginComponent },
      { path: '', redirectTo: '/login', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard], data: { role: 'gestor' } },
      { path: 'meus-custos', component: MeusCustosComponent, canActivate: [AuthGuard], data: { role: 'funcionario' } },
      { path: 'gerenciar-temas', component: GerenciarTemasComponent, canActivate: [AuthGuard], data: { role: 'gestor' } },
      { path: 'gerenciar-funcionarios', component: GerenciarFuncionariosComponent, canActivate: [AuthGuard], data: { role: 'gestor' } },
      { path: 'cadastrar-custos', component: CadastrarCustosComponent, canActivate: [AuthGuard], data: { role: 'gestor' } },
      { path: 'counter', component: CounterComponent, canActivate: [AuthGuard] },
      { path: 'fetch-data', component: FetchDataComponent, canActivate: [AuthGuard] },
      { path: '**', redirectTo: '/login' }
    ])
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
