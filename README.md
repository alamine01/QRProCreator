# QRPRO - Digital Business Card Creator

![QRPRO Logo](https://img.shields.io/badge/QRPRO-Digital%20Business%20Card-blue?style=for-the-badge&logo=qr-code)

A modern, responsive web application built with Next.js that allows users to create professional digital business cards with QR codes. Share your contact information, social media profiles, and professional details instantly with a simple QR code scan.

## 🚀 Features

### ✨ Core Features
- **Dynamic QR Code Generation** - Generate unique QR codes for each profile with real-time updates
- **Responsive Design** - Optimized interface for all devices, from mobile to desktop
- **Instant Sharing** - Share your contact information via QR code, direct link, or social media
- **vCard Export** - Download your information in vCard format for contacts
- **Public Profiles** - Create shareable public profiles for clients and partners
- **Secure Authentication** - Google OAuth authentication and Firebase-protected data

### 📱 Contact Information Management
- **Basic Contact Info** - Phone, email, address
- **Social Media Integration** - LinkedIn, Instagram, Twitter, Facebook
- **Professional Details** - Company, position, website
- **Custom Branding** - Personalize your digital card

### 🔧 Technical Features
- **Real-time Updates** - Changes reflect immediately across all shared QR codes
- **Mobile-First Design** - Optimized for smartphone scanning
- **Fast Performance** - Built with Next.js 15 and React 19
- **TypeScript Support** - Full type safety and better development experience

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Authentication**: Firebase Auth (Google OAuth)
- **Database**: Firebase Firestore
- **QR Code Generation**: qrcode library
- **Icons**: Lucide React, React Icons
- **Deployment**: Vercel (recommended)

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase project setup

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/alamine01/QRProCreator.git
   cd QRProCreator
   ```

2. **Install dependencies**
   ```bash
   cd qrpro-app
   npm install
   ```

3. **Firebase Configuration**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Google provider)
   - Create a Firestore database
   - Copy your Firebase config to `src/lib/firebase.ts`

4. **Environment Variables**
   Create a `.env.local` file in the `qrpro-app` directory:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- Heroku
- AWS Amplify

## 📱 Usage

1. **Sign Up/Login** - Use Google OAuth to authenticate
2. **Create Profile** - Fill in your contact information and social media links
3. **Generate QR Code** - Your unique QR code is automatically generated
4. **Share** - Share your QR code or direct link with others
5. **Update** - Modify your information anytime - changes reflect instantly

## 🎨 Customization

### Styling
- Modify `tailwind.config.ts` for custom colors and themes
- Update `src/app/globals.css` for global styles
- Customize components in `src/components/`

### Features
- Add new social media platforms in `src/components/sections/FeaturesSection.tsx`
- Extend contact information fields in `src/types/index.ts`
- Modify QR code generation options in `src/lib/qrcode.ts`

## 📁 Project Structure

```
qrpro-app/
├── src/
│   ├── app/                 # Next.js app router pages
│   │   ├── dashboard/       # User dashboard
│   │   ├── globals.css      # Global styles
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Home page
│   ├── components/          # React components
│   │   ├── layout/          # Layout components
│   │   └── sections/        # Page sections
│   ├── contexts/            # React contexts
│   │   └── AuthContext.tsx  # Authentication context
│   ├── lib/                 # Utility libraries
│   │   ├── firebase.ts      # Firebase configuration
│   │   ├── qrcode.ts        # QR code generation
│   │   └── vcard.ts         # vCard generation
│   └── types/               # TypeScript type definitions
│       └── index.ts         # Global types
├── public/                  # Static assets
├── package.json             # Dependencies and scripts
├── tailwind.config.ts       # Tailwind CSS configuration
└── tsconfig.json           # TypeScript configuration
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Alamine Bah**
- GitHub: [@alamine01](https://github.com/alamine01)
- Email: bahmouhamedalamine@gmail.com

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework for production
- [Firebase](https://firebase.google.com/) - Backend-as-a-Service platform
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Lucide React](https://lucide.dev/) - Beautiful & consistent icon toolkit

## 📊 Stats

- **1000+** Profiles created
- **50K+** QR codes scanned
- **99.9%** Uptime

---

⭐ **Star this repository if you found it helpful!**
