import nodemailer from "nodemailer";
import { Resend } from "resend";

type EmailMessage = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

async function sendViaConsole(message: EmailMessage): Promise<void> {
  const banner = "─".repeat(60);
  console.log(
    `\n${banner}\n[mail] 模拟发送邮件\n  to:      ${message.to}\n  subject: ${message.subject}\n\n${message.text}\n${banner}\n`,
  );
}

async function sendViaResend(message: EmailMessage): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM;

  if (!apiKey || apiKey === "re_xxxxxxxxx") {
    throw new Error(
      "RESEND_API_KEY 未配置。请把 re_xxxxxxxxx 替换成你真实的 Resend API key。",
    );
  }

  if (!from) {
    throw new Error(
      "MAIL_FROM 未配置。请设置一个已在 Resend 验证过的发件邮箱，例如 noreply@你的域名.com。",
    );
  }

  const resend = new Resend(apiKey);
  const result = await resend.emails.send({
    from,
    to: message.to,
    subject: message.subject,
    text: message.text,
    html:
      message.html ??
      `<p>${message.text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\n/g, "<br />")}</p>`,
  });

  if (result.error) {
    throw new Error(`Resend 发送失败：${result.error.message}`);
  }
}

async function sendViaSmtp(message: EmailMessage): Promise<void> {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? "465");
  const secure = (process.env.SMTP_SECURE ?? "true") === "true";
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.MAIL_FROM ?? user;

  if (!host || !user || !pass || !from) {
    throw new Error(
      "SMTP 配置不完整。请至少设置 SMTP_HOST / SMTP_USER / SMTP_PASS / MAIL_FROM。",
    );
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });

  await transporter.sendMail({
    from,
    to: message.to,
    subject: message.subject,
    text: message.text,
    html:
      message.html ??
      `<p>${message.text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\n/g, "<br />")}</p>`,
  });
}

export async function sendEmail(message: EmailMessage): Promise<void> {
  const driver = process.env.MAIL_DRIVER ?? "console";

  if (driver === "console") {
    await sendViaConsole(message);
    return;
  }

  if (driver === "resend") {
    await sendViaResend(message);
    return;
  }

  if (driver === "smtp") {
    await sendViaSmtp(message);
    return;
  }

  throw new Error(
    `Unsupported MAIL_DRIVER: ${driver}. Allowed drivers: console | resend | smtp.`,
  );
}

export function buildLoginCodeEmail(email: string, code: string): EmailMessage {
  const productName = "超级个体";
  return {
    to: email,
    subject: `你的 ${productName} 登录验证码：${code}`,
    text:
      `你好，\n\n` +
      `你正在登录 ${productName}。\n` +
      `本次验证码是：${code}\n\n` +
      `15 分钟内有效，输错 5 次会失效。\n` +
      `如果不是你本人操作，请忽略此邮件。\n`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif; line-height: 1.7; color: #111827;">
        <p>你好，</p>
        <p>你正在登录 <strong>${productName}</strong>。</p>
        <p>本次验证码是：</p>
        <div style="display: inline-block; padding: 10px 16px; background: #111827; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: 0.4em; border-radius: 10px;">
          ${code}
        </div>
        <p style="margin-top: 16px; color: #4b5563;">15 分钟内有效，输错 5 次会失效。</p>
        <p style="color: #6b7280; font-size: 14px;">如果不是你本人操作，请忽略此邮件。</p>
      </div>
    `,
  };
}
