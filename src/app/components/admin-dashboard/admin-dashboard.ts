import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboardComponent {

  public totalSalesToday: number = 2450.00;
  public totalItemsSold: number = 120;
  public criticalAlertsCount: number = 4;

  constructor(private router: Router) {}

  ngOnInit(): void {
    
  }

  public logout(): void {
    this.router.navigate(['/login']);
  }
}
