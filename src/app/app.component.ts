import { Component, OnInit, inject } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { DatePipe } from "@angular/common";

import { PrayerService } from "@shared/services/prayer.service";

@Component({
  selector: 'tap-app',
  standalone: true,
  imports: [RouterOutlet],
  providers:[DatePipe],
  template: `
    <h1>Welcome to {{title}}!</h1>
    Midnight {{ getLocalTime(prayerService.midnightStart) }}<br />
    Fajr {{ getLocalTime(prayerService.fajrStart) }}<br />
    Sunrise {{ getLocalTime(prayerService.sunriseStart) }}<br />
    Ishraq {{ getLocalTime(prayerService.ishraqStart) }}<br />
    Noon {{ getLocalTime(prayerService.middayStart) }}<br />
    Dhur {{ getLocalTime(prayerService.dhurStart) }}<br />
    Asr{{ getLocalTime(prayerService.asrStart) }}<br />
    Sunset{{ getLocalTime(prayerService.sunsetStart) }}<br />
    Maghrib{{ getLocalTime(prayerService.maghribStart) }}<br />
    Isha{{ getLocalTime(prayerService.ishaStart) }}<br />
    Isha End{{ getLocalTime(prayerService.ishaEnd) }}<br />
    <router-outlet />
  `,
  styles: [],
})
export class AppComponent implements OnInit {
  title = "PrayerTimings";

  prayerService = inject(PrayerService);

  datePipe = inject(DatePipe);
  date = new Date();

  ngOnInit(): void {
    this.prayerService.calculatePrayerTime(this.date);
  }

  //TODO make it private and maybe remove it
  public getLocalTime(epochTime: number) {
    //TODO Round off to ceiling
    return this.datePipe.transform(epochTime, "long");
  }

}
