import { IExportedReport } from '../interfaces/exported-report.interface'
import { createReducer, on } from '@ngrx/store'
import {
    enqueExportEnd, updateExportQueueEnd, setLimitReached, clearExportQueue
} from './export.action'
import { IAppState } from '../../../../store/index'

export class ExportState {
    exportedReports: { [id: string]: IExportedReport }
    exportLimitReached = false
}

export const exportReducer = createReducer(
    new ExportState(),
    on(enqueExportEnd, (state, { report }) => ( report?.id
        ? { ...state, exportedReports: { ...state.exportedReports, [report.id]: report } }
        : state
    )),
    on(updateExportQueueEnd, (state, { reports }) => {
        if (reports?.length) {
            const exportedReports = reports.reduce((acc, report) => {
            const name = state.exportedReports?.[report?.id]?.name
            if (report?.id && name) {
                return { ...acc, [report.id]: { ...report, name } }
            }
            return acc
            }, {})
            return {...state, exportedReports: { ...state.exportedReports, ...exportedReports }}
        }
        return state
    }),
    on(setLimitReached, (state, { limitReached }) => ({...state, exportLimitReached: limitReached})),
    on(clearExportQueue, (state, { reportIds }) => {
        const exportedReports = { ...state.exportedReports }
        reportIds.forEach(id => {
            delete exportedReports[id]
        })
        return {...state, exportedReports}
    })
)

export const getExportState = (state: IAppState) => state.export
