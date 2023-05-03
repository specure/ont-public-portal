import { Component, OnInit, Input, AfterViewChecked, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core'

enum ECardAppearance {
  BODY_EXPANDED = 'body-expanded',
  HEADER_COLLAPSED = 'header-collapsed',
  PAGE_HEADER = 'page-header',
  WIDGET = 'widget',
  INVERTED = 'inverted',
  FULL_WIDTH = 'full-width',
}

@Component({
  selector: 'nt-general-card',
  templateUrl: './general-card.component.html',
  styleUrls: ['./general-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GeneralCardComponent {
  @Input() appearance: ECardAppearance
  @Input() iconStyle: string
  @Input() matIcon: string
  @Input() title: string

  constructor() { }

}
