"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var WorkersComponent = /** @class */ (function () {
    function WorkersComponent() {
        this.workers = [
            { id: 323345120, name: "נופר ישראלי", job: "מארחת", age: 22, hourSalery: 28 },
            { id: 323545551, name: "יונתן צור", job: "טבח", age: 23, hourSalery: 40 },
            { id: 315856716, name: "ניב הוכברג", job: "מלצר", age: 23, hourSalery: 31 },
            { id: 201215100, name: "אבי רון", job: "שוטף כלים", age: 21, hourSalery: 22 },
            { id: 345852156, name: "ברי צקלה", job: "מלצר", age: 20, hourSalery: 30 },
            { id: 158815313, name: "גלעד שליט", job: "אחראי משמרת", age: 28, hourSalery: 42 },
        ];
        this.addNewWorker = function () {
            console.log("handle add new worker");
        };
    }
    WorkersComponent = __decorate([
        core_1.Component({
            selector: 'workers',
            templateUrl: './workers.html',
            providers: [],
            styleUrls: ['./workers.css']
        })
    ], WorkersComponent);
    return WorkersComponent;
}());
exports.WorkersComponent = WorkersComponent;
//# sourceMappingURL=workers.component.js.map