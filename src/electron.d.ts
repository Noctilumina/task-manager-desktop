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
  startGoogleAuth: () => Promise<string>;
}

declare interface Window {
  electronAPI: ElectronAPI;
}
