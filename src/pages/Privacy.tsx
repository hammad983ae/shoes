export default function Privacy() {
  return (
    <div className="min-h-screen page-gradient">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-8">
          <h1 className="text-4xl font-bold text-foreground mb-6">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">Effective Date: July 22, 2025</p>
          
          <div className="prose prose-invert max-w-none space-y-6 text-foreground">
            <p>
              Crallux Sells ("we," "our," or "us") operates the website https://cralluxsells.com (the "Site") and provides services through our web application (the "App"). This Privacy Policy explains how we collect, use, and protect your information when you use our Site, App, and services.
            </p>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">1. Information We Collect</h2>
              <p>When you use Crallux Sells, we may collect:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Account Information:</strong> Email address, username, profile image, description, and password.</li>
                <li><strong>OAuth Information:</strong> When you connect third-party platforms (such as Instagram, YouTube, and TikTok) via OAuth, we collect and store basic profile information and access tokens provided by those platforms to link your account and enable features such as embedded posts and profile linking.</li>
                <li><strong>User-Generated Content:</strong> Content you upload, post, or link (e.g., videos, descriptions, links to posts).</li>
                <li><strong>Transaction Information:</strong> If you make purchases or earn credits, we store transaction records and credit balances.</li>
                <li><strong>Technical Information:</strong> IP addresses, device type, browser type, and analytics data.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">2. How We Use Your Information</h2>
              <p>We use your information to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide and improve our services.</li>
                <li>Link your social accounts (Instagram, YouTube, TikTok) through OAuth for content display and credit tracking.</li>
                <li>Display posts, track purchases made through your posts, and award credits.</li>
                <li>Communicate with you about your account, support requests, and updates.</li>
                <li>Comply with legal obligations.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">3. How We Share Your Information</h2>
              <p>We do not sell your data. We may share information with:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Third-party integrations:</strong> Instagram, YouTube, and TikTok, when you choose to connect accounts via OAuth.</li>
                <li><strong>Service Providers:</strong> Vendors who help us operate (hosting, database management, payment processors).</li>
                <li><strong>Legal Requirements:</strong> When required by law, legal process, or to enforce our Terms.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">4. Data Retention</h2>
              <p>We retain information as long as necessary to provide our services or comply with legal requirements. You may request deletion of your data at any time.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">5. Your Rights and Choices</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Access and Update:</strong> You can update your profile information at any time in your account settings.</li>
                <li><strong>Disconnect Social Accounts:</strong> You can disconnect Instagram, YouTube, or TikTok accounts at any time.</li>
                <li><strong>Data Deletion:</strong> Email us at doppelsells@gmail.com to request deletion of your data or linked accounts.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">6. Security</h2>
              <p>We implement reasonable technical and organizational measures to protect your data, but no system is 100% secure. Use strong passwords and protect your login credentials.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">7. Third-Party Links and Content</h2>
              <p>Posts embedded from Instagram, YouTube, or TikTok are governed by those platforms' privacy policies.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">8. Children's Privacy</h2>
              <p>Our services are not directed to children under 13. We do not knowingly collect personal information from children.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">9. Changes to This Policy</h2>
              <p>We may update this Privacy Policy from time to time. Changes will be posted on this page with the updated effective date.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Contact Us</h2>
              <p>If you have questions, contact us at <a href="mailto:doppelsells@gmail.com" className="text-primary hover:underline">doppelsells@gmail.com</a>.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}