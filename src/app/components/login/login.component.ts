import { Component } from '@angular/core';
import { Auth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, onAuthStateChanged  } from '@angular/fire/auth';

import { FormsModule, NgForm } from '@angular/forms'; // Import FormsModule
import { CommonModule } from '@angular/common'; // Import CommonModule
import { Router } from '@angular/router';
@Component({
  selector: 'app-login',
    standalone: true, // Mark this as a standalone component
    imports: [FormsModule, CommonModule], // Add FormsModule and CommonModule here
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email = '';
  password= '';
  errorMessage = '';

  constructor(private auth: Auth,  private router: Router) {
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.router.navigate(['/chat']);  // Auto redirect to chat page
      }
    });
  }

  async login() {
   
    try {

      await signInWithEmailAndPassword(this.auth, this.email, this.password);
      this.router.navigate(['/chat']);
    } catch (error: any) {
      this.errorMessage = error.message;
    }
  }

  async loginWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(this.auth, provider);
      this.router.navigate(['/chat']);
    } catch (error: any) {
      this.errorMessage = error.message;
    }
  }
}
