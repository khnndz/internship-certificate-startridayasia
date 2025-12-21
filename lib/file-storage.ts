import fs from 'fs';
import path from 'path';

// GitHub configuration
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER;
const GITHUB_REPO = process.env.GITHUB_REPO;
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';
const CERTIFICATES_PATH = 'public/certificates';

const isProduction = process.env.VERCEL_ENV === 'production' || process.env.VERCEL_ENV === 'preview';
const useGitHub = isProduction && GITHUB_TOKEN && GITHUB_OWNER && GITHUB_REPO;

interface GitHubFileResponse {
  content: string;
  sha: string;
  download_url: string;
}

/**
 * Upload file ke GitHub repository
 */
async function uploadFileToGitHub(fileName: string, content: Buffer): Promise<boolean> {
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${CERTIFICATES_PATH}/${fileName}`;
  
  const base64Content = content.toString('base64');
  
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `Upload certificate: ${fileName}`,
      content: base64Content,
      branch: GITHUB_BRANCH,
    }),
  });

  if (!response.ok) {
    console.error('GitHub Upload Error:', response.status, await response.text());
    return false;
  }

  return true;
}

/**
 * Download file dari GitHub repository
 */
async function downloadFileFromGitHub(fileName: string): Promise<Buffer | null> {
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${CERTIFICATES_PATH}/${fileName}?ref=${GITHUB_BRANCH}`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    console.error('GitHub Download Error:', response.status);
    return null;
  }

  const data: GitHubFileResponse = await response.json();
  return Buffer.from(data.content, 'base64');
}

/**
 * Hapus file dari GitHub repository
 */
async function deleteFileFromGitHub(fileName: string): Promise<boolean> {
  // First, get the file SHA
  const getUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${CERTIFICATES_PATH}/${fileName}?ref=${GITHUB_BRANCH}`;
  
  const getResponse = await fetch(getUrl, {
    headers: {
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });

  if (!getResponse.ok) {
    console.error('GitHub Get SHA Error:', getResponse.status);
    return false;
  }

  const fileData: GitHubFileResponse = await getResponse.json();
  
  // Now delete with SHA
  const deleteUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${CERTIFICATES_PATH}/${fileName}`;
  
  const deleteResponse = await fetch(deleteUrl, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `Delete certificate: ${fileName}`,
      sha: fileData.sha,
      branch: GITHUB_BRANCH,
    }),
  });

  if (!deleteResponse.ok) {
    console.error('GitHub Delete Error:', deleteResponse.status, await deleteResponse.text());
    return false;
  }

  return true;
}

/**
 * Cek apakah file ada di GitHub
 */
async function fileExistsInGitHub(fileName: string): Promise<boolean> {
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${CERTIFICATES_PATH}/${fileName}?ref=${GITHUB_BRANCH}`;
  
  const response = await fetch(url, {
    method: 'HEAD',
    headers: {
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });

  return response.ok;
}

// ============ PUBLIC API ============

/**
 * Simpan file certificate
 */
export async function saveCertificateFile(fileName: string, content: Buffer): Promise<boolean> {
  if (useGitHub) {
    return await uploadFileToGitHub(fileName, content);
  }

  // Local development - use file system
  try {
    const certificatesDir = path.join(process.cwd(), 'public', 'certificates');
    if (!fs.existsSync(certificatesDir)) {
      fs.mkdirSync(certificatesDir, { recursive: true });
    }
    const filePath = path.join(certificatesDir, fileName);
    fs.writeFileSync(filePath, content);
    return true;
  } catch (error) {
    console.error('Error saving file locally:', error);
    return false;
  }
}

/**
 * Baca file certificate
 */
export async function getCertificateFile(fileName: string): Promise<Buffer | null> {
  if (useGitHub) {
    return await downloadFileFromGitHub(fileName);
  }

  // Local development - use file system
  try {
    const filePath = path.join(process.cwd(), 'public', 'certificates', fileName);
    if (!fs.existsSync(filePath)) {
      return null;
    }
    return fs.readFileSync(filePath);
  } catch (error) {
    console.error('Error reading file locally:', error);
    return null;
  }
}

/**
 * Hapus file certificate
 */
export async function deleteCertificateFile(fileName: string): Promise<boolean> {
  if (useGitHub) {
    return await deleteFileFromGitHub(fileName);
  }

  // Local development - use file system
  try {
    const filePath = path.join(process.cwd(), 'public', 'certificates', fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return true;
  } catch (error) {
    console.error('Error deleting file locally:', error);
    return false;
  }
}

/**
 * Cek apakah file certificate ada
 */
export async function certificateFileExists(fileName: string): Promise<boolean> {
  if (useGitHub) {
    return await fileExistsInGitHub(fileName);
  }

  // Local development - use file system
  const filePath = path.join(process.cwd(), 'public', 'certificates', fileName);
  return fs.existsSync(filePath);
}

/**
 * Get URL untuk download certificate
 * Di production, gunakan API route karena file disimpan di GitHub
 * Di development, bisa langsung akses dari public folder
 */
export function getCertificateDownloadUrl(fileName: string): string {
  // Selalu gunakan API route untuk konsistensi
  return `/api/download/${encodeURIComponent(fileName)}`;
}
