# Digital Business Card App - Migration Guide to Next.js + Firebase

## Overview

This document provides a comprehensive guide for migrating the existing Flask-based Digital Business Card application to Next.js with Firebase as the backend. The current application is a QR code generator and digital business card creator with user authentication, profile management, and admin functionality.

## Current Application Analysis

### Technology Stack (Current)
- **Backend**: Flask (Python)
- **Database**: SQLAlchemy with SQLite/PostgreSQL
- **Authentication**: Flask-Login with Google OAuth
- **Frontend**: Jinja2 templates with Tailwind CSS
- **QR Code Generation**: qrcode library
- **File Storage**: Local file system
- **Session Management**: Flask sessions

### Key Features
1. **User Authentication**: Google OAuth integration
2. **Profile Management**: Complete user profiles with social media links
3. **QR Code Generation**: Dynamic QR codes for profiles
4. **Business Card Creation**: Admin-created business cards
5. **Order Management**: Customer order tracking system
6. **Admin Dashboard**: User and order management
7. **Public Profiles**: Shareable profile pages
8. **vCard Download**: Contact information export
9. **Multi-language Support**: French interface

## Target Architecture (Next.js + Firebase)

### Technology Stack (Target)
- **Frontend**: Next.js 14+ with App Router
- **Backend**: Firebase (Firestore, Authentication, Storage, Functions)
- **Styling**: Tailwind CSS (preserved)
- **Authentication**: Firebase Auth with Google provider
- **Database**: Firestore
- **File Storage**: Firebase Storage
- **QR Code Generation**: qrcode library (client-side)
- **Deployment**: Vercel or Firebase Hosting

## Detailed Migration Plan

### 1. Project Structure

#### Current Structure
```
digital-business-card-main/
├── app.py                 # Main Flask application
├── auth.py               # OAuth authentication
├── models/user.py        # Database models
├── templates/            # Jinja2 templates
├── static/              # Static assets
└── migrations/          # Database migrations
```

#### Target Structure
```
nextjs-business-card/
├── src/
│   ├── app/             # Next.js App Router
│   │   ├── (auth)/      # Authentication routes
│   │   ├── admin/       # Admin dashboard
│   │   ├── dashboard/   # User dashboard
│   │   ├── pro/         # Public profiles
│   │   └── api/         # API routes
│   ├── components/      # React components
│   ├── lib/            # Utilities and Firebase config
│   ├── hooks/          # Custom React hooks
│   └── types/          # TypeScript types
├── public/             # Static assets
└── firebase/           # Firebase configuration
```

### 2. Database Migration (SQLAlchemy → Firestore)

#### Current Models

**User Model**
```python
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    google_id = db.Column(db.String(100), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    profile_picture = db.Column(db.String(200))
    profession = db.Column(db.String(100))
    phone = db.Column(db.String(20))
    phone_secondary = db.Column(db.String(20))
    phone_third = db.Column(db.String(20))
    phone_fourth = db.Column(db.String(20))
    biography = db.Column(db.Text)
    address = db.Column(db.String(200))
    location = db.Column(db.String(200))
    review_link = db.Column(db.String(200))
    # Social media fields
    linkedin = db.Column(db.String(200))
    whatsapp = db.Column(db.String(200))
    instagram = db.Column(db.String(200))
    twitter = db.Column(db.String(200))
    snapchat = db.Column(db.String(200))
    facebook = db.Column(db.String(200))
    youtube = db.Column(db.String(200))
    tiktok = db.Column(db.String(200))
    profile_slug = db.Column(db.String(100), unique=True)
    is_admin = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
```

**BusinessCard Model**
```python
class BusinessCard(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    phone_primary = db.Column(db.String(20), nullable=False)
    phone_secondary = db.Column(db.String(20))
    phone_third = db.Column(db.String(20))
    phone_fourth = db.Column(db.String(20))
    email = db.Column(db.String(120), nullable=False)
    address = db.Column(db.String(200))
    location = db.Column(db.String(200), nullable=False)
    photo_path = db.Column(db.String(200))
    # Social media fields
    instagram = db.Column(db.String(100))
    whatsapp = db.Column(db.String(100))
    twitter = db.Column(db.String(100))
    snapchat = db.Column(db.String(100))
    facebook = db.Column(db.String(100))
    linkedin = db.Column(db.String(100))
    youtube = db.Column(db.String(100))
    tiktok = db.Column(db.String(100))
    unique_id = db.Column(db.String(100), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())
```

**Order Model**
```python
class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    address = db.Column(db.String(200))
    business_type = db.Column(db.String(20), nullable=False)
    products = db.Column(db.JSON, nullable=False)
    purpose = db.Column(db.String(100), nullable=False)
    purpose_details = db.Column(db.Text)
    emergency_contact_1 = db.Column(db.String(20), nullable=False)
    emergency_contact_2 = db.Column(db.String(20))
    social_media_1 = db.Column(db.String(200))
    social_media_2 = db.Column(db.String(200))
    social_media_3 = db.Column(db.String(200))
    social_media_4 = db.Column(db.String(200))
    source = db.Column(db.String(50), nullable=False)
    source_details = db.Column(db.Text)
    status = db.Column(db.String(20), default='pending')
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
```

#### Firestore Collections Structure

**users Collection**
```typescript
interface User {
  id: string;
  googleId: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  profession?: string;
  phone?: string;
  phoneSecondary?: string;
  phoneThird?: string;
  phoneFourth?: string;
  biography?: string;
  address?: string;
  location?: string;
  reviewLink?: string;
  // Social media fields
  linkedin?: string;
  whatsapp?: string;
  instagram?: string;
  twitter?: string;
  snapchat?: string;
  facebook?: string;
  youtube?: string;
  tiktok?: string;
  profileSlug: string;
  isAdmin: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**businessCards Collection**
```typescript
interface BusinessCard {
  id: string;
  name: string;
  title: string;
  phonePrimary: string;
  phoneSecondary?: string;
  phoneThird?: string;
  phoneFourth?: string;
  email: string;
  address?: string;
  location: string;
  photoPath?: string;
  // Social media fields
  instagram?: string;
  whatsapp?: string;
  twitter?: string;
  snapchat?: string;
  facebook?: string;
  linkedin?: string;
  youtube?: string;
  tiktok?: string;
  uniqueId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**orders Collection**
```typescript
interface Order {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  businessType: 'business' | 'individual';
  products: string[];
  purpose: string;
  purposeDetails?: string;
  emergencyContact1: string;
  emergencyContact2?: string;
  socialMedia1?: string;
  socialMedia2?: string;
  socialMedia3?: string;
  socialMedia4?: string;
  source: string;
  sourceDetails?: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 3. Authentication Migration

#### Current Authentication (Flask)
- Google OAuth via Authlib
- Flask-Login session management
- User model with Google ID

#### Target Authentication (Firebase)
- Firebase Auth with Google provider
- Custom claims for admin roles
- Server-side session validation

**Firebase Auth Configuration**
```typescript
// lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  // Your Firebase config
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
```

**Authentication Hook**
```typescript
// hooks/useAuth.ts
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';

export function useAuth() {
  const [user, loading, error] = useAuthState(auth);
  
  return {
    user,
    loading,
    error,
    isAdmin: user?.customClaims?.admin || false
  };
}
```

### 4. UI Components Migration

#### Current Templates Analysis

**Base Template (base.html)**
- Tailwind CSS configuration
- Glass effect styling
- Gradient backgrounds
- Font Awesome icons
- Google Fonts (Inter)

#### **Design System & Color Palette**

**Primary Colors:**
- **Main Brand Color**: `#F15A22` (Orange)
- **Primary Orange Scale**:
  - `#fef7ee` (50) - Lightest
  - `#fdedd6` (100)
  - `#fbd7ac` (200)
  - `#f8bb77` (300)
  - `#f59540` (400)
  - `#f2731a` (500) - Main primary
  - `#e35a0f` (600)
  - `#bc4310` (700)
  - `#963614` (800)
  - `#792f14` (900) - Darkest

**Background Gradients:**
- **Main Page Background**: `bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100`
- **Card Headers**: `bg-gradient-to-r from-[#F15A22] to-[#F15A22]/80`
- **Text Gradients**: `linear-gradient(135deg, #f2731a 0%, #e35a0f 100%)`
- **Decorative Gradients**: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`

**Component Styling:**
- **Glass Effects**: `backdrop-filter: blur(10px)` with `border: 1px solid rgba(255, 255, 255, 0.18)`
- **Cards**: White backgrounds with `shadow-lg` and `rounded-2xl`
- **Buttons**: Primary orange (`bg-[#F15A22]`) with hover effects
- **Icons**: Font Awesome with consistent sizing and colors
- **Typography**: Inter font family throughout
- **Responsive**: Mobile-first design with Tailwind breakpoints

**Color Usage Examples:**
- Contact info icons: `bg-[#F15A22]/10 text-[#F15A22]`
- Primary buttons: `bg-[#F15A22] hover:opacity-90`
- Admin badges: `bg-blue-100 text-blue-700`
- Links: `hover:text-blue-600`
- Social media buttons: Platform-specific colors (blue for Facebook, etc.)

#### **Tailwind CSS Configuration to Preserve**

**tailwind.config.js**
```javascript
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef7ee',
          100: '#fdedd6',
          200: '#fbd7ac',
          300: '#f8bb77',
          400: '#f59540',
          500: '#f2731a',
          600: '#e35a0f',
          700: '#bc4310',
          800: '#963614',
          900: '#792f14',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
```

**Custom CSS Classes to Preserve**
```css
.glass-effect {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
}

.gradient-bg {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.gradient-text {
  background: linear-gradient(135deg, #f2731a 0%, #e35a0f 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

**Key Pages to Migrate:**
1. **Landing Page (index.html)**
   - Hero section with animated backgrounds
   - Feature cards
   - Call-to-action sections
   - Mobile-responsive navigation

2. **User Dashboard (user_dashboard.html)**
   - Profile overview
   - QR code display
   - Quick actions
   - Social media links
   - NFC ordering section

3. **Public Profile (public_profile.html)**
   - Contact information display
   - vCard download functionality
   - Social media integration
   - QR code generation

4. **Admin Dashboard (Dashboard.html)**
   - Business card management
   - CRUD operations
   - Order management

5. **Profile Forms**
   - Complete profile (complete_profile.html)
   - Edit profile (edit_profile.html)
   - Dynamic phone/social media fields

#### React Components Structure

**Design Preservation Notes:**
- All Tailwind classes must be preserved exactly as in the original templates
- The `#F15A22` orange color is used extensively and must be maintained
- Glass effects and gradients are key visual elements
- Font Awesome icons should be replaced with React equivalents (react-icons)
- Responsive breakpoints and mobile-first approach must be maintained
- All hover effects and transitions should be preserved

**Layout Components**
```typescript
// components/layout/BaseLayout.tsx
export function BaseLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        {/* Meta tags, fonts, etc. */}
      </head>
      <body className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-screen">
        <Navigation />
        {children}
        <Footer />
      </body>
    </html>
  );
}

// components/layout/Navigation.tsx
export function Navigation() {
  const { user, isAdmin } = useAuth();
  
  return (
    <nav className="glass-effect sticky top-0 z-50">
      {/* Navigation content */}
    </nav>
  );
}
```

**Page Components**
```typescript
// app/page.tsx (Landing Page)
export default function HomePage() {
  const { user } = useAuth();
  
  return (
    <BaseLayout>
      <HeroSection />
      <FeaturesSection />
      <CTASection />
    </BaseLayout>
  );
}

// app/dashboard/page.tsx (User Dashboard)
export default function DashboardPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  
  return (
    <BaseLayout>
      <ProfileOverview user={user} />
      <QRCodeSection profile={profile} />
      <QuickActions />
      <NFCOrderingSection />
    </BaseLayout>
  );
}
```

**Form Components**
```typescript
// components/forms/ProfileForm.tsx
export function ProfileForm({ user, onSubmit }: ProfileFormProps) {
  const [formData, setFormData] = useState(user);
  const [phoneFields, setPhoneFields] = useState([]);
  const [socialFields, setSocialFields] = useState([]);
  
  return (
    <form onSubmit={handleSubmit}>
      <PhotoUpload />
      <PersonalInfo />
      <PhoneNumbers />
      <SocialMedia />
      <LocationInfo />
      <SubmitButton />
    </form>
  );
}
```

### 5. API Routes Migration

#### Current Flask Routes

**Authentication Routes**
```python
@app.route('/auth/google')
def auth_google():
    return google_login()

@app.route('/auth/google/callback')
def auth_google_callback():
    return google_callback()
```

**User Routes**
```python
@app.route('/user_dashboard')
@login_required
def user_dashboard():
    # Generate QR code and render dashboard

@app.route('/pro/<profile_slug>')
def public_profile(profile_slug):
    # Display public profile

@app.route('/edit_profile', methods=['GET', 'POST'])
@login_required
def edit_profile():
    # Handle profile updates
```

**Admin Routes**
```python
@app.route('/dashboard')
@login_required
def dashboard():
    # Admin dashboard

@app.route('/create_card', methods=['GET', 'POST'])
def create_card():
    # Create business card

@app.route('/admin/orders')
@login_required
def admin_orders():
    # Order management
```

#### Next.js API Routes

**Authentication API**
```typescript
// app/api/auth/google/route.ts
import { auth } from '@/lib/firebase';

export async function GET() {
  // Handle Google OAuth redirect
}

// app/api/auth/callback/route.ts
export async function GET(request: Request) {
  // Handle OAuth callback
}
```

**User API**
```typescript
// app/api/user/profile/route.ts
export async function GET(request: Request) {
  const user = await getCurrentUser(request);
  const profile = await getUserProfile(user.uid);
  return Response.json(profile);
}

export async function PUT(request: Request) {
  const user = await getCurrentUser(request);
  const data = await request.json();
  await updateUserProfile(user.uid, data);
  return Response.json({ success: true });
}
```

**Admin API**
```typescript
// app/api/admin/cards/route.ts
export async function GET(request: Request) {
  const user = await getCurrentUser(request);
  if (!user.customClaims?.admin) {
    return Response.json({ error: 'Unauthorized' }, { status: 403 });
  }
  
  const cards = await getBusinessCards();
  return Response.json(cards);
}

export async function POST(request: Request) {
  const user = await getCurrentUser(request);
  if (!user.customClaims?.admin) {
    return Response.json({ error: 'Unauthorized' }, { status: 403 });
  }
  
  const data = await request.json();
  const card = await createBusinessCard(data);
  return Response.json(card);
}
```

### 6. QR Code Generation Migration

#### Current Implementation (Server-side)
```python
import qrcode
from io import BytesIO
import base64

def generate_qr_code(url):
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(url)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="black", back_color="white")
    
    buffered = BytesIO()
    qr_img.save(buffered)
    return base64.b64encode(buffered.getvalue()).decode()
```

#### Target Implementation (Client-side)
```typescript
// lib/qrcode.ts
import QRCode from 'qrcode';

export async function generateQRCode(url: string): Promise<string> {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(url, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
}

// components/QRCodeDisplay.tsx
export function QRCodeDisplay({ url }: { url: string }) {
  const [qrCode, setQrCode] = useState<string>('');
  
  useEffect(() => {
    generateQRCode(url).then(setQrCode);
  }, [url]);
  
  return (
    <div className="text-center">
      {qrCode && <img src={qrCode} alt="QR Code" className="mx-auto" />}
    </div>
  );
}
```

### 7. File Upload Migration

#### Current Implementation (Local Storage)
```python
def handle_photo_upload(photo, user_id):
    os.makedirs('static/photos', exist_ok=True)
    filename = f"user_{user_id}_{int(datetime.utcnow().timestamp())}_{photo.filename}"
    photo_path = f"photos/{filename}"
    photo.save(f"static/{photo_path}")
    return photo_path
```

#### Target Implementation (Firebase Storage)
```typescript
// lib/storage.ts
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

export async function uploadProfilePicture(
  file: File, 
  userId: string
): Promise<string> {
  const fileName = `profile_${userId}_${Date.now()}_${file.name}`;
  const storageRef = ref(storage, `profile-pictures/${fileName}`);
  
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);
  
  return downloadURL;
}

// components/PhotoUpload.tsx
export function PhotoUpload({ onUpload }: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  
  const handleFileChange = async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadProfilePicture(file, user.uid);
      onUpload(url);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div className="photo-upload">
      <input 
        type="file" 
        accept="image/*" 
        onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
        disabled={uploading}
      />
      {uploading && <div>Uploading...</div>}
    </div>
  );
}
```

### 8. vCard Generation Migration

#### Current Implementation (Client-side JavaScript)
```javascript
function handleVCardDownload() {
    const vCardContent = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `FN:${user.name}`,
        `TITLE:${user.title}`,
        // ... more fields
        'END:VCARD'
    ].filter(Boolean).join('\n');
    
    const blob = new Blob([vCardContent], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${user.name.replace(/\s+/g, '_')}_card.vcf`;
    link.click();
}
```

#### Target Implementation (React Hook)
```typescript
// hooks/useVCard.ts
export function useVCard() {
  const generateVCard = (user: User): string => {
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
      'END:VCARD'
    ].filter(Boolean);
    
    return lines.join('\n');
  };
  
  const downloadVCard = (user: User) => {
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
  };
  
  return { generateVCard, downloadVCard };
}
```

### 9. State Management

#### Current State Management (Flask Sessions)
- Server-side session storage
- Flash messages
- User authentication state

#### Target State Management (React + Firebase)
```typescript
// contexts/AuthContext.tsx
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userData = await getUserProfile(firebaseUser.uid);
        setUser(userData);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    
    return unsubscribe;
  }, []);
  
  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// hooks/useToast.ts
export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  const addToast = (message: string, type: 'success' | 'error') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 5000);
  };
  
  return { toasts, addToast };
}
```

### 10. Deployment Configuration

#### Firebase Configuration
```typescript
// firebase.json
{
  "hosting": {
    "public": "out",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "storage": {
    "rules": "storage.rules"
  }
}
```

#### Firestore Security Rules
```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
    
    // Business cards - admin only
    match /businessCards/{cardId} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
    
    // Orders - admin only
    match /orders/{orderId} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
  }
}
```

#### Storage Security Rules
```javascript
// storage.rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /profile-pictures/{userId}/{fileName} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 11. Migration Steps

#### Phase 1: Setup and Infrastructure
1. **Initialize Next.js Project**
   ```bash
   npx create-next-app@latest nextjs-business-card --typescript --tailwind --app
   cd nextjs-business-card
   ```

2. **Install Dependencies**
   ```bash
   npm install firebase react-firebase-hooks qrcode @types/qrcode
   npm install -D @types/node
   ```

3. **Setup Firebase Project**
   - Create Firebase project
   - Enable Authentication (Google provider)
   - Enable Firestore Database
   - Enable Storage
   - Configure security rules

4. **Configure Environment Variables**
   ```bash
   # .env.local
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

#### Phase 2: Core Functionality
1. **Authentication System**
   - Implement Firebase Auth
   - Create authentication context
   - Setup protected routes
   - Migrate user data

2. **Database Migration**
   - Export data from SQLite/PostgreSQL
   - Transform data to Firestore format
   - Import data to Firestore
   - Setup indexes

3. **User Management**
   - User profile CRUD operations
   - Profile picture upload
   - Social media integration

#### Phase 3: UI Migration
1. **Layout Components**
   - Base layout with navigation
   - Responsive design preservation
   - Tailwind CSS configuration

2. **Page Components**
   - Landing page
   - User dashboard
   - Public profiles
   - Admin dashboard

3. **Form Components**
   - Profile forms
   - Dynamic field management
   - Validation

#### Phase 4: Advanced Features
1. **QR Code Generation**
   - Client-side QR generation
   - Download functionality
   - Print optimization

2. **vCard Export**
   - Contact information export
   - Cross-platform compatibility

3. **Order Management**
   - Order tracking system
   - Admin order management
   - Status updates

#### Phase 5: Testing and Deployment
1. **Testing**
   - Unit tests for components
   - Integration tests for Firebase
   - E2E testing

2. **Performance Optimization**
   - Image optimization
   - Code splitting
   - Caching strategies

3. **Deployment**
   - Firebase Hosting setup
   - Domain configuration
   - SSL certificates

### 12. Data Migration Script

```typescript
// scripts/migrate-data.ts
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import sqlite3 from 'sqlite3';

const firebaseConfig = {
  // Your Firebase config
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migrateUsers() {
  const sqliteDb = new sqlite3.Database('business_cards.db');
  
  sqliteDb.all('SELECT * FROM user', async (err, rows) => {
    if (err) {
      console.error(err);
      return;
    }
    
    for (const row of rows) {
      const userData = {
        googleId: row.google_id,
        email: row.email,
        firstName: row.first_name,
        lastName: row.last_name,
        profilePicture: row.profile_picture,
        profession: row.profession,
        phone: row.phone,
        phoneSecondary: row.phone_secondary,
        phoneThird: row.phone_third,
        phoneFourth: row.phone_fourth,
        biography: row.biography,
        address: row.address,
        location: row.location,
        reviewLink: row.review_link,
        linkedin: row.linkedin,
        whatsapp: row.whatsapp,
        instagram: row.instagram,
        twitter: row.twitter,
        snapchat: row.snapchat,
        facebook: row.facebook,
        youtube: row.youtube,
        tiktok: row.tiktok,
        profileSlug: row.profile_slug,
        isAdmin: row.is_admin,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at)
      };
      
      await addDoc(collection(db, 'users'), userData);
    }
  });
}

// Run migration
migrateUsers();
```

### 13. Performance Considerations

#### Current Performance Issues
- Server-side QR generation (blocking)
- Local file storage (scalability)
- Session-based authentication (memory usage)

#### Optimizations for Next.js + Firebase
1. **Client-side QR Generation**
   - Non-blocking QR generation
   - Caching of generated QR codes
   - Progressive loading

2. **Firebase Optimizations**
   - Firestore indexes for queries
   - Storage CDN for images
   - Connection pooling

3. **Next.js Optimizations**
   - Image optimization with next/image
   - Code splitting
   - Static generation where possible

### 14. Security Considerations

#### Authentication Security
- Firebase Auth with Google provider
- Custom claims for admin roles
- Server-side validation

#### Data Security
- Firestore security rules
- Storage access controls
- Input validation and sanitization

#### API Security
- Rate limiting
- CORS configuration
- Request validation

### 15. Monitoring and Analytics

#### Firebase Analytics
```typescript
// lib/analytics.ts
import { getAnalytics, logEvent } from 'firebase/analytics';

const analytics = getAnalytics();

export function trackEvent(eventName: string, parameters?: any) {
  logEvent(analytics, eventName, parameters);
}

// Usage
trackEvent('profile_view', { profile_slug: user.profileSlug });
trackEvent('qr_download', { user_id: user.id });
```

#### Error Monitoring
```typescript
// lib/error-monitoring.ts
import { getPerformance } from 'firebase/performance';

const perf = getPerformance();

export function logError(error: Error, context?: string) {
  console.error(`Error in ${context}:`, error);
  // Send to error monitoring service
}
```

### 16. Maintenance and Updates

#### Database Maintenance
- Regular backups
- Index optimization
- Data cleanup

#### Application Updates
- Feature flags
- Gradual rollouts
- Rollback procedures

#### Monitoring
- Performance metrics
- Error tracking
- User analytics

## Conclusion

This migration guide provides a comprehensive roadmap for transitioning from Flask to Next.js with Firebase. The key benefits of this migration include:

1. **Scalability**: Firebase provides automatic scaling
2. **Performance**: Client-side rendering and optimization
3. **Maintenance**: Reduced server management overhead
4. **Security**: Built-in security features
5. **Development Experience**: Modern React development

The migration should be done in phases to minimize disruption and ensure a smooth transition. Each phase should be thoroughly tested before proceeding to the next.

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Auth Documentation](https://firebase.google.com/docs/auth)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
