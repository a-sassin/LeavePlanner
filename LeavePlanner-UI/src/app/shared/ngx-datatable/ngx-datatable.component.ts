import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-ngx-datatable',
  templateUrl: './ngx-datatable.component.html',
  styleUrls: ['./ngx-datatable.component.scss'],
})
export class NgxDatatableComponent {
  @Input() rows: any;
  @Output() editLeaveData = new EventEmitter<any>();
  @Output() cancelLeaveData = new EventEmitter<any>();
  onEditLeave(data: any): any {
    this.editLeaveData.emit(data);
  }
  onCancelLeave(data: any): any {
    this.cancelLeaveData.emit(data);
  }
  reasonLength(name: any): any {
    name = '' + name;
    if (name.length > 30) {
      name = name.slice(0, 30) + '...';
    }
    return name;
  }
}
