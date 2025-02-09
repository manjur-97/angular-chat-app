import { Component, OnInit } from '@angular/core';
import { Firestore, collection, query, where, getDocs, addDoc, doc, setDoc, onSnapshot, getDoc, deleteDoc, orderBy} from '@angular/fire/firestore';

import { Auth, signOut, User, onAuthStateChanged } from '@angular/fire/auth';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  activeTab = 'friends';
  friends: { uid: string; name: string; avatar?: string }[] = [];
  dummyFriends: { uid: string; name: string; avatar?: string }[] = [];
  allUsers: { uid: string; name: string; avatar?: string }[] = [];
  allFriendRequestedUsers: { uid: string; name: string; avatar?: string }[] = [];
  friendRequests: { id: string; senderId: string; receiverId: string; status: string; name?: string; data: any }[] = [];
  selectedFriend: { uid: string; name: string; avatar?: string } | null = null;
  messages: { sender: string; text: string }[] = [];
  messageText = '';
  currentUser: User | null = null;
  currentUserId = '';
  chatList: any[] = [];
  loginUser: any = null;
  isButtonDisabled: { [key: string]: boolean } = {}; // Track disabled state
  buttonText: { [key: string]: string } = {};
  notes = "You don't have any real-time friends. Send a friend request to connect"

  constructor(private firestore: Firestore, private auth: Auth, private router: Router) { }

  ngOnInit() {
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.currentUser = user;
        this.currentUserId = user.uid;
        this.loadLoginUser()
        this.loadFriends();
        this.loadUsers();
        this.loadFriendRequests();
      }
    });
  }

  async loadLoginUser() {
    if (!this.currentUserId) return;

    const usersRef = collection(this.firestore, 'users');
    const q = query(usersRef, where("uid", "==", this.currentUserId));

    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0]; // Get the first user document
      this.loginUser = { id: userDoc.id, ...userDoc.data() };
    } else {
      this.loginUser = null; // Handle case when user is not found
    }
  }

  async loadFriends() {
    if (!this.currentUserId) return;

    const friendsRef = collection(this.firestore, 'users');
    const q = query(friendsRef, where('friends', 'array-contains', this.currentUserId));
    const friendSnap = await getDocs(q);
    this.friends = friendSnap.docs.map(doc => doc.data() as { uid: string; name: string; avatar?: string });
    if (this.friends.length === 0) {
      this.dummyFriends = [
        { uid: 'dummy1', name: 'Dummy Friend 1', avatar: 'avatar1.png' },
        { uid: 'dummy2', name: 'Dummy Friend 2', avatar: 'avatar2.png' },
        { uid: 'dummy3', name: 'Dummy Friend 3', avatar: 'avatar3.png' }
      ];
    }
  }

  async loadUsers() {
    if (!this.currentUserId) return;

    // Fetch friend requests sent by the current user
    const friendRequestRef = collection(this.firestore, 'friendRequests');
    const friendRequestQuery = query(friendRequestRef, where('senderId', '==', this.currentUserId));
    const friendRequestSnap = await getDocs(friendRequestQuery);

    // Extract receiver IDs from friend requests
    const requestedUserIds = friendRequestSnap.docs.map(doc => doc.data()['receiverId']); // Access using bracket notation

    // Fetch all users
    const usersRef = collection(this.firestore, 'users');
    const userSnap = await getDocs(usersRef);

    // Filter users: Exclude current user & users already requested
    this.allUsers = userSnap.docs
      .map(doc => doc.data() as { uid: string; name: string; avatar?: string })
      .filter(user => user.uid !== this.currentUserId && !requestedUserIds.includes(user.uid));
  }

  // async loadFriendRequests() {
  //   if (!this.currentUserId) return;

  //   const requestsRef = collection(this.firestore, 'friendRequests');
  //   const q = query(requestsRef, where('receiverId', '==', this.currentUserId));
  //   const requestSnap = await getDocs(q);
  //   this.friendRequests = requestSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
  // }

  async loadFriendRequests() {
    if (!this.currentUserId) return;

    // Step 1: Get the friend requests where receiverId is the current user
    const requestsRef = collection(this.firestore, 'friendRequests');
    const q = query(
      requestsRef,
      where('receiverId', '==', this.currentUserId),
      where('status', '==', 'pending') // Filter by status 'pending'
    );
    const requestSnap = await getDocs(q);

    // Step 2: For each request, get the sender user information from the 'users' collection
    this.friendRequests = [];

    for (const requestDoc of requestSnap.docs) {
      const requestData = requestDoc.data() as any;

      // Fetch sender's user data from 'users' collection using senderId
      const senderUserRef = doc(this.firestore, 'users', requestData.senderId);  // Correct reference to the 'users' document
      const senderSnap = await getDoc(senderUserRef);  // Use getDoc to fetch the document
      const senderData = senderSnap.data();  // Get the data of the sender

      // Combine the request data with the sender's information
      this.friendRequests.push({
        id: requestDoc.id,
        senderId: requestData.senderId,
        receiverId: requestData.receiverId,
        status: requestData.status,
        data: senderData  // Add sender's user info
      });
      console.log(this.friendRequests);
    }
  }





  async sendFriendRequest(user: { uid: string; name: string }) {
    if (!this.currentUserId) return;

    const userId = user.uid;
    this.isButtonDisabled[userId] = true;
    this.buttonText[userId] = '...';

    try {
      const requestRef = collection(this.firestore, 'friendRequests');
      await addDoc(requestRef, { senderId: this.currentUserId, receiverId: userId, status: 'pending' });

      this.buttonText[userId] = '✔';

      Swal.fire({
        title: 'Sent',
        text: 'Friend request sent successfully',
        icon: 'success'
      });
      this.loadUsers()
    } catch (error) {
      console.error('Error sending request:', error);
      this.isButtonDisabled[userId] = false;
      this.buttonText[userId] = '+';
    }
  }


  async acceptRequest(request: { id: string; senderId: string }) {
    if (!this.currentUserId) return;
  
    const userId = 'accept' + request.id;
    this.isButtonDisabled[userId] = true;  // Disable the button during the process
    this.buttonText[userId] = '...';  // Show loading indicator
  
    try {
      // Get the sender and receiver user references
      const senderRef = doc(this.firestore, `users/${request.senderId}`);
      const receiverRef = doc(this.firestore, `users/${this.currentUserId}`);
  
      // Fetch the current data of both sender and receiver to ensure 'friends' field exists
      const senderDoc = await getDoc(senderRef);
      const receiverDoc = await getDoc(receiverRef);
  
      // Get the existing friends array or initialize it as an empty array if undefined
      const senderFriends = senderDoc.exists() ? senderDoc.data()?.['friends'] || [] : [];
      const receiverFriends = receiverDoc.exists() ? receiverDoc.data()?.['friends'] || [] : [];
  
      // Update both sender's and receiver's friend lists
      await setDoc(senderRef, { friends: [...senderFriends, this.currentUserId] }, { merge: true });
      await setDoc(receiverRef, { friends: [...receiverFriends, request.senderId] }, { merge: true });
  
      // Delete the friend request from the friendRequests collection
      const requestRef = doc(this.firestore, `friendRequests/${request.id}`);
      await deleteDoc(requestRef);  // Delete the friend request document
  
      // Update button text and re-enable the button
      this.buttonText[userId] = '✔';  // Set button text to success icon
      this.isButtonDisabled[userId] = false;  // Re-enable the button
  
      // Success message
      Swal.fire({
        title: 'Accepted!',
        text: 'Friend request accepted successfully.',
        icon: 'success'
      });
  
      // Reload the friend requests to update the UI
      this.loadFriendRequests();
      this. loadFriends()
  
    } catch (error) {
      // In case of any errors, log and show an error message
      console.error('Error accepting friend request:', error);
      this.buttonText[userId] = '❌';  // Show an error icon on the button
      this.isButtonDisabled[userId] = false;  // Re-enable the button
      Swal.fire({
        title: 'Error!',
        text: 'An error occurred while accepting the friend request.',
        icon: 'error'
      });
    }
  }
  
  

  async declineRequest(request: { id: string }) {
    alert(`Declined friend request`);
  }

  selectFriend(friend: { uid: string; name: string; avatar?: string }) {
    this.selectedFriend = friend;
    const messagesRef = collection(this.firestore, 'messages');
    const q = query(
      messagesRef,
      where('chatId', '==', this.getChatId(friend.uid)),
      orderBy('timestamp')  // Order by the 'timestamp' field in ascending order (default)
    );

    onSnapshot(q, (snapshot) => {
      this.messages = snapshot.docs.map(doc => doc.data() as { sender: string; text: string });
    });
  }

  async sendMessage() {
    if (!this.messageText.trim() || !this.selectedFriend || !this.currentUserId) return;

    const messagesRef = collection(this.firestore, 'messages');
    await addDoc(messagesRef, {
      chatId: this.getChatId(this.selectedFriend.uid),
      text: this.messageText,
      sender: this.currentUserId,
      timestamp: new Date()
    });

    this.messageText = '';
  }

  getChatId(friendId: string) {
    return this.currentUserId < friendId ? `${this.currentUserId}_${friendId}` : `${friendId}_${this.currentUserId}`;
  }

  async logout() {
    await signOut(this.auth);
    this.router.navigate(['/login']);
  }
}
