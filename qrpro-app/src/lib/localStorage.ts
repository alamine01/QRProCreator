// Système de stockage local temporaire pour les documents
// Ceci est une solution temporaire en attendant que Firebase Storage soit configuré

interface LocalDocument {
  id: string;
  name: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  filePath: string;
  publicUrl: string;
  qrCodePath?: string;
  uploadedBy: string;
  uploadedAt: string;
  isActive: boolean;
  downloadCount: number;
  description?: string;
  mimeType: string;
  fileData?: string; // Base64 encoded file data
}

// Stockage en mémoire (sera perdu au redémarrage du serveur)
let localDocuments: LocalDocument[] = [];

export const saveDocumentLocally = (document: LocalDocument): string => {
  const id = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const documentWithId = { ...document, id };
  localDocuments.push(documentWithId);
  return id;
};

export const getAllLocalDocuments = (): LocalDocument[] => {
  return localDocuments.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
};

export const getLocalDocumentById = (id: string): LocalDocument | null => {
  return localDocuments.find(doc => doc.id === id) || null;
};

export const deleteLocalDocument = (id: string): boolean => {
  const index = localDocuments.findIndex(doc => doc.id === id);
  if (index !== -1) {
    localDocuments.splice(index, 1);
    return true;
  }
  return false;
};

export const incrementLocalDownloadCount = (id: string): boolean => {
  const document = localDocuments.find(doc => doc.id === id);
  if (document) {
    document.downloadCount++;
    return true;
  }
  return false;
};
