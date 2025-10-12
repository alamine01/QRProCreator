import { User } from '@/types';
import { recordVCardDownload, detectDeviceInfo } from './firebase';

export async function getImageFromUrl(url: string): Promise<string | null> {
  try {
    // Vérifier si l'URL est valide
    if (!url || !url.startsWith('http')) {
      console.warn('URL d\'image invalide:', url);
      return null;
    }

    // Essayer de récupérer l'image avec un timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 secondes timeout

    const response = await fetch(url, {
      signal: controller.signal,
      mode: 'cors',
      credentials: 'omit'
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn('Erreur HTTP lors de la récupération de l\'image:', response.status, response.statusText);
      return null;
    }

    const blob = await response.blob();
    
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const base64Data = base64String.includes(',') ? 
          base64String.split(',')[1] : base64String;
        resolve(base64Data);
      };
      reader.onerror = () => {
        console.warn('Erreur lors de la lecture de l\'image');
        resolve(null);
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    if (error.name === 'AbortError') {
      console.warn('Timeout lors de la récupération de l\'image');
    } else if (error.message.includes('CORS')) {
      console.warn('Erreur CORS lors de la récupération de l\'image - l\'image ne sera pas incluse dans la vCard');
    } else {
      console.warn('Erreur lors de la récupération de l\'image:', error.message);
    }
    return null;
  }
}

export async function generateVCard(user: User): Promise<string> {
  let photoData = '';
  let imageType = 'JPEG';

  // Try to get photo data if profile picture exists
  if (user.profilePicture) {
    console.log('Tentative de récupération de la photo de profil:', user.profilePicture);
    try {
      const imageResult = await getImageFromUrl(user.profilePicture);
      if (imageResult) {
        photoData = imageResult;
        console.log('Photo de profil récupérée avec succès');
        // Determine image type from URL
        if (user.profilePicture.includes('.png')) {
          imageType = 'PNG';
        } else if (user.profilePicture.includes('.gif')) {
          imageType = 'GIF';
        }
      } else {
        console.warn('Impossible de récupérer la photo de profil - la vCard sera générée sans photo');
      }
    } catch (error) {
      console.warn('Erreur lors du traitement de la photo:', error);
    }
  } else {
    console.log('Aucune photo de profil définie');
  }

  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${user.firstName} ${user.lastName}`,
    user.profession ? `TITLE:${user.profession}` : '',
    user.phone ? `TEL;type=CELL;type=pref:${user.phone.replace(/[^\d+]/g, '')}` : '',
    user.phoneSecondary ? `TEL;type=CELL;type=home:${user.phoneSecondary.replace(/[^\d+]/g, '')}` : '',
    user.phoneThird ? `TEL;type=CELL;type=work:${user.phoneThird.replace(/[^\d+]/g, '')}` : '',
    user.phoneFourth ? `TEL;type=CELL;type=other:${user.phoneFourth.replace(/[^\d+]/g, '')}` : '',
    user.email ? `EMAIL:${user.email}` : '',
    user.address ? `ADR;type=WORK:;;${user.address};;;` : '',
    user.location ? `URL:${user.location}` : '',
    photoData ? `PHOTO;ENCODING=BASE64;TYPE=${imageType}:${photoData}` : '',
    // Social media fields
    user.linkedin ? `X-SOCIALPROFILE;type=linkedin:${user.linkedin}` : '',
    user.whatsapp ? `X-SOCIALPROFILE;type=whatsapp:https://wa.me/${user.whatsapp.replace(/[^\d+]/g, '')}` : '',
    user.instagram ? `X-SOCIALPROFILE;type=instagram:${user.instagram}` : '',
    user.twitter ? `X-SOCIALPROFILE;type=twitter:${user.twitter}` : '',
    user.facebook ? `X-SOCIALPROFILE;type=facebook:${user.facebook}` : '',
    user.youtube ? `X-SOCIALPROFILE;type=youtube:${user.youtube}` : '',
    user.tiktok ? `X-SOCIALPROFILE;type=tiktok:${user.tiktok}` : '',
    user.snapchat ? `X-SOCIALPROFILE;type=snapchat:${user.snapchat}` : '',
    'END:VCARD'
  ].filter(Boolean);
  
  return lines.join('\n');
}

export async function downloadVCard(user: User, userId?: string) {
  try {
    console.log('Génération de la vCard pour:', user.firstName, user.lastName);
    const vCardContent = await generateVCard(user);
    
    const blob = new Blob([vCardContent], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${user.firstName}_${user.lastName}_card.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log('vCard téléchargée avec succès');
    
    // Enregistrer le téléchargement si userId est fourni
    if (userId) {
      try {
        const deviceInfo = await detectDeviceInfo();
        await recordVCardDownload(userId, {
          ...deviceInfo,
          ip: 'Unknown', // À améliorer avec une API IP
        });
        console.log('Téléchargement vCard enregistré avec succès');
      } catch (trackingError) {
        console.warn('Erreur lors de l\'enregistrement du téléchargement vCard:', trackingError);
        // Ne pas empêcher le téléchargement si le tracking échoue
      }
    }
    
    console.log('vCard download completed successfully');
  } catch (error) {
    console.error('Erreur lors de la création de la vCard:', error);
    alert('Une erreur est survenue lors de la création de la carte de visite. Veuillez réessayer.');
  }
}
