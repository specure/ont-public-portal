import { FormControl } from '@angular/forms'

export interface IFeedback {
  fullName: string
  email: string
  country: string
  message: string
  sendCopyToUser: boolean
  privacyPolicyAccepted: boolean
  sessionToken: string
}

export interface IFeedbackControls {
  fullName: FormControl<string>
  email: FormControl<string>
  country: FormControl<string>
  message: FormControl<string>
  sendCopyToUser: FormControl<boolean>
  privacyPolicyAccepted: FormControl<boolean>
}
