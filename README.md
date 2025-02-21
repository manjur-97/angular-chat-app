AngularChatApp

This is a real-time chat application built with Angular. It allows users to send and receive messages instantly, creating a seamless messaging experience. The application is powered by Firebase for user authentication and message storage.

## Features

- Real-time chat functionality
- User authentication with Firebase
- Responsive UI built with Angular
- Firebase backend for storing messages and user data

## Prerequisites

To get started, make sure you have the following installed on your machine:

- **Node.js** (version >= 14.x)
- **Angular CLI** (version 19.1.5 or later)
- **Firebase Account** for setting up Firebase services

## Getting Started

Follow these steps to run the application locally.

### 1. Clone the Repository

Clone this repository to your local machine:

```bash
git clone https://github.com/manjur-97/angular-chat-app.git
2. Install Dependencies
Navigate to the project directory and install the necessary dependencies:

bash
Copy
Edit
cd AngularChatApp
npm install
3. Configure Firebase
To connect the app with Firebase, create a Firebase project and get your configuration details. Then, update the Firebase configuration in the src/environments/environment.ts file:

typescript
Copy
Edit
export const environment = {
  production: false,
  firebaseConfig: {
    apiKey: "your-api-key",
    authDomain: "your-auth-domain",
    projectId: "your-project-id",
    storageBucket: "your-storage-bucket",
    messagingSenderId: "your-messaging-sender-id",
    appId: "your-app-id",
    measurementId: "your-measurement-id"
  }
};
4. Start the Development Server
Run the development server with the following command:

bash
Copy
Edit
ng serve
Once the server is running, navigate to http://localhost:4200/ in your browser to see the app in action. The app will automatically reload if you modify any of the source files.

Project Structure
Here’s an overview of the important files and folders in this project:

src/app: Contains the main components, services, and models for the app.
src/environments: Contains the environment configuration files, including Firebase credentials.
src/assets: Stores static assets such as images and styles.
Building the Project
To build the project for production, run:

bash
Copy
Edit
ng build --prod
This will compile and store the build artifacts in the dist/ directory, optimized for performance.

Running Tests
To execute unit tests, run:

bash
Copy
Edit
ng test
For end-to-end tests, run:

bash
Copy
Edit
ng e2e
Contributing
If you would like to contribute to this project, please fork the repository and submit a pull request. Any contributions are welcome!

License
This project is open-source and available under the MIT License.

markdown
Copy
Edit

### Corrections made:
1. Fixed the `git clone` URL and placed it in the correct Markdown format.
2. Corrected the closing of code blocks for the `Install Dependencies` and `Configure Firebase` sections.
3. Ensured consistent formatting for code blocks and command sections.

This should work perfectly now! Let me know if you need further assistance.
