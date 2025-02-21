import { Component } from '@angular/core';
import { Auth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, onAuthStateChanged  } from '@angular/fire/auth';
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

import { FormsModule, NgForm } from '@angular/forms'; // Import FormsModule
import { CommonModule } from '@angular/common'; // Import CommonModule
import { Router } from '@angular/router';
@Component({
  selector: 'app-login',
    standalone: true,
    imports: [FormsModule, CommonModule],
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
        this.router.navigate(['/chat']);  
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
        const result = await signInWithPopup(this.auth, provider);
        const user = result.user;

      
        const db = getFirestore();
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            await setDoc(userRef, {
                uid: user.uid,
                name: user.displayName || "Unknown",
                email: user.email,
                password: "123456", 
                createdAt: serverTimestamp() 
            });
        }

      
        this.router.navigate(['/chat']);
    } catch (error: any) {
        this.errorMessage = error.message;
    }
}
}
