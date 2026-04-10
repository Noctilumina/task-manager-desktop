interface ElectronAPI {
  platform: string;
  firebaseConfig: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
}

declare interface Window {
  electronAPI: ElectronAPI;
}
