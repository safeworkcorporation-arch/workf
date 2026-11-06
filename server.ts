import express, { Request, Response } from 'express';
import nodemailer, { Transporter } from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Helper to parse SMTP error into clear Spanish messages with troubleshooting hints
function parseSmtpError(error: any): string {
  const msg = error?.message || String(error);
  const code = error?.code;
  const responseCode = error?.responseCode;

  if (code === 'EAUTH' || responseCode === 535 || msg.includes('Invalid login') || msg.includes('BadCredentials') || msg.includes('Username and Password not accepted')) {
    return 'Error de autenticación (535): Usuario o contraseña incorrectos. Si usas Hotmail/Outlook y tienes verificación en 2 pasos activada, debes generar una "Contraseña de aplicación" en tu cuenta de Microsoft (account.microsoft.com/security). Si usas Gmail, Google exige usar una contraseña de aplicación de 16 letras.';
  }
  if (code === 'ETIMEDOUT' || code === 'ESOCKET' || msg.includes('ETIMEDOUT') || msg.includes('timeout')) {
    return 'Tiempo de espera agotado al conectar al servidor SMTP. Verifica que el servidor host y el puerto sean correctos (ej: puerto 465 con SSL para Gmail o puerto 587 con TLS para Hotmail/Outlook).';
  }
  if (code === 'ECONNREFUSED' || msg.includes('ECONNREFUSED')) {
    return 'Conexión rechazada por el servidor de correo. Verifica la dirección del servidor SMTP y el número de puerto.';
  }
  if (code === 'EENVELOPE' || msg.includes('No recipients defined')) {
    return 'La dirección de correo electrónico del destinatario no es válida o está vacía.';
  }
  return `Error de conexión con el servidor de correo: ${msg}`;
}

// Helper to create real mail transporter if config is valid
function createMailTransporter(customConfig?: {
  host?: string;
  port?: number;
  secure?: boolean;
  user?: string;
  pass?: string;
  service?: string;
}) {
  // 1. Custom client config provided
  if (customConfig?.user?.trim() && customConfig?.pass?.trim()) {
    const user = customConfig.user.trim();
    const pass = customConfig.pass.trim();
    const host = customConfig.host?.trim() || '';
    const isGmail =
      customConfig.service === 'gmail' ||
      host.includes('gmail.com') ||
      user.toLowerCase().endsWith('@gmail.com');

    if (isGmail) {
      return nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass },
        connectionTimeout: 15000,
        greetingTimeout: 15000,
        socketTimeout: 20000,
      });
    }

    const isHotmail =
      customConfig.service === 'outlook' ||
      customConfig.service === 'hotmail' ||
      host.includes('outlook') ||
      host.includes('office365') ||
      host.includes('live.com') ||
      user.toLowerCase().endsWith('@hotmail.com') ||
      user.toLowerCase().endsWith('@outlook.com') ||
      user.toLowerCase().endsWith('@live.com');

    const port = Number(customConfig.port) || (isHotmail ? 587 : 587);
    const secure = customConfig.secure !== undefined ? Boolean(customConfig.secure) : port === 465;

    return nodemailer.createTransport({
      host: host || (isHotmail ? 'smtp-mail.outlook.com' : 'smtp-mail.outlook.com'),
      port,
      secure,
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 20000,
    });
  }

  // 2. Server environment variables
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    const user = process.env.SMTP_USER.trim();
    const pass = process.env.SMTP_PASS.trim();
    const host = process.env.SMTP_HOST?.trim() || '';
    const isGmail = host.includes('gmail.com') || user.toLowerCase().endsWith('@gmail.com');

    if (isGmail) {
      return nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass },
        connectionTimeout: 15000,
        greetingTimeout: 15000,
        socketTimeout: 20000,
      });
    }

    const port = Number(process.env.SMTP_PORT) || 587;
    const secure = process.env.SMTP_SECURE === 'true' || port === 465;

    return nodemailer.createTransport({
      host: host || 'smtp.office365.com',
      port,
      secure,
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 20000,
    });
  }

  return null;
}

// API Route: Test SMTP Connection
app.post('/api/test-smtp', async (req: Request, res: Response): Promise<void> => {
  try {
    const { smtpConfig } = req.body;
    if (!smtpConfig?.user || !smtpConfig?.pass) {
      res.status(400).json({
        success: false,
        error: 'Debes ingresar el usuario/correo remitente y la contraseña (o contraseña de aplicación de 16 caracteres).',
      });
      return;
    }

    const transporter = createMailTransporter(smtpConfig);
    if (!transporter) {
      res.status(400).json({
        success: false,
        error: 'No se pudo inicializar la conexión con los datos provistos.',
      });
      return;
    }

    // Verify SMTP connection
    await transporter.verify();

    res.json({
      success: true,
      message: `¡Conexión SMTP exitosa con "${smtpConfig.user}"! Tu servidor de correo está verificado y listo para entregar correos reales directamente a tus clientes.`,
    });
  } catch (error: any) {
    console.error('SMTP test connection failed:', error);
    res.status(400).json({
      success: false,
      error: parseSmtpError(error),
    });
  }
});

// API Route: Send Technical Service Report Email
app.post('/api/send-email', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      to,
      cc,
      subject,
      html,
      text,
      fromName,
      pdfBase64,
      filename = 'Hoja_de_Servicio.pdf',
      additionalAttachments,
      smtpConfig,
    } = req.body;

    if (!to) {
      res.status(400).json({ error: 'El campo destinatario (to) es requerido' });
      return;
    }

    let transporter: Transporter<any> | null = createMailTransporter(smtpConfig);
    let isTest = false;
    let previewUrl: string | null = null;

    if (!transporter) {
      // Fallback: Create Ethereal test account for instant testing
      try {
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
        isTest = true;
      } catch (err) {
        console.warn('Could not create Ethereal test account, creating JSON transport fallback:', err);
        transporter = nodemailer.createTransport({
          jsonTransport: true,
        });
        isTest = true;
      }
    }

    if (!transporter) {
      res.status(500).json({
        success: false,
        error: 'No se pudo inicializar el servicio de envío de correos.',
      });
      return;
    }

    const attachments: Array<{ filename: string; content: Buffer; contentType?: string }> = [];

    // System-generated PDF (if provided)
    if (pdfBase64) {
      // Remove data URL prefix if present
      const cleanBase64 = pdfBase64.replace(/^data:application\/pdf;base64,/, '');
      attachments.push({
        filename,
        content: Buffer.from(cleanBase64, 'base64'),
        contentType: 'application/pdf',
      });
    }

    // Additional files and invoices uploaded from the user's PC
    if (Array.isArray(additionalAttachments)) {
      for (const att of additionalAttachments) {
        if (att && att.contentBase64 && att.filename) {
          const rawBase64 = att.contentBase64.includes(';base64,')
            ? att.contentBase64.split(';base64,')[1]
            : att.contentBase64;
          attachments.push({
            filename: att.filename,
            content: Buffer.from(rawBase64, 'base64'),
            contentType: att.contentType || 'application/octet-stream',
          });
        }
      }
    }

    const senderEmail =
      smtpConfig?.user ||
      process.env.SMTP_FROM ||
      process.env.SMTP_USER ||
      'servicios@safework.com';

    const senderDisplayName =
      fromName ||
      'Safe Work Corporation';

    const fromAddress = senderEmail.includes('<')
      ? senderEmail
      : `"${senderDisplayName}" <${senderEmail}>`;

    const mailOptions: any = {
      from: fromAddress,
      to,
      cc: cc || undefined,
      subject: subject || 'Documento Oficial - Safe Work Corporation',
      text: text || undefined,
      html: html || '<p>Adjunto encontrará el documento oficial correspondiente.</p>',
      attachments,
      headers: {
        'Auto-Submitted': 'no',
        'X-Auto-Response-Suppress': 'OOF, AutoReply',
      },
    };

    const info = await transporter.sendMail(mailOptions);
    if (isTest) {
      previewUrl = nodemailer.getTestMessageUrl(info) || null;
    }

    res.json({
      success: true,
      messageId: info.messageId,
      previewUrl,
      isTest,
      realDelivery: !isTest,
      fromAddress,
      message: isTest
        ? 'AVISO: El correo se procesó en modo SIMULADOR (Ethereal Mail) porque aún no has configurado un servidor SMTP propio. NO fue entregado a la bandeja real del cliente. Puedes ver la vista previa en el enlace.'
        : `¡Correo real enviado y entregado exitosamente a ${to}${cc ? ` (con copia a ${cc})` : ''} desde ${fromAddress}!`,
    });
  } catch (error: any) {
    console.error('Error sending email:', error);
    res.status(500).json({
      success: false,
      error: parseSmtpError(error),
    });
  }
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Dev server or Production static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
