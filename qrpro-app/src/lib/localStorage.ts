// Système de stockage local pour les documents
import fs from 'fs';
import path from 'path';

const DOCUMENTS_FILE = path.join(process.cwd(), 'data', 'documents.json');

// Créer le dossier data s'il n'existe pas
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialiser le fichier s'il n'existe pas
if (!fs.existsSync(DOCUMENTS_FILE)) {
  fs.writeFileSync(DOCUMENTS_FILE, JSON.stringify([]));
}

export function getAllLocalDocuments() {
  try {
    const data = fs.readFileSync(DOCUMENTS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erreur lecture documents locaux:', error);
    return [];
  }
}

export function saveLocalDocument(documentData: any) {
  try {
    const documents = getAllLocalDocuments();
    const newDocument = {
      id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...documentData,
      uploadedAt: new Date().toISOString(),
      downloadCount: 0,
      isActive: true,
      local: true
    };
    
    documents.unshift(newDocument);
    fs.writeFileSync(DOCUMENTS_FILE, JSON.stringify(documents, null, 2));
    
    console.log('✅ Document sauvegardé localement:', newDocument.id);
    return newDocument;
  } catch (error) {
    console.error('Erreur sauvegarde document local:', error);
    throw error;
  }
}

export function deleteLocalDocument(id: string) {
  try {
    const documents = getAllLocalDocuments();
    const filteredDocuments = documents.filter((doc: any) => doc.id !== id);
    fs.writeFileSync(DOCUMENTS_FILE, JSON.stringify(filteredDocuments, null, 2));
    
    console.log('✅ Document supprimé localement:', id);
    return true;
  } catch (error) {
    console.error('Erreur suppression document local:', error);
    return false;
  }
}