import { IFeedback } from '../interfaces/feedback.interface'

export class DefaultFeedback implements IFeedback {
  static instance = new DefaultFeedback()

  fullName = ''
  email = ''
  country = ''
  message = ''
  sendCopyToUser = false
  privacyPolicyAccepted = false
  sessionToken = ''

  private constructor() {}
}
