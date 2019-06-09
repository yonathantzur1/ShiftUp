import { Component, OnInit } from '@angular/core';
import { ConstraintsService } from '../../services/constraints/constraints.service';
import { BusinessesService } from "../../services/businesses/businesses.service";
import { NgForm } from "@angular/forms";

declare let Swal: any;
declare let $: any;

@Component({
    selector: 'constraintsForWorker',
    templateUrl: './constraintsForWorker.html',
    providers: [ConstraintsService, BusinessesService],
    styleUrls: ['./constraintsForWorker.css']
})

export class ConstraintsForWorkerComponent implements OnInit {
    sourceConstraints: Array<any> = [];
    constraints: Array<any> = [];
    constraintsReasons: Array<any> = [];
    newConstraint: any;
    shiftNames: any;
    isRange: boolean;
    searchWord: string;
    startDateFilter: Date;
    endDateFilter: Date;

    constructor(private constraintsService: ConstraintsService,
        private businessService: BusinessesService) {
    }

    ngOnInit() {
        this.isRange = false;
        this.InitiateConstraints();
        this.InitiateShiftNames();
        this.InitiateConstraintsReasons()
    }

    InitiateConstraints() {
        this.constraintsService.getAllConstraints('statusId',1).then((data: any) => {
            this.sourceConstraints = data;
            this.constraints = this.sourceConstraints;
        });
    }

    InitiateShiftNames() {
        this.businessService.GetLoggedInBusiness().then((data: any) => {
            this.shiftNames = data.shifts;
            for (let shift of this.shiftNames) {
                delete shift.workersAmount;
            }
        });
    }

    InitiateConstraintsReasons() {
        this.constraintsService.getAllConstraintReasons().then((data: any) => {
            this.constraintsReasons = data;
        });
    }

    filterItem() {
        if (this.searchWord || this.startDateFilter || this.endDateFilter) {
            this.constraints = this.sourceConstraints.filter(item => {
                let bool = true;
                if (this.searchWord) {
                    bool = (this.searchWord && (item.user[0].userId.includes(this.searchWord)) ||
                        (item.description.includes(this.searchWord)) ||
                        (item.status[0].statusName.includes(this.searchWord)));
                }
                if (bool && this.startDateFilter) {
                    bool = new Date(item.startDate) >= new Date(this.startDateFilter);
                }
                if (bool && this.endDateFilter) {
                    bool = new Date(item.endDate) <= new Date(this.endDateFilter);
                }
                return bool;
            });
        } else {
            this.constraints = this.sourceConstraints;
        }
    }

    onSubmit(AddConstraintForm: NgForm) {
        if (AddConstraintForm.valid) {
            let isShiftSelected = false;
            this.newConstraint = AddConstraintForm.value;
            if (this.newConstraint.startDate) {
                if((new Date(this.newConstraint.startDate) < new Date(Date.now())) ||
                (!/^\d{4}-\d{2}-\d{2}$/.test(this.newConstraint.startDate))) {
                    Swal.fire({
                        type: 'error',
                        title: 'תאריך ההתחלה שהוכנס אינו תקין',
                        text: 'נא לתקן ולנסות שנית'
                    });
                    return;
                }
                if (!this.newConstraint.endDate || !this.isRange) {
                    this.newConstraint.endDate = this.newConstraint.startDate;
                }
                if((!/^\d{4}-\d{2}-\d{2}$/.test(this.newConstraint.endDate))) {
                    Swal.fire({
                        type: 'error',
                        title: 'תאריך סיום שהוכנס אינו תקין',
                        text: 'נא לתקן ולנסות שנית'
                    });
                    return;
                }
                if (new Date(this.newConstraint.endDate) < new Date(this.newConstraint.startDate)) {
                    Swal.fire({
                        type: 'error',
                        title: 'טווח התאריכים לא תקין',
                        text: 'נא לתקן ולנסות שוב'
                    })
                } else {
                    for (let shift of this.shiftNames) {
                        if (shift.isChecked) {
                            isShiftSelected = true;
                        }
                    }
                    if (!isShiftSelected) {
                        Swal.fire({
                            title: 'להמשיך?',
                            text: "לא נבחרו משמרות, לכן כל המשמרות יתקבלו כאילוץ",
                            type: 'warning',
                            showCancelButton: true,
                            confirmButtonColor: '#3085d6',
                            cancelButtonColor: '#d33',
                            cancelButtonText: 'חזרה',
                            confirmButtonText: 'כן, זה בסדר!'
                        }).then((result: any) => {
                            if (result.value) {
                                for (let shift of this.shiftNames) {
                                    shift['isChecked'] = true;
                                }
                                this.AddConstraint(this.newConstraint);
                                return;
                            }
                        })
                    } else {
                        this.AddConstraint(this.newConstraint);
                    }
                }
            }
        } else {
            Swal.fire({
                type: 'error',
                title: 'ישנם שדות ריקים',
                text: 'נא למלא את כל השדות בצורה תקינה'
            })
        }
    }

    AddConstraint(newConstraint: any) {
        newConstraint['shifts'] = this.shiftNames;
        this.constraintsService.AddConstraint(newConstraint).then((result: any) => {
            if (result) {
                $('#AddConstraintModal').modal('hide');
                Swal.fire({
                    type: 'success',
                    title: 'האילוץ נשמר בהצלחה',
                });
                this.InitiateConstraints();
                this.InitiateShiftNames();
            } else {
                Swal.fire({
                    type: 'error',
                    title: 'שגיאה בהוספת אילוץ',
                    text: 'אופס... משהו השתבש'
                })

            }
        }
        );
    }

    DeleteConstraint(conObjId: string) {
        this.constraintsService.DeleteConstraint(conObjId).then((isDeleted: any) => {
            if (isDeleted) {
                for(let i in this.constraints){
                    if(this.constraints[i]._id == conObjId) {
                        this.constraints.splice(Number(i), 1);
                        break;
                    }
                }
            } else {
                Swal.fire({
                    type: 'error',
                    title: 'שגיאה במחיקה',
                    text: 'אופס... משהו השתבש'
                })
            }
        })
    }
}