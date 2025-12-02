import { Component, OnDestroy, ViewChild } from '@angular/core'
import { select, Store } from '@ngrx/store'
import {
  catchError,
  map,
  Observable,
  of,
  ReplaySubject,
  Subject,
  takeUntil,
  tap,
} from 'rxjs'
import {
  parseFigures,
  parseUnderlinedText,
} from 'src/app/core/helpers/parse-custom-tags'
import { IAppState } from 'src/app/store'
import { getMainState } from 'src/app/store/main/main.reducer'
import { marked } from 'marked'
import { TranslatePipe } from 'src/app/modules/shared/partials/pipes/translate.pipe'
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormGroupDirective,
  Validators,
} from '@angular/forms'
import { MainHttpService } from '../../services/main-http.service'
import { ICountry } from '../../interfaces/country.interface'
import { ReCaptchaV3Service } from 'ng-recaptcha'
import {
  IFeedback,
  IFeedbackControls,
} from '../../interfaces/feedback.interface'
import { postFeedback } from 'src/app/store/main/main.action'

@Component({
    selector: 'nt-contact',
    templateUrl: './contact.component.html',
    styleUrls: ['./contact.component.scss'],
    standalone: false
})
export class ContactComponent implements OnDestroy {
  @ViewChild(FormGroupDirective) formGroupDirective: FormGroupDirective

  countriesFilterCtrl = new FormControl<string>('')
  countries$ = this.mainHttp.countries$.pipe(
    tap((countries) => {
      this.countries = countries
      this.filteredCountries$.next(countries.slice())
      this.countriesFilterCtrl.valueChanges
        .pipe(takeUntil(this.onDestroy))
        .subscribe(() => {
          this.filterCountries()
        })
    })
  )
  countries: ICountry[]
  filteredCountries$: ReplaySubject<ICountry[]> = new ReplaySubject<ICountry[]>(
    1
  )
  form: FormGroup
  page$: Observable<string> = this.store.pipe(
    select(getMainState),
    map((s) => {
      this.initForm(s.feedback)
      if (!s.page) {
        return ''
      }
      const translatedPage = parseUnderlinedText(
        this.translate.transform(s.page, 'content')
      )
      if (!translatedPage) {
        return ''
      }
      return parseFigures(marked.parse(translatedPage) as string)
    })
  )
  private onDestroy = new Subject()

  constructor(
    private fb: FormBuilder,
    private mainHttp: MainHttpService,
    private recaptchaV3: ReCaptchaV3Service,
    private store: Store<IAppState>,
    private translate: TranslatePipe
  ) {}

  ngOnDestroy(): void {
    this.onDestroy.next(void 0)
    this.onDestroy.complete()
  }

  submit() {
    this.recaptchaV3
      .execute('submitFeedback')
      .pipe(
        takeUntil(this.onDestroy),
        catchError((err) => {
          console.error('err', err)
          return of(null)
        })
      )
      .subscribe((sessionToken) => {
        const feedback: IFeedback = {
          ...this.form.value,
          sessionToken,
        }
        this.store.dispatch(postFeedback({ feedback }))
      })
  }

  private initForm(feedback?: IFeedback) {
    this.form = this.fb.group<IFeedbackControls>({
      fullName: new FormControl(
        feedback?.fullName ?? '',
        Validators.pattern(/^[\p{Letter}\p{Mark}\s-]{3,80}$/u)
      ),
      email: new FormControl(feedback?.email ?? '', [
        Validators.required,
        Validators.email,
        Validators.max(255),
      ]),
      country: new FormControl(
        feedback?.country ?? '',
        Validators.pattern(/^[\p{Letter}\p{Mark}\s-]{3,60}$/u)
      ),
      message: new FormControl(feedback?.message ?? '', [
        Validators.required,
        Validators.min(3),
        Validators.max(8000),
      ]),
      sendCopyToUser: new FormControl(feedback?.sendCopyToUser ?? false),
      privacyPolicyAccepted: new FormControl(
        feedback?.privacyPolicyAccepted ?? false,
        Validators.requiredTrue
      ),
    })
    this.formGroupDirective?.resetForm()
  }

  private filterCountries() {
    if (!this.countries) {
      return
    }
    // get the search keyword
    let search = this.countriesFilterCtrl.value
    if (!search) {
      this.filteredCountries$.next(this.countries.slice())
      return
    } else {
      search = search.toLowerCase()
    }
    // filter the banks
    this.filteredCountries$.next(
      this.countries.filter(
        (country) => country.name.common.toLowerCase().indexOf(search) > -1
      )
    )
  }
}
