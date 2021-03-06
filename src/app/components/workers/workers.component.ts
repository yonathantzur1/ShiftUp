import { Component, ChangeDetectorRef, AfterViewChecked } from '@angular/core';
import { Router } from '@angular/router';
import { BusinessesService } from '../../services/businesses/businesses.service';
import { WorkersService } from '../../services/workers/workers.service';

declare let Swal: any;
declare let $: any;

@Component({
    selector: 'workers',
    templateUrl: './workers.html',
    providers: [BusinessesService, WorkersService],
    styleUrls: ['./workers.css']
})

export class WorkersComponent implements AfterViewChecked {
    business: any = {};
    manager: any;
    allWorkers: Array<any>;
    filteredWorkers: Array<any>;
    workerSearchText: string = "";

    constructor(private cdRef:ChangeDetectorRef,
        private businessesService: BusinessesService,
        private workersService: WorkersService,
        private router: Router) { }

    ngOnInit() {
        this.businessesService.GetLoggedInBusiness().then((business: any) => {
            this.business = business;
        });

        this.businessesService.GetWorkersForBusiness().then((workers: any) => {
            this.manager = workers.filter((worker: any) => worker.isManager)[0];
            this.allWorkers = workers.filter((worker: any) => !worker.isManager);
            this.filteredWorkers = this.allWorkers;
        });
    }

    ngAfterViewChecked() {
        this.cdRef.detectChanges();
    }

    showRequests = () => {
        this.router.navigateByUrl('/workers/requests');
    }

    deleteWorkerHandler = (workerToDelete: any) => {
        Swal.fire({
            title: "האם אתה בטוח?",
            text: "העובד " + workerToDelete.firstName + ' ' + workerToDelete.lastName + " יימחק מהעסק!",
            type: "warning",
            showCancelButton: true,
            cancelButtonColor: "#d33",
            confirmButtonText: "אישור",
            cancelButtonText: "ביטול"
        }).then((result: any) => {
            if (result.value) {
                this.workersService.RemoveWorkerFromBusiness(workerToDelete.userId)
                    .then(() => {
                        this.allWorkers = this.allWorkers.filter(worker => worker.userId !== workerToDelete.userId);
                        this.SearchWorkerHandler();
                        Swal.fire({
                            title: "הפעולה הצליחה!",
                            text: "העובד " + workerToDelete.firstName + " " + workerToDelete.lastName + " נמחק בהצלחה",
                            type: "success",
                            showConfirmButton: false,
                            timer: 1000
                        });
                    })
                    .catch((err: any) => {
                        Swal.fire({
                            title: "שגיאה",
                            text: "הפעולה נכשלה!",
                            type: "error",
                            confirmButtonText: "אישור"
                        });
                    })
            }
        });
    }

    deleteAllWorkersHandler = () => {
        Swal.fire({
            title: "האם אתה בטוח?",
            text: "כל העובדים יימחקו!",
            type: "warning",
            showCancelButton: true,
            cancelButtonColor: "#d33",
            confirmButtonText: "אישור",
            cancelButtonText: "ביטול"
        }).then((result: any) => {
            if (result.value) {
                this.workersService.RemoveAllWorkersFromBusiness()
                    .then(() => {
                        this.allWorkers = [];
                        this.filteredWorkers = [];
                        Swal.fire({
                            title: "הפעולה הצליחה!",
                            text: "כל העובדים נמחקו בהצלחה.",
                            type: "success",
                            showConfirmButton: false,
                            timer: 1500
                        });
                    })
                    .catch((err: any) => {
                        Swal.fire({
                            title: "שגיאה",
                            text: "הפעולה נכשלה!",
                            type: "error",
                            confirmButtonText: "אישור"
                        });
                    });
            }
        });
    }

    SearchWorkerHandler = () => {
        if (this.workerSearchText) {
            this.filteredWorkers = this.allWorkers.filter((worker: any) => {
                const currWorkerFullName = worker.firstName + ' ' + worker.lastName;
                const currWorkerFullNameReversed = worker.lastName + ' ' + worker.firstName;

                return currWorkerFullName.indexOf(this.workerSearchText) == 0 ||
                    currWorkerFullNameReversed.indexOf(this.workerSearchText) == 0 ||
                    worker.userId.indexOf(this.workerSearchText) == 0
            });
        }
        else {
            this.filteredWorkers = this.allWorkers;
        }
    }

    ResetSearchWorkerHandler = () => {
        this.workerSearchText = "";
        this.filteredWorkers = this.allWorkers;
    }
}