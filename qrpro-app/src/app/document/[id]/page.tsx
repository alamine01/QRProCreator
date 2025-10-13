'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function PublicDocumentPage() {
  const params = useParams();

  useEffect(() => {
    const documentId = params?.id as string;
    
    if (documentId) {
      // Rediriger directement vers l'API qui va rediriger vers le fichier
      window.location.replace(`/api/document/${documentId}`);
    }
  }, [params?.id]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirection vers le document...</p>
      </div>
    </div>
  );
}