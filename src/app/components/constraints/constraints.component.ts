import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../services/global/global.service';
import { ConstraintsService } from '../../services/constraints/constraints.service';
import { STATUS_CODE } from '../../enums/enums';
import { STATUS_CODE_NUMBER } from '../../enums/enums';
import { UsersService } from "../../services/users/users.service";
import { EventService } from '../../services/event/event.service';

declare let Swal: any;

@Component({
    selector: 'constraints',
    templateUrl: './constraints.html',
    providers: [ConstraintsService, UsersService],
    styleUrls: ['./constraints.css']
})

export class ConstraintsComponent implements OnInit {
    constraints: Array<any>;
    searchWord: string;
    startDateFilter: Date;
    endDateFilter: Date;

    // sort variable
    statusColName: string = 'statusId';
    startDateColName: string = 'startDate';
    downSort: number = 1;
    upSort: number = -1;
    userSortCol: string;
    userSortDirection: number;

    constructor(
        private globalService: GlobalService,
        private constraintsService: ConstraintsService,
        private EventService: EventService) { }

    ngOnInit() {
        this.userSortCol = this.statusColName;
        this.userSortDirection = this.downSort;
        this.InitiateConstraints();

        let self = this;

        self.globalService.socket.on("UpdateConstraintServer", () => {
            self.InitiateConstraints();
        });

    }

    ApproveConstraint(conObj: any) {
        this.constraintsService.ApproveConstraint(conObj._id).then((isApprove: any) => {
            if (isApprove) {
                conObj.status[0].statusName = STATUS_CODE.CONFIRMED;
                conObj.statusId = conObj.status[0].statusId = isApprove.statusId;
                this.globalService.socket.emit("UpdateConstraintStatusClient", conObj.userObjId);
                this.CalcWaitingConstraintsAmount();
            } else {
                Swal.fire({
                    type: 'error',
                    title: 'שגיאה באישור אילוץ',
                    text: 'אופס... משהו השתבש'
                })
            }
        })
    }

    RefuseConstraint(conObj: any) {
        this.constraintsService.RefuseConstraint(conObj._id).then((isCanceled: any) => {
            if (isCanceled) {
                conObj.status[0].statusName = STATUS_CODE.REFUSED;
                conObj.statusId = conObj.status[0].statusId = isCanceled.statusId;
                this.globalService.socket.emit("UpdateConstraintStatusClient", conObj.userObjId);
                this.CalcWaitingConstraintsAmount();
            } else {
                Swal.fire({
                    type: 'error',
                    title: 'שגיאה בדחיית אילוץ',
                    text: 'אופס... משהו השתבש'
                })
            }
        })
    }

    InitiateConstraints() {
        this.constraintsService.getAllConstraints(this.userSortCol, this.userSortDirection).then((data: any) => {
            this.constraints = data;
            this.CalcWaitingConstraintsAmount();
        });
    }

    CalcWaitingConstraintsAmount() {
        // Calculate waiting constraints requests.
        let waitingConstraintsAmount = this.constraints.filter((constraint: any) => {
            return (constraint.statusId == 0);
        }).length;

        this.EventService.Emit("setConstraintRequestAmount", waitingConstraintsAmount);
    }

    filterItem() {
        if (this.searchWord || this.startDateFilter || this.endDateFilter) {
            return this.constraints.filter(item => {
                let isInclude = true;

                if (this.searchWord) {
                    isInclude = (item.user[0].userId.startsWith(this.searchWord)) ||
                        ((item.user[0].firstName + " " + item.user[0].lastName).startsWith(this.searchWord)) ||
                        ((item.user[0].lastName + " " + item.user[0].firstName).startsWith(this.searchWord)) ||
                        (item.description.startsWith(this.searchWord)) ||
                        (item.status[0].statusName.startsWith(this.searchWord));
                }

                if (isInclude && this.startDateFilter) {
                    isInclude = new Date(item.startDate) >= new Date(this.startDateFilter);
                }

                if (isInclude && this.endDateFilter) {
                    isInclude = new Date(item.endDate) <= new Date(this.endDateFilter);
                }

                return isInclude;
            });
        }
        else {
            return this.constraints;
        }
    }

    getStatusLightColor(statusId: number) {
        switch (statusId) {
            case (STATUS_CODE_NUMBER.CONFIRMED):
                return "rgb(76, 175, 80)";
            case (STATUS_CODE_NUMBER.REFUSED):
                return "rgb(244, 67, 54)";
            case (STATUS_CODE_NUMBER.WAITING):
                return "rgb(255, 193, 7)";
        }
    }
}