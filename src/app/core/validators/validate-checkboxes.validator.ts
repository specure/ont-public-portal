import { ValidatorFn, UntypedFormGroup } from '@angular/forms'

export function validateCheckboxes(minRequired = 1, maxRequired = 6): ValidatorFn {
  return function validate(formGroup: UntypedFormGroup) {
    let checked = 0

    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.controls[key]

      if (control.value === true) {
        checked++
      }
    })

    if (checked < minRequired || checked > maxRequired) {
      return {
        requireCheckboxToBeChecked: true,
      }
    }

    return null
  }
}
