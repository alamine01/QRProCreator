# 📧 Configuration EmailJS pour QR Pro Creator

## 🚀 Étapes de Configuration (5 minutes)

### **1. Créer un compte EmailJS**
1. Aller sur : https://www.emailjs.com/
2. Cliquer "Sign Up" 
3. Créer un compte avec votre email
4. **Confirmer votre email** (important !)

### **2. Configurer un Service Email**
1. Dans le dashboard EmailJS, aller dans **"Email Services"**
2. Cliquer **"Add New Service"**
3. Choisir **"Gmail"** (le plus simple)
4. Connecter votre compte Gmail
5. **Copier le Service ID** (ex: `service_abc123`)

### **3. Créer les Templates d'Email**

#### **Template 1 : Confirmation de Commande**
1. Aller dans **"Email Templates"**
2. Cliquer **"Create New Template"**
3. Nom : `template_order_confirmation`
4. Contenu HTML :

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Confirmation de commande</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #f2731a 0%, #e35a0f 100%); color: white; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
        .header h2 { margin: 10px 0 0 0; font-size: 18px; opacity: 0.9; }
        .content { padding: 30px; }
        .greeting { font-size: 18px; margin-bottom: 20px; color: #2c3e50; }
        .order-details { background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #f2731a; }
        .order-details h3 { margin-top: 0; color: #2c3e50; font-size: 20px; }
        .item { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e9ecef; }
        .item:last-child { border-bottom: none; }
        .total { font-weight: bold; font-size: 20px; color: #f2731a; margin-top: 15px; padding-top: 15px; border-top: 2px solid #e9ecef; }
        .next-steps { background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #28a745; }
        .next-steps h3 { margin-top: 0; color: #155724; }
        .footer { text-align: center; margin-top: 30px; color: #6c757d; font-size: 14px; padding: 20px; background: #f8f9fa; }
        .contact-info { margin-top: 15px; padding-top: 15px; border-top: 1px solid #dee2e6; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{company_name}}</h1>
            <h2>Confirmation de commande</h2>
        </div>
        <div class="content">
            <div class="greeting">
                Bonjour <strong>{{to_name}}</strong>,
            </div>
            
            <p>Nous avons bien reçu votre commande <strong>{{order_number}}</strong> et nous vous en remercions !</p>
            
            <div class="order-details">
                <h3>📦 Détails de votre commande :</h3>
                <div class="item">
                    <span>{{items_list}}</span>
                </div>
                <div class="item total">
                    <span><strong>Total</strong></span>
                    <span><strong>{{total_amount}} FCFA</strong></span>
                </div>
            </div>
            
            <div class="next-steps">
                <h3>🚀 Prochaines étapes :</h3>
                <ul>
                    <li>Votre commande est en cours de traitement</li>
                    <li>Nous vous tiendrons informé de son avancement par email</li>
                    <li>Vous recevrez un appel de confirmation sous 24h</li>
                    <li>Livraison prévue sous 3-5 jours ouvrés</li>
                </ul>
            </div>
            
            <p>Pour toute question concernant votre commande, n'hésitez pas à nous contacter.</p>
            
            <div class="footer">
                <p><strong>Cordialement,</strong><br>L'équipe {{company_name}}</p>
                <div class="contact-info">
                    <p>📧 Email: <a href="mailto:{{support_email}}">{{support_email}}</a></p>
                    <p>📱 WhatsApp: <a href="https://wa.me/{{whatsapp_number}}">{{whatsapp_number}}</a></p>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
```

5. **Copier le Template ID** (ex: `template_xyz789`)

#### **Template 2 : Mise à Jour de Statut**
1. Créer un nouveau template
2. Nom : `template_status_update`
3. Contenu HTML :

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Mise à jour de commande</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #f2731a 0%, #e35a0f 100%); color: white; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
        .header h2 { margin: 10px 0 0 0; font-size: 18px; opacity: 0.9; }
        .content { padding: 30px; }
        .greeting { font-size: 18px; margin-bottom: 20px; color: #2c3e50; }
        .status { background: #3b82f6; color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 25px 0; font-weight: bold; font-size: 18px; }
        .footer { text-align: center; margin-top: 30px; color: #6c757d; font-size: 14px; padding: 20px; background: #f8f9fa; }
        .contact-info { margin-top: 15px; padding-top: 15px; border-top: 1px solid #dee2e6; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{company_name}}</h1>
            <h2>Mise à jour de commande</h2>
        </div>
        <div class="content">
            <div class="greeting">
                Bonjour <strong>{{to_name}}</strong>,
            </div>
            
            <p>Nous vous informons d'une mise à jour concernant votre commande <strong>{{order_number}}</strong>.</p>
            
            <div class="status">
                {{status_icon}} {{status_message}}
            </div>
            
            <p>Pour toute question, n'hésitez pas à nous contacter.</p>
            
            <div class="footer">
                <p><strong>Cordialement,</strong><br>L'équipe {{company_name}}</p>
                <div class="contact-info">
                    <p>📧 Email: <a href="mailto:{{support_email}}">{{support_email}}</a></p>
                    <p>📱 WhatsApp: <a href="https://wa.me/{{whatsapp_number}}">{{whatsapp_number}}</a></p>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
```

### **4. Obtenir la Clé Publique**
1. Aller dans **"Account"** > **"General"**
2. **Copier la Public Key** (ex: `user_abc123def456`)

### **5. Mettre à Jour le Code**
Ouvrir le fichier `src/lib/emailjs.ts` et remplacer :

```typescript
const EMAILJS_SERVICE_ID = 'service_qrpro'; // ← Remplacer par votre Service ID
const EMAILJS_TEMPLATE_ID_CONFIRMATION = 'template_order_confirmation'; // ← Remplacer par votre Template ID
const EMAILJS_TEMPLATE_ID_STATUS = 'template_status_update'; // ← Remplacer par votre Template ID
const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY'; // ← Remplacer par votre Public Key
```

## 🧪 Test

1. **Démarrer l'application** :
   ```bash
   npm run dev
   ```

2. **Créer une commande test** avec votre email
3. **Vérifier votre boîte email** (et le dossier spam)

## ✅ Avantages EmailJS

- ✅ **Gratuit** : 200 emails/mois
- ✅ **Simple** : Pas de serveur nécessaire
- ✅ **Rapide** : Configuration en 5 minutes
- ✅ **Fiable** : Service professionnel
- ✅ **Sécurisé** : Clés API sécurisées

## 🔧 Dépannage

### Problèmes courants :
1. **Email non reçu** : Vérifier le dossier spam
2. **Erreur de configuration** : Vérifier les IDs dans le code
3. **Service non connecté** : Reconnecter Gmail dans EmailJS

### Logs utiles :
- Ouvrir la console du navigateur (F12)
- Voir les messages de log EmailJS
