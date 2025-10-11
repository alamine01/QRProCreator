import { User } from '@/types';

export function generateVCard(user: User): string {
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${user.firstName} ${user.lastName}`,
    user.profession ? `TITLE:${user.profession}` : '',
    user.phone ? `TEL;type=CELL;type=pref:${user.phone}` : '',
    user.phoneSecondary ? `TEL;type=CELL;type=home:${user.phoneSecondary}` : '',
    user.email ? `EMAIL:${user.email}` : '',
    user.address ? `ADR;type=WORK:;;${user.address};;;` : '',
    // Social media fields
    user.linkedin ? `X-SOCIALPROFILE;type=linkedin:${user.linkedin}` : '',
    user.whatsapp ? `X-SOCIALPROFILE;type=whatsapp:${user.whatsapp}` : '',
    user.instagram ? `X-SOCIALPROFILE;type=instagram:${user.instagram}` : '',
    user.twitter ? `X-SOCIALPROFILE;type=twitter:${user.twitter}` : '',
    user.facebook ? `X-SOCIALPROFILE;type=facebook:${user.facebook}` : '',
    'END:VCARD'
  ].filter(Boolean);
  
  return lines.join('\n');
}

export function downloadVCard(user: User) {
  const vCardContent = generateVCard(user);
  const blob = new Blob([vCardContent], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${user.firstName}_${user.lastName}_card.vcf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
