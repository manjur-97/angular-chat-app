import { Component, OnInit } from '@angular/core';
import { Firestore, collection, query, where, getDocs, addDoc } from '@angular/fire/firestore';
import { Auth , signOut} from '@angular/fire/auth';
import { FormsModule, NgForm } from '@angular/forms'; // Import FormsModule
import { CommonModule } from '@angular/common'; // Import CommonModule
import { Router } from '@angular/router';



@Component({
  selector: 'app-chat',
  standalone: true, // Mark this as a standalone component
  imports: [FormsModule, CommonModule], // Add FormsModule and CommonModule here
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  chatList: any[] = [];
  messages: any[] = [];
  selectedChat: any = null;
  newMessage: string = '';
  currentUser: string = '';

  constructor(private firestore: Firestore, private auth: Auth, private router: Router) {}
  async logout() {
    await signOut(this.auth);
    this.router.navigate(['/login']);  // Redirect to login page
  }
  async ngOnInit() {
    this.currentUser = this.auth.currentUser?.uid || '';
    this.loadChats();
  }

  async loadChats() {
    const chatRef = collection(this.firestore, 'chats');
    const chatSnap = await getDocs(chatRef);
    this.chatList = chatSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async selectChat(chat: any) {
    this.selectedChat = chat;
    const messagesRef = collection(this.firestore, 'messages');
    const q = query(messagesRef, where('chatId', '==', chat.id));
    const msgSnap = await getDocs(q);
    this.messages = msgSnap.docs.map(doc => doc.data());
  }

  async sendMessage() {
    if (!this.newMessage.trim()) return;
    const messagesRef = collection(this.firestore, 'messages');
    await addDoc(messagesRef, {
      chatId: this.selectedChat.id,
      text: this.newMessage,
      sender: this.currentUser,
      timestamp: new Date()
    });
    this.messages.push({ text: this.newMessage, sender: this.currentUser });
    this.newMessage = '';
  }
}
