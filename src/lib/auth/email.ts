type EmailMessage = {
  to: string;
  subject: string;
  text: string;
};

async function sendViaConsole(message: EmailMessage): Promise<void> {
  const banner = "─".repeat(60);
  console.log(
    `\n${banner}\n[mail] 模拟发送邮件\n  to:      ${message.to}\n  subject: ${message.subject}\n\n${message.text}\n${banner}\n`,
  );
}

export async function sendEmail(message: EmailMessage): Promise<void> {
  const driver = process.env.MAIL_DRIVER ?? "console";
  if (driver === "console") {
    await sendViaConsole(message);
    return;
  }
  throw new Error(
    `Unsupported MAIL_DRIVER: ${driver}. Only "console" is wired up for now.`,
  );
}

export function buildLoginCodeEmail(email: string, code: string): EmailMessage {
  return {
    to: email,
    subject: `你的登录验证码：${code}`,
    text:
      `你好，\n\n` +
      `你的 my-knowledge 登录验证码是：${code}\n\n` +
      `15 分钟内有效，输错 5 次会失效。\n` +
      `如果不是你本人操作，请忽略此邮件。\n`,
  };
}
