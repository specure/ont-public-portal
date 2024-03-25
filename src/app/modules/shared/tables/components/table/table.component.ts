import { ActionCreator } from '@ngrx/store'
import {
  Component,
  Input,
  OnInit,
  Output,
  EventEmitter,
  ViewChild,
  OnChanges,
  SimpleChanges,
} from '@angular/core'
import { MatSort } from '@angular/material/sort'
import { TypedAction } from '@ngrx/store/src/models'

import { arrowRotate } from 'src/app/core/animations/arrow-rotate.animation'
import { IBasicRequest } from 'src/app/core/interfaces/basic-request.interface'
import { IBasicResponse } from 'src/app/core/interfaces/basic-response.interface'
import { IPaginator } from 'src/app/core/interfaces/paginator.interface'
import { ISort } from 'src/app/core/interfaces/sort.interface'
import { ITableColumn } from '../../interfaces/table-column.interface'
import { TableSortService } from 'src/app/core/services/table-sort.service'
import { PageEvent } from '@angular/material/paginator'
import { AVAILABLE_SIZES } from 'src/app/core/classes/paginator.class'
import { TranslocoService } from '@ngneat/transloco'
import { expandVertically } from 'src/app/core/animations/detail-expand.animation'
import { MatTable } from '@angular/material/table'

@Component({
  selector: 'nt-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  animations: [arrowRotate, expandVertically],
})
export class TableComponent implements OnInit, OnChanges {
  @Input() action: ActionCreator<
    string,
    (props: { request: IBasicRequest }) => IBasicRequest & TypedAction<string>
  >
  @Input() columns: ITableColumn[]
  @Input() data: IBasicResponse<any>
  @Input() expandedColumns: ITableColumn[]
  @Input() expandedElements: (string | number)[] = []
  @Input() expandedTableClassNames: string[]
  @Input() identifyField: string
  @Input() tableClassNames: string[]
  @Input() tableTranslatePrefix: string
  @Input() paginator: IPaginator
  @Input() shouldHideHeader: boolean
  @Input() sort: ISort
  @Input() subHeaderColumns: ITableColumn[]

  @Output() toggleExpandableRow = new EventEmitter<string | number>()

  @ViewChild(MatTable) table: MatTable<any>

  AVAILABLE_SIZES = AVAILABLE_SIZES
  displayedColumns: string[]
  displayedSubHeaderColumns: string[]

  constructor(
    private tableSortService: TableSortService,
    public transloco: TranslocoService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if ('data' in changes) {
      this.table?.removeHeaderRowDef(null)
    }
  }

  ngOnInit() {
    this.displayedColumns = this.columns?.map((col) => col.columnDef)
    this.displayedSubHeaderColumns = this.subHeaderColumns?.map(
      (col) => col.columnDef
    )
  }

  changeSort(newSort: MatSort) {
    this.tableSortService.changeSort(newSort, this.action)
  }

  getDefaultValue(column: ITableColumn, element: any, i: number) {
    if (column.transformValue) {
      const transformed = column.transformValue(element, column, i)
      if (typeof transformed === 'number') {
        return transformed.toLocaleString()
      }
      return transformed
    }

    const value = element[column.key || column.columnDef]

    if (typeof value === 'number') {
      return value.toLocaleString()
    }
    return value || '-'
  }

  changePage(pageEvent: PageEvent) {
    this.tableSortService.changePage(pageEvent, this.action)
  }

  shouldShowText(column: ITableColumn, element): boolean {
    const isLinkDisabled =
      column.link && column.linkDisabled && column.linkDisabled(element)
    return !column.link || isLinkDisabled
  }

  identify(index: number, item: any) {
    return item[this.identifyField || 'id']
  }

  isElementExpanded(elementId: number | string): boolean {
    return this.expandedElements.includes(elementId)
  }

  justify(column: ITableColumn) {
    const { justify } = column
    switch (justify) {
      case 'center':
        return {
          justifyContent: justify,
          textAlign: justify,
        }
      case 'flex-end':
        return {
          justifyContent: justify,
          textAlign: 'right',
        }
      case 'flex-start':
      default:
        return {
          justifyContent: 'flex-start',
          textAlign: 'left',
        }
    }
  }
}
