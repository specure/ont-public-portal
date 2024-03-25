// tslint:disable: variable-name
import { IUserSettingsRequest } from '../interfaces/user-settings-request.interface'
import dayjs from 'dayjs/esm'
import utc from 'dayjs/esm/plugin/utc'
import tz from 'dayjs/esm/plugin/timezone'

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
