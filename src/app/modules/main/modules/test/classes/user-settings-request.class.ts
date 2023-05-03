// tslint:disable: variable-name
import { IUserSettingsRequest } from '../interfaces/user-settings-request.interface'
import * as dayjs from 'dayjs'
import * as utc from 'dayjs/plugin/utc'
import * as tz from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(tz)

export class UserSettingsRequest implements IUserSettingsRequest {
  language = 'en'
  timezone = dayjs.tz.guess()
  name = 'NetTest'
  terms_and_conditions_accepted = true
  type = 'DESKTOP'
  uuid: string
  version_code = 1
  version_name = 1.0
}
