import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, query, orderBy, limit } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  constructor(private firestore: Firestore) {}

  // Send a message
  sendMessage(message: string, userId: string, userName: string, status:string) {
    const messagesRef = collection(this.firestore, 'messages');
    return addDoc(messagesRef, {
      text: message,
      userId: userId,
      userName: userName,
      timestamp: new Date(),
      status:'unseen'
    });
  }

  // Get messages
  getMessages(): Observable<any[]> {
    const messagesRef = collection(this.firestore, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'), limit(100));
    return collectionData(q, { idField: 'id' }) as Observable<any[]>;
  }
}