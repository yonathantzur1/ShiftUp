"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var router_1 = require("@angular/router");
var main_component_1 = require("../components/main/main.component");
var home_component_1 = require("../components/home/home.component");
var login_component_1 = require("../components/login/login.component");
var constraints_component_1 = require("../components/constraints/constraints.component");
var workers_component_1 = require("../components/workers/workers.component");
var newWorker_component_1 = require("../components/newWorker/newWorker.component");
var calendarBoard_component_1 = require("../components/calendarBoard/calendarBoard.component");
var statistics_component_1 = require("../components/statistics/statistics.component");
var registration_component_1 = require("../components/registration/registration.component");
var newUserRole_component_1 = require("../components/newUserRole/newUserRole.component");
var newBusiness_component_1 = require("../components/newUserRole/newBusiness/newBusiness.component");
var worker_component_1 = require("../components/newUserRole/worker/worker.component");
var workerWait_component_1 = require("../components/newUserRole/workerWait/workerWait.component");
var auth_guard_1 = require("../guards/auth/auth.guard");
var auth_guard_2 = require("../guards/auth/auth.guard");
var userRole_guard_1 = require("../guards/userRole/userRole.guard");
var userRole_guard_2 = require("../guards/userRole/userRole.guard");
var routes = [
    {
        path: '', component: main_component_1.MainComponent, canActivate: [auth_guard_1.AuthGuard, userRole_guard_2.StateUserGuard],
        children: [
            { path: '', component: home_component_1.HomeComponent },
            { path: 'constraints', component: constraints_component_1.ConstraintsComponent },
            { path: 'workers', children: [
                    { path: '', component: workers_component_1.WorkersComponent },
                    { path: 'newWorker', component: newWorker_component_1.NewWorkerComponent }
                ]
            },
            { path: 'calendarBoard', component: calendarBoard_component_1.CalendarBoardComponent },
            { path: 'statistics', component: statistics_component_1.StatisticsComponent },
        ],
    },
    { path: 'login', component: login_component_1.LoginComponent, canActivate: [auth_guard_2.LoginGuard] },
    { path: 'register', component: registration_component_1.RegistrationComponent, canActivate: [auth_guard_2.LoginGuard] },
    {
        path: 'role', canActivate: [userRole_guard_1.StatelessUserGuard],
        children: [
            { path: '', component: newUserRole_component_1.NewUserRoleComponent },
            { path: 'business', component: newBusiness_component_1.NewBusinessComponent },
            { path: 'worker', component: worker_component_1.WorkerComponent }
        ]
    },
    { path: 'workerWait', component: workerWait_component_1.WorkerWaitComponent, canActivate: [userRole_guard_1.WaitUserGuard] },
    { path: '**', redirectTo: '' }
];
var Routing = /** @class */ (function () {
    function Routing() {
    }
    Routing = __decorate([
        core_1.NgModule({
            imports: [router_1.RouterModule.forRoot(routes)],
            exports: [router_1.RouterModule]
        })
    ], Routing);
    return Routing;
}());
exports.Routing = Routing;
//# sourceMappingURL=app.routing.js.map