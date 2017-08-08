import { Component, Input, Output, forwardRef, EventEmitter } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import * as moment from 'moment';

@Component({
	selector: 'date-picker',
	templateUrl: './date-picker.component.html',
	styleUrls: [`./date-picker.component.css`],
	providers: [{
		provide: NG_VALUE_ACCESSOR,
		useExisting: forwardRef(() => DatePickerComponent),
		multi: true,
	}],
})

export class DatePickerComponent implements ControlValueAccessor {

	// Events
	@Output() onChange: EventEmitter<any> = new EventEmitter();

	@Input() language = 'nl'				// en
	@Input() type = 'popover' 				// [popover dropdown]
	@Input() descriptionPlacement = 'left'; // [left top hidden]

	@Input() time = false;
	@Input() timeDescription = '';
	@Input() timePrecision = 15;
	@Input() timeRangeFrom = 0;
	@Input() timeRangeTo = 24;

	@Input() date = true;
	@Input() datePlaceholder = ''
	@Input() dateDescription = 'Voer een datum in';
	@Input() dateDisplayFormat = 'DD-MM-YYYY (dddd)'
	@Input() dateInit = '2000-01-01 12:00'
	@Input() dateFrom = '1980-01-01 00:00'
	@Input() dateTo = '2020-12-31 23:59'

	// Receives an array with warnings
	// - title
	// - message
	// - style [warning, error, success]
	// - type ['range', 'in-past', 'weekend', 'sunday']
	// - (params) [startRange, endRange]
	@Input() dateWarning = [];

	mobile;

	d = {
		today: moment(),
		moment: null,

		selected: {
			millisecond: null,
			second: null,
			minute: null,
			hour: null,
			date: null,
			month: null,
			year: null,

			time: null,
			zone: 'Europe/Amsterdam',
		},

		times: [

		],
		days: [
			{show: true, value: '01', label: 1},
			{show: true, value: '02', label: 2},
			{show: true, value: '03', label: 3},
			{show: true, value: '04', label: 4},
			{show: true, value: '05', label: 5},
			{show: true, value: '06', label: 6},
			{show: true, value: '07', label: 7},
			{show: true, value: '08', label: 8},
			{show: true, value: '09', label: 9},
			{show: true, value: '10', label: 10},
			{show: true, value: '11', label: 11},
			{show: true, value: '12', label: 12},
			{show: true, value: '13', label: 13},
			{show: true, value: '14', label: 14},
			{show: true, value: '15', label: 15},
			{show: true, value: '16', label: 16},
			{show: true, value: '17', label: 17},
			{show: true, value: '18', label: 18},
			{show: true, value: '19', label: 19},
			{show: true, value: '20', label: 20},
			{show: true, value: '21', label: 21},
			{show: true, value: '22', label: 22},
			{show: true, value: '23', label: 23},
			{show: true, value: '24', label: 24},
			{show: true, value: '25', label: 25},
			{show: true, value: '26', label: 26},
			{show: true, value: '27', label: 27},
			{show: true, value: '28', label: 28},
			{show: true, value: '29', label: 29},
			{show: true, value: '30', label: 30},
			{show: true, value: '31', label: 31},
		],
		months: [
			{show: true, value: '01', label: 'januari'},
			{show: true, value: '02', label: 'februari'},
			{show: true, value: '03', label: 'maart'},
			{show: true, value: '04', label: 'april'},
			{show: true, value: '05', label: 'mei'},
			{show: true, value: '06', label: 'juni'},
			{show: true, value: '07', label: 'juli'},
			{show: true, value: '08', label: 'augustus'},
			{show: true, value: '09', label: 'september'},
			{show: true, value: '10', label: 'oktober'},
			{show: true, value: '11', label: 'november'},
			{show: true, value: '12', label: 'december'},
		],
		years: [
			// {
			// 	show: true,
			// 	value: '1970',
			// 	label: '1970'
			// },
		],
		calendar: {
			days: [],
			view: {

				// Current moment we are viewing
				moment: null,

				// Label that is shown on top of view
				label: null,

				// Maximum range the calendar is allowed to have
				from: null,
				to: null,

				// Settings considering month view
				month: {
					previous: null,
					next: null,
				}
			}
		}
	}

	ngOnInit() {

		// Check device type
		this.mobileAndTabletCheck()

		// Set language
		this.calendarSetLocale()

		this.onInputChanges()
	}

	ngOnChanges(changes) {
		if (changes.dateInit) this.onInputChanges()
	}

	onInputChanges() {
		// Init dates
		this.initDates()

		// Render calendar
		this.calendarInit()

		// Check warnings
		this.checkWarnings()
	}

	// this is the initial value set to the component
	public writeValue(exactmoment) {

		// If no moment provided
		if (!exactmoment || !exactmoment.unix) return;

		// Update moment
		this.onDateChange('x', exactmoment.unix)

		// Update calendar
		this.calendarInit()
	}

	// registers 'fn' that will be fired when changes are made this is how we emit the changes back to the form
	public registerOnChange(fn: any) {
		this.propagateChange = fn;
	}

	// not used, used for touch input
	public registerOnTouched() {
	}

	// the method set in registerOnChange, it is just a placeholder for a method that takes one parameter,we use it to emit changes back to the form
	private propagateChange = (_: any) => {
	}

	private doPropagateChange() {

		let value = {
			unix: this.d.moment ? this.d.moment.format('x') : null,
			time: this.d.moment ? this.d.moment.format('HH:mm') : null,
			date: this.d.moment ? this.d.moment.format('DD/MM/YYYY') : null,
		}

		// Emit function
		this.onChange.emit(value)

		// Propagate form change
		this.propagateChange(value)
	}

	// Trigger propagateChange
	private onDateChange(target, value = null) {

		// Check if a date already exists, create new to be able to set
		if(!this.d.moment) this.d.moment = moment()

		if (target === 'clear') {
			this.d.moment = null;
		}
		else if (target === 'YYYY-MM-DD') {

			let split = value.split('-');
			this.d.moment.set('year', split[0])
			this.d.moment.set('month', split[1]).subtract(1, 'month')
			this.d.moment.set('date', split[2])

		} else if (target === 'HH:mm') {

			let split = value.split(':')
			this.d.moment.set('hour', split[0])
			this.d.moment.set('minute', split[1])

		} else if (target === 'x') {
			this.d.moment = moment(value, 'x');
		}
		else if (target === 'year') this.d.moment.set('year', value)
		else if (target === 'month') this.d.moment.set('month', value).subtract(1, 'month')
		else if (target === 'date') this.d.moment.set('date', value)
		else if (target === 'hour') this.d.moment.set('hour', value)
		else if (target === 'second') this.d.moment.set('second', value)
		else if (target === 'millisecond') this.d.moment.set('millisecond', value)

		// Check how many days this month has and update dropdown
		if(this.d.moment) {
			let daysInMonth = this.d.moment.daysInMonth();
			this.d.days.forEach((day, index) => day.show = (index < daysInMonth))
		}

		// Update date selected
		this.updateDateSelected()

		// Check if the set date triggers any warnings
		this.checkWarnings()

		// update the form
		this.doPropagateChange()
	}

	private checkWarnings() {

		this.dateWarning.forEach(warning => {

			// Check if date is selected, otherwise hide warnings
			if(!this.d.moment) return warning.show = false;

			let start 	= moment(this.d.moment).set('hour', 0).set('minute', 0).set('second', 0).set('millisecond', 0)
			let end  	= moment(this.d.today).set('hour', 0).set('minute', 0).set('second', 0).set('millisecond', 0)
			let diff 	= start.diff(end, 'days', true)

			if(false) {}
			else if(warning.type === 'range' && warning.params[0] <= diff && diff <= warning.params[1]) warning.show = true;
			else if(warning.type === 'in-past' && diff < 0) warning.show = true;
			else if(warning.type === 'in-past-or-today' && diff <= 0) warning.show = true;
			else if(warning.type === 'today' && diff === 0) warning.show = true;
			else if(warning.type === 'weekend') { }
			else if(warning.type === 'sunday') { }
			else warning.show = false;

			// Receives an array with warnings
			// - title
			// - message
			// - style [warning, error, success]
			// - type ['range', 'in-past', 'weekend', 'sunday']
			// - (params) [startRange, endRange]

		})
	}

	private initDates() {

		// Set default date
		if(this.dateInit) {
			this.d.moment = this.dateInit['unix'] ? moment(this.dateInit['unix'], 'x') : moment(this.dateInit)
		}

		let fromDate = moment(this.dateFrom)
		let fromYear = parseInt(fromDate.format('YYYY'))

		let toDate = moment(this.dateTo)
		let toYear = parseInt(toDate.format('YYYY'))

		// Create years
		while (fromYear++ <= toYear) {
			this.d.years.push({
				show: true,
				value: '' + (fromYear - 1),
				label: '' + (fromYear - 1),
			})
		}

		// Create times
		for(let i = this.timeRangeFrom; i < this.timeRangeTo; i++) {
			for(let j = 0; j < 60; j = j + this.timePrecision) {
				let label = '' + (i < 10 ? '0' + i : i) + ':' + (j < 10 ? '0' + j : j)
				this.d.times.push({
					show: true,
					label: label,
					value: label,
				})
			}
		}
	}

	onCalendarClear() {
		this.onDateChange('clear')
	}

	onCalendarDateChange(date) {

		// Update the value
		this.onDateChange('YYYY-MM-DD', date)

		// Get old and new month
		let viewMonthCurrent = this.d.calendar.view.moment.format('MM');
		let viewMonthNew = date.substring(5,7);

		// If month changed re-render full calendar
		if(viewMonthCurrent !== viewMonthNew) return this.onCalendarViewChange('month', 0)

		// Only update selected if same month
		this.d.calendar.days.forEach(week => {
			week.forEach(day => {

				// Unselect currently selected date
				if(day.selected) day.selected = false;

				// Select clicked value
				if(day.value === date) day.selected = true;
			})
		})
	}

	onCalendarViewChange(view, value) {

		let calView = this.d.calendar.view;

		// Go to default view
		if(value === 0) calView.moment = moment(this.d.moment || undefined);

		// Move view one unit forward or backward
		if(value === 1 || value === -1) calView.moment.add(value, view);

		// Check if the next or previous buttons have to be disabled
		calView.month.next = moment(calView.moment).endOf('month').add(1, 'day').isBefore(calView.to)
		calView.month.previous = moment(calView.moment).startOf('month').add(-1, 'day').isAfter(calView.from)

		// Rerender the view
		this.calendarRenderDates()

	}

	private calendarInit() {

		let calView = this.d.calendar.view;

		// On init we collect the range in which calendar can operate
		calView.from = moment(this.dateFrom)
		calView.to = moment(this.dateTo)

		// We go to the correct month, this is determined using the selected/init moment
		this.onCalendarViewChange('M', 0)

	}

	private calendarRenderDates() {

		let calView = this.d.calendar.view;

		// Generate calendar
		let calMonth = calView.moment.format('MM');										// The current month we are looking at
		let calMoment = moment(calView.moment).startOf('month').startOf('isoWeek');		// Value that is looped over, may start month ago
		let calSelectMoment = this.d.moment;											// The currently selected moment

		// Set empty calendar
		this.d.calendar.days = [[],[],[],[],[],[],[]]

		// Update label
		calView.label = calView.moment.format('MMMM YYYY')

		// Create 42 units
		for(let i = 0; i < 42; i++) {

			let day = {
				'label': calMoment.format('D'),								// Holds the date number

				'month-previous': calMoment.format('MM') < calMonth,
				'month-current': calMoment.format('MM') === calMonth,
				'month-next': calMoment.format('MM') > calMonth,

				'date-range-before': calMoment.isBefore(calView.from),
				'date-range-after': calMoment.isAfter(calView.to),

				'value': calMoment.format('YYYY-MM-DD'),
				'past': calMoment.isBefore(this.d.today),
				'selected': calMoment.isSame(this.d.moment, 'day'),
				'today': calMoment.isSame(this.d.today, 'day'),
			}

			// Add
			this.d.calendar.days[Math.floor(i/7)].push(day)

			// Go to next day
			calMoment.add(1, 'days')
		}
	}

	private calendarSetLocale() {
		moment.locale(this.language)
	}

	private updateDateSelected() {
		this.d.selected = {
			millisecond: (this.d.moment ? this.d.moment.format('SSS') : null),
			second: (this.d.moment ? this.d.moment.format('ss') : null),
			minute: (this.d.moment ? this.d.moment.format('mm') : null),
			hour: (this.d.moment ? this.d.moment.format('HH') : null),
			date: (this.d.moment ? this.d.moment.format('DD') : null),
			month: (this.d.moment ? this.d.moment.format('MM') : null),
			year: (this.d.moment ? this.d.moment.format('YYYY') : null),

			time: (this.d.moment ? this.d.moment.format('HH:mm') : null),
			zone: 'Europe/Amsterdam'
		}
	}

	private mobileAndTabletCheck() {
		var check = false;
		(function (a) {
			if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true;
		})(navigator.userAgent || navigator.vendor || window['opera']);
		this.mobile = check;
	}
}
