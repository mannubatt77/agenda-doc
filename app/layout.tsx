import "../styles/globals.css";
import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@/context/AuthContext";
import { DataProvider } from "@/context/DataContext";

export const metadata: Metadata = {
  title: "Agenda.doc",
  description: "Gestión integral para docentes",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <div id="orientation-overlay">
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>↻</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Por favor, gira tu dispositivo</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Esta aplicación está optimizada para usarse en modo horizontal.</p>
        </div>
        <AuthProvider>
          <DataProvider>
            {children}
          </DataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
