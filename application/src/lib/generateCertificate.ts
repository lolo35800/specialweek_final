import { jsPDF } from 'jspdf'

export function generateCertificate(username: string) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

  const W = 297
  const H = 210

  // --- Fond sombre ---
  doc.setFillColor(9, 9, 11)
  doc.rect(0, 0, W, H, 'F')

  // --- Bordure extérieure teal ---
  doc.setDrawColor(20, 184, 166)
  doc.setLineWidth(1.2)
  doc.rect(8, 8, W - 16, H - 16)

  // --- Bordure intérieure fine ---
  doc.setDrawColor(45, 212, 191)
  doc.setLineWidth(0.3)
  doc.rect(11, 11, W - 22, H - 22)

  // --- Coins décoratifs ---
  const corners = [
    [8, 8], [W - 8, 8], [8, H - 8], [W - 8, H - 8],
  ]
  doc.setFillColor(20, 184, 166)
  corners.forEach(([x, y]) => {
    doc.circle(x, y, 2, 'F')
  })

  // --- Bandeau teal en haut ---
  doc.setFillColor(20, 184, 166)
  doc.rect(8, 8, W - 16, 18, 'F')

  // --- Titre du bandeau ---
  doc.setTextColor(9, 9, 11)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('VERIF-IA  ·  PROGRAMME ANTI-DÉSINFORMATION', W / 2, 19, { align: 'center' })

  // --- Étoile / médaille (cercle décoratif) ---
  doc.setDrawColor(20, 184, 166)
  doc.setLineWidth(0.8)
  doc.setFillColor(9, 9, 11)
  doc.circle(W / 2, 60, 16, 'FD')

  doc.setTextColor(20, 184, 166)
  doc.setFontSize(22)
  doc.text('✓', W / 2, 65, { align: 'center' })

  // --- Titre principal ---
  doc.setFontSize(28)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(250, 250, 250)
  doc.text('CERTIFICAT', W / 2, 90, { align: 'center' })

  doc.setFontSize(14)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(161, 161, 170)
  doc.text('Anti-Désinformation', W / 2, 100, { align: 'center' })

  // --- Ligne décorative ---
  doc.setDrawColor(20, 184, 166)
  doc.setLineWidth(0.5)
  doc.line(W / 2 - 50, 105, W / 2 + 50, 105)

  // --- Texte intermédiaire ---
  doc.setFontSize(11)
  doc.setTextColor(161, 161, 170)
  doc.text('Ce certificat est décerné à', W / 2, 116, { align: 'center' })

  // --- Nom de l'utilisateur ---
  doc.setFontSize(26)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(20, 184, 166)
  doc.text(username, W / 2, 130, { align: 'center' })

  // --- Description ---
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(161, 161, 170)
  doc.text(
    'pour avoir obtenu un score parfait au quiz et démontré sa maîtrise',
    W / 2, 143, { align: 'center' }
  )
  doc.text(
    'des techniques de détection de la désinformation et des contenus générés par l\'IA.',
    W / 2, 150, { align: 'center' }
  )

  // --- Ligne décorative bas ---
  doc.setDrawColor(20, 184, 166)
  doc.setLineWidth(0.5)
  doc.line(W / 2 - 50, 156, W / 2 + 50, 156)

  // --- Date ---
  const date = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
  doc.setFontSize(9)
  doc.setTextColor(113, 113, 122)
  doc.text(`Délivré le ${date}`, W / 2, 164, { align: 'center' })

  // --- Signature gauche ---
  doc.setFontSize(9)
  doc.setTextColor(161, 161, 170)
  doc.text('Verif-IA', 70, 185, { align: 'center' })
  doc.setDrawColor(113, 113, 122)
  doc.setLineWidth(0.3)
  doc.line(40, 180, 100, 180)
  doc.setFontSize(8)
  doc.setTextColor(113, 113, 122)
  doc.text('Plateforme', 70, 190, { align: 'center' })

  // --- Signature droite ---
  doc.setFontSize(9)
  doc.setTextColor(161, 161, 170)
  doc.text('Score : 10 / 10', W - 70, 185, { align: 'center' })
  doc.setDrawColor(113, 113, 122)
  doc.setLineWidth(0.3)
  doc.line(W - 100, 180, W - 40, 180)
  doc.setFontSize(8)
  doc.setTextColor(113, 113, 122)
  doc.text('Résultat', W - 70, 190, { align: 'center' })

  doc.save(`certificat-anti-desinformation-${username}.pdf`)
}
