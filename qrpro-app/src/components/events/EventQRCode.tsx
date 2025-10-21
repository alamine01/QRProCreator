'use client';

import { useEffect, useState } from 'react';
import { generateQRCode } from '@/lib/qrcode';
import { FaQrcode, FaDownload, FaCopy, FaCheck } from 'react-icons/fa';

interface EventQRCodeProps {
  eventId: string;
  eventName: string;
  className?: string;
}

export default function EventQRCode({ eventId, eventName, className = '' }: EventQRCodeProps) {
  const [qrCode, setQrCode] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    generateEventQRCode();
  }, [eventId]);

  const generateEventQRCode = async () => {
    try {
      setLoading(true);
      const checkinUrl = `${window.location.origin}/event/${eventId}/checkin`;
      const qrCodeDataUrl = await generateQRCode(checkinUrl);
      setQrCode(qrCodeDataUrl);
    } catch (error) {
      console.error('Erreur lors de la génération du QR code:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (qrCode) {
      const link = document.createElement('a');
      link.href = qrCode;
      link.download = `qr-code-${eventName.replace(/[^a-zA-Z0-9]/g, '-')}.png`;
      link.click();
    }
  };

  const handleCopyUrl = async () => {
    try {
      const checkinUrl = `${window.location.origin}/event/${eventId}/checkin`;
      await navigator.clipboard.writeText(checkinUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Génération du QR code...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 border border-gray-100 ${className}`}>
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <FaQrcode className="w-6 h-6 text-blue-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">QR Code de Check-in</h3>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          {qrCode ? (
            <img 
              src={qrCode} 
              alt="QR Code de check-in" 
              className="mx-auto w-32 h-32 shadow-sm rounded-lg"
            />
          ) : (
            <div className="mx-auto w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
              <FaQrcode className="w-8 h-8 text-gray-400" />
            </div>
          )}
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          Scannez ce QR code pour accéder au formulaire de check-in
        </p>
        
        <div className="space-y-2">
          <button
            onClick={handleDownload}
            className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
          >
            <FaDownload className="w-4 h-4 mr-2" />
            Télécharger
          </button>
          
          <button
            onClick={handleCopyUrl}
            className="w-full inline-flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {copied ? (
              <>
                <FaCheck className="w-4 h-4 mr-2" />
                Copié !
              </>
            ) : (
              <>
                <FaCopy className="w-4 h-4 mr-2" />
                Copier le lien
              </>
            )}
          </button>
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700">
            <strong>Lien de check-in :</strong><br />
            <span className="break-all">
              {typeof window !== 'undefined' ? `${window.location.origin}/event/${eventId}/checkin` : ''}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
