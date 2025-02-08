import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms'; // Import FormsModule
import { CommonModule } from '@angular/common'; // Import CommonModule
import { Router } from '@angular/router';
import { Auth, createUserWithEmailAndPassword , onAuthStateChanged,signInWithPopup, GoogleAuthProvider,} from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-register',
  standalone: true, // Mark this as a standalone component
  imports: [FormsModule, CommonModule], // Add FormsModule and CommonModule here
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerData = {
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  };


  errorMessage: string = '';

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private router: Router
  ) {
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.router.navigate(['/chat']);  // Auto redirect to chat page
      }
    });
  }

  async onRegister() {
    if (this.registerData.password !== this.registerData.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        this.registerData.email,
        this.registerData.password
      );

      const user = userCredential.user;
      const uid = user.uid;

      const userDocRef = doc(this.firestore, `users/${uid}`);
      await setDoc(userDocRef, {
        uid: uid,
        name: this.registerData.name,
        email: this.registerData.email,
        password: this.registerData.password,
        createdAt: new Date()
      });

      this.router.navigate(['/chat']);
    } catch (error: any) {
      this.errorMessage = error.message || 'An error occurred during registration.';
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
