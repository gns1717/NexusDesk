import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';

interface AdminUser { _id: string; name: string; email: string; role: 'user' | 'admin'; createdAt: string; }
interface Overview { users: number; files: number; workspaceItems: number; }

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  template: `
  <div class="shell">
    <aside class="side">
      <div class="brand"><span class="mark">N</span><span>Nexus<span class="lite">Desk</span></span><small>ADMIN</small></div>
      <div class="side-label">MANAGEMENT</div>
      <button class="nav active">▦ &nbsp; Overview</button>
      <button class="nav">♙ &nbsp; Users</button>
      <div class="side-bottom"><div class="admin-tag">ADMIN CONSOLE <span>●</span></div><p>Platform operations</p></div>
    </aside>
    <main class="main">
      <header><div><span class="muted">NexusDesk /</span> <b>Admin overview</b></div><div class="header-right"><span class="live">● SYSTEM ONLINE</span><span class="avatar">A</span></div></header>
      <section class="content">
        <div class="intro"><div><p class="overline">CONTROL CENTER</p><h1>Platform overview</h1><p class="muted">Monitor workspace activity and manage accounts.</p></div><button class="refresh" (click)="load()">↻ &nbsp; Refresh data</button></div>
        <div class="login-panel" *ngIf="!authorized">
          <div class="login-icon">⌘</div><h2>Admin authentication</h2><p>Sign in with an account that has the admin role.</p>
          <label>Admin JWT token</label><input [(ngModel)]="token" type="password" placeholder="Paste your admin access token">
          <button class="action" (click)="connect()">Connect to admin API</button>
          <small class="hint">Create a normal account in the React app, then set its role to <code>admin</code> in MongoDB for local development.</small>
          <p class="error" *ngIf="error">{{error}}</p>
        </div>
        <ng-container *ngIf="authorized">
          <div class="error-banner" *ngIf="error">{{error}}</div>
          <div class="metrics">
            <article><span class="metric-icon purple">♙</span><p>Total users</p><strong>{{overview.users}}</strong><small>Registered accounts</small></article>
            <article><span class="metric-icon blue">▤</span><p>Files stored</p><strong>{{overview.files}}</strong><small>Uploaded files</small></article>
            <article><span class="metric-icon green">▣</span><p>Workspace items</p><strong>{{overview.workspaceItems}}</strong><small>Notes, tasks and docs</small></article>
          </div>
          <div class="table-panel">
            <div class="table-head"><div><h2>User management</h2><p class="muted">Review accounts and manage platform access.</p></div><input class="search" [(ngModel)]="search" placeholder="Search users..."></div>
            <div class="table-wrap"><table><thead><tr><th>USER</th><th>EMAIL</th><th>ROLE</th><th>JOINED</th><th>ACTION</th></tr></thead>
            <tbody><tr *ngFor="let u of filteredUsers"><td><div class="person"><span class="user-avatar">{{u.name.charAt(0).toUpperCase()}}</span><b>{{u.name}}</b></div></td><td>{{u.email}}</td><td><span class="role" [class.admin]="u.role==='admin'">{{u.role}}</span></td><td>{{u.createdAt | date:'mediumDate'}}</td><td><button class="role-btn" (click)="toggleRole(u)">{{u.role==='admin'?'Make user':'Make admin'}}</button><button class="delete-btn" (click)="deleteUser(u)">×</button></td></tr>
            <tr *ngIf="filteredUsers.length===0"><td colspan="5" class="empty">No matching users found.</td></tr></tbody></table></div>
          </div>
        </ng-container>
        <footer>NexusDesk Admin Console <span>·</span> Internal workspace tools</footer>
      </section>
    </main>
  </div>`
})
export class AppComponent implements OnInit {
  token = localStorage.getItem('nexus_admin_token') || '';
  authorized = false;
  error = '';
  search = '';
  overview: Overview = { users: 0, files: 0, workspaceItems: 0 };
  users: AdminUser[] = [];
  constructor(private http: HttpClient) {}
  ngOnInit(): void { if (this.token) this.connect(); }
  get headers(): HttpHeaders { return new HttpHeaders({ Authorization: `Bearer ${this.token}` }); }
  get filteredUsers(): AdminUser[] {
    const q = this.search.toLowerCase();
    return this.users.filter(u => `${u.name} ${u.email} ${u.role}`.toLowerCase().includes(q));
  }
  connect(): void {
    localStorage.setItem('nexus_admin_token', this.token);
    this.load();
  }
  load(): void {
    this.error = '';
    this.http.get<Overview>('http://localhost:5000/api/admin/overview', { headers: this.headers }).subscribe({
      next: data => { this.overview = data; this.authorized = true; this.loadUsers(); },
      error: err => { this.authorized = false; this.error = err.error?.message || 'Could not connect. Check the API and admin token.'; }
    });
  }
  loadUsers(): void {
    this.http.get<AdminUser[]>('http://localhost:5000/api/admin/users', { headers: this.headers }).subscribe({
      next: data => this.users = data,
      error: err => this.error = err.error?.message || 'Could not load users.'
    });
  }
  toggleRole(user: AdminUser): void {
    const role = user.role === 'admin' ? 'user' : 'admin';
    this.http.patch<AdminUser>(`http://localhost:5000/api/admin/users/${user._id}/role`, { role }, { headers: this.headers }).subscribe({
      next: () => this.loadUsers(), error: err => this.error = err.error?.message || 'Role update failed.'
    });
  }
  deleteUser(user: AdminUser): void {
    if (!confirm(`Delete ${user.name} and their workspace data?`)) return;
    this.http.delete(`http://localhost:5000/api/admin/users/${user._id}`, { headers: this.headers }).subscribe({
      next: () => { this.loadUsers(); this.load(); }, error: err => this.error = err.error?.message || 'Delete failed.'
    });
  }
}
