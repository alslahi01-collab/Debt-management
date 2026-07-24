import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, User, signOut } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { exportBackupJSON, importBackupJSON } from './storage';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);

let cachedAccessToken: string | null = null;

export const getCachedAccessToken = () => cachedAccessToken;

export interface DriveBackupFile {
  id: string;
  name: string;
  date: string;
  size: string;
  createdTime?: string;
}

// 1. Google Sign-In with Google Drive Scope
export const signInWithGoogleDrive = async (): Promise<{ user: User; accessToken: string }> => {
  const provider = new GoogleAuthProvider();
  provider.addScope('https://www.googleapis.com/auth/drive.file');
  provider.setCustomParameters({
    prompt: 'select_account',
  });

  const result = await signInWithPopup(auth, provider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  
  if (!credential?.accessToken) {
    throw new Error('تعذر الحصول على رمز الوصول من جوجل (Access Token)');
  }

  cachedAccessToken = credential.accessToken;
  return { user: result.user, accessToken: cachedAccessToken };
};

export const signOutGoogleDrive = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

// Helper fetch with Bearer token
const fetchWithToken = async (url: string, options: RequestInit = {}, token: string) => {
  const headers = new Headers(options.headers || {});
  headers.set('Authorization', `Bearer ${token}`);
  return fetch(url, { ...options, headers });
};

// 2. Get or Create "إدارة الديون - النسخ الاحتياطية" Folder
export const getOrCreateBackupFolder = async (token: string): Promise<string> => {
  const folderName = 'إدارة الديون - النسخ الاحتياطية';
  
  // Search for folder
  const query = encodeURIComponent(`name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`);
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`;
  
  const searchRes = await fetchWithToken(searchUrl, { method: 'GET' }, token);
  if (!searchRes.ok) {
    const err = await searchRes.json().catch(() => ({}));
    throw new Error(err.error?.message || 'فشل البحث عن مجلد التطبيق في Google Drive');
  }

  const searchData = await searchRes.json();
  if (searchData.files && searchData.files.length > 0) {
    return searchData.files[0].id;
  }

  // Create folder if not found
  const createRes = await fetchWithToken(
    'https://www.googleapis.com/drive/v3/files?fields=id',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
      }),
    },
    token
  );

  if (!createRes.ok) {
    const err = await createRes.json().catch(() => ({}));
    throw new Error(err.error?.message || 'فشل إنشاء مجلد النسخ الاحتياطية على Google Drive');
  }

  const createData = await createRes.json();
  return createData.id;
};

// 3. Upload Backup JSON File to Google Drive
export const uploadBackupToGoogleDrive = async (token: string): Promise<DriveBackupFile> => {
  const folderId = await getOrCreateBackupFolder(token);
  const backupJSON = exportBackupJSON();

  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }).replace(':', '-');
  const fileName = `إدارة_الديون_نسخة_احتياطية_${dateStr}_${timeStr}.json`;

  const metadata = {
    name: fileName,
    parents: [folderId],
    mimeType: 'application/json',
  };

  const boundary = 'foo_bar_baz';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    backupJSON +
    closeDelimiter;

  const uploadRes = await fetchWithToken(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,size,createdTime',
    {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    },
    token
  );

  if (!uploadRes.ok) {
    const err = await uploadRes.json().catch(() => ({}));
    throw new Error(err.error?.message || 'فشل رفع ملف النسخة الاحتياطية إلى Google Drive');
  }

  const fileData = await uploadRes.json();
  const createdDate = fileData.createdTime ? new Date(fileData.createdTime) : new Date();

  return {
    id: fileData.id,
    name: fileData.name,
    date: createdDate.toLocaleDateString('ar-YE') + ' ' + createdDate.toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' }),
    size: `${(backupJSON.length / 1024).toFixed(1)} KB`,
    createdTime: fileData.createdTime,
  };
};

// 4. List Backup Files from "إدارة الديون - النسخ الاحتياطية" Folder
export const listDriveBackups = async (token: string): Promise<DriveBackupFile[]> => {
  try {
    const folderId = await getOrCreateBackupFolder(token);
    const query = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
    const url = `https://www.googleapis.com/drive/v3/files?q=${query}&orderBy=createdTime desc&fields=files(id,name,size,createdTime)`;

    const res = await fetchWithToken(url, { method: 'GET' }, token);
    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    return (data.files || []).map((f: any) => {
      const createdDate = f.createdTime ? new Date(f.createdTime) : new Date();
      return {
        id: f.id,
        name: f.name,
        date: createdDate.toLocaleDateString('ar-YE') + ' ' + createdDate.toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' }),
        size: f.size ? `${(Number(f.size) / 1024).toFixed(1)} KB` : '1.0 KB',
        createdTime: f.createdTime,
      };
    });
  } catch {
    return [];
  }
};

// 5. Download and Restore File from Google Drive
export const downloadAndRestoreFromDrive = async (token: string, fileId: string): Promise<boolean> => {
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
  const res = await fetchWithToken(url, { method: 'GET' }, token);

  if (!res.ok) {
    throw new Error('تعذر تحميل ملف النسخة الاحتياطية من جوجل درايف');
  }

  const jsonText = await res.text();
  return importBackupJSON(jsonText);
};
