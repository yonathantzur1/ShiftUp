import { Component, OnInit, OnDestroy } from '@angular/core';

import { ShiftService } from '../../services/shifts/shifts.service';
import { EventService } from '../../services/event/event.service';

import { SHIFTS_FILTER } from '../../enums/enums'

declare let $: any;

@Component({
    selector: 'calendar',
    templateUrl: './calendar.html',
    providers: [ShiftService],
    styleUrls: ['./calendar.css']
})

export class CalendarComponent implements OnInit, OnDestroy {
    calendar: any;
    markedEvent: any;
    eventsCache: Object = {};
    viewState: SHIFTS_FILTER = SHIFTS_FILTER.ALL;
    isLoading: boolean;

    // Event edit properties.
    eventEditObject: any;

    eventsIds: Array<string> = [];

    constructor(private shiftService: ShiftService,
        private eventService: EventService) {
        let self = this;

        self.eventService.Register("openEditShiftCard", (event: any) => {
            self.eventEditObject = self.createEventObjectToEdit(event);
        });

        self.eventService.Register("renderCalendar", () => {
            this.viewState = SHIFTS_FILTER.ALL;
            $("#filter-select").val(0);
            self.eventsCache = {};
            self.RenderCalendar();
        });

        self.eventService.Register("closeShiftEdit", () => {
            self.eventEditObject = null;
        });

        self.eventService.Register("changeFilter", (filter: SHIFTS_FILTER) => {
            self.eventService.Emit("calanderViewRender");
            self.viewState = filter;
            self.eventsCache = {};
            let dateRange = $('#calendar').fullCalendar('getDate')._i;
            let year: number = dateRange[0];
            let month: number = dateRange[1] + 1;

            let reqQuery;

            if (filter == SHIFTS_FILTER.ALL) {
                reqQuery = self.shiftService.GetShiftsForBusiness(year, month);
            }
            else if (filter == SHIFTS_FILTER.ME) {
                reqQuery = self.shiftService.GetMyShiftsForBusiness(year, month);
            }

            self.isLoading = true;

            reqQuery.then((shifts: Array<any>) => {
                self.isLoading = false;
                shifts && self.handleShiftsResult(shifts, year, month);
            });

        }, self.eventsIds);
    }

    ngOnInit() {
        let self = this;

        self.calendar = $('#calendar').fullCalendar({
            height: "parent",
            editable: true,
            eventRender: function (event: any, element: any) {
                element.bind('dblclick', () => {
                    self.eventEditObject = self.createEventObjectToEdit(event);
                });
            },
            viewRender: function (element: any) {
                self.RenderCalendar();
            },
            eventClick: function (event: any) {
                if (self.markedEvent == this) {
                    self.eventService.Emit("calanderEventUnClick");
                    $(self.markedEvent).css('border-color', '');
                    self.markedEvent = null;
                }
                else {
                    // Mark selected event.
                    self.markedEvent && $(self.markedEvent).css('border-color', '');
                    $(this).css('border-color', '#dc3545');
                    self.markedEvent = this;

                    self.eventService.Emit("calanderEventClick", event);
                }
            }
        });
    }

    ngOnDestroy() {
        this.eventService.UnsubscribeEvents(this.eventsIds);
    }

    RenderCalendar() {
        this.eventService.Emit("calanderViewRender");
        let dateRange = $('#calendar').fullCalendar('getDate')._i;
        let year: number = dateRange[0];
        let month: number = dateRange[1] + 1;

        let eventsFromCache = this.eventsCache[year + "-" + month];

        if (eventsFromCache) {
            this.loadShifts(eventsFromCache);
        }
        else {
            let reqQuery;

            if (this.viewState == SHIFTS_FILTER.ALL) {
                reqQuery = this.shiftService.GetShiftsForBusiness(year, month);
            }
            else if (this.viewState == SHIFTS_FILTER.ME) {
                reqQuery = this.shiftService.GetMyShiftsForBusiness(year, month);
            }

            this.isLoading = true;

            reqQuery.then((shifts: Array<any>) => {
                this.isLoading = false;
                shifts && this.handleShiftsResult(shifts, year, month);
            });
        }
    }

    handleShiftsResult(shifts: Array<any>, year: number, month: number) {
        let events: Array<any> = [];

        shifts.forEach((shift: any) => {
            events.push({
                id: shift._id,
                title: "שיבוץ",
                start: shift.date,
                shiftsData: shift.shiftsData
            });
        });

        this.eventsCache[year + "-" + month] = events;
        this.loadShifts(events);
    }

    loadShifts(shifts: Array<any>) {
        this.calendar.fullCalendar('removeEvents');
        this.calendar.fullCalendar('renderEvents', shifts);
    }

    createEventObjectToEdit(event: any) {
        let eventObj = {
            "id": event.id,
            "shiftsData": event.shiftsData,
            "date": this.formatEventDate(event.start._i)
        };

        return eventObj;
    }

    formatEventDate(dateStr: string) {
        let date = new Date(dateStr);

        let day: any = date.getDate();
        let month: any = date.getMonth() + 1;
        let year: any = date.getFullYear();

        if (day < 10) {
            day = "0" + day;
        }

        if (month < 10) {
            month = "0" + month;
        }

        return (day + "/" + month + "/" + year);

    }
}