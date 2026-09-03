import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "TI Innovation Portal - Gestión de Proyectos TI & IA",
  description: "Plataforma estilo Monday.com para gestión de proyectos de TI, cronogramas de Gantt, intake de usuarios M365 y evaluación con DeepSeek",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="bg-[#f6f7fb] text-[#323338] min-h-screen antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
