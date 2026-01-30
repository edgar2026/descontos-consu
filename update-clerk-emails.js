const CLERK_SECRET_KEY = 'sk_test_PgyW04zr4WP6PgEkKwBBlDOrJTmDIkAE8qQ7hRBb1Z';

async function updateTemplates() {
  const templates = [
    {
      slug: 'verification_code',
      name: 'Código de Verificação',
      subject: '🔑 Seu Código de Verificação - UNINASSAU',
      body: `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f6f9fc; padding: 40px 0;">
  <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid #e1e8f0;">
    <div style="background-color: #0046ad; padding: 30px 20px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 900; letter-spacing: 1px;">SISTEMA DE DESCONTO</h1>
      <p style="color: #ffffff; opacity: 0.8; margin: 5px 0 0; font-size: 10px; font-weight: bold; letter-spacing: 3px; text-transform: uppercase;">Uninassau Olinda</p>
    </div>
    <div style="padding: 40px 30px; text-align: center;">
      <h2 style="color: #1a1a1a; margin-bottom: 10px; font-size: 22px; font-weight: 900;">Código de Verificação</h2>
      <p style="color: #666666; font-size: 14px; margin-bottom: 30px; line-height: 1.5;">
        Olá! Para acessar sua conta no portal de descontos, utilize o código abaixo:
      </p>
      <div style="background-color: #f0f7ff; border: 2px solid #0046ad; border-radius: 12px; padding: 25px; margin-bottom: 30px;">
        <span style="font-family: 'Courier New', Courier, monospace; font-size: 42px; font-weight: 900; color: #0046ad; letter-spacing: 10px;">{{otp_code}}</span>
      </div>
      <p style="color: #999999; font-size: 12px; font-style: italic;">
        Este código é temporário. Por segurança, não o compartilhe.
      </p>
    </div>
    <div style="background-color: #fafbfc; padding: 30px; border-top: 1px solid #eef2f6; text-align: center;">
      <p style="color: #a0aec0; font-size: 11px; margin: 0;">© 2025 UNINASSAU Olinda • Gestão Acadêmica</p>
      <p style="color: #cbd5e0; font-size: 9px; margin-top: 5px;">Desenvolvido por <strong>Edgar Tavares</strong></p>
    </div>
  </div>
</div>`
    },
    {
      slug: 'reset_password_code',
      name: 'Redefinição de Senha',
      subject: '🔄 Redefinição de Senha - UNINASSAU',
      body: `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f6f9fc; padding: 40px 0;">
  <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid #e1e8f0;">
    <div style="background-color: #0046ad; padding: 30px 20px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 900; letter-spacing: 1px;">SISTEMA DE DESCONTO</h1>
    </div>
    <div style="padding: 40px 30px; text-align: center;">
      <h2 style="color: #1a1a1a; margin-bottom: 10px; font-size: 22px; font-weight: 900;">Redefinir sua Senha</h2>
      <p style="color: #666666; font-size: 14px; margin-bottom: 30px; line-height: 1.5;">
        Para prosseguir com a alteração da sua senha, use o código abaixo:
      </p>
      <div style="background-color: #f0f7ff; border: 2px solid #0046ad; border-radius: 12px; padding: 25px; margin-bottom: 30px;">
        <span style="font-family: 'Courier New', Courier, monospace; font-size: 42px; font-weight: 900; color: #0046ad; letter-spacing: 10px;">{{otp_code}}</span>
      </div>
    </div>
    <div style="background-color: #fafbfc; padding: 30px; border-top: 1px solid #eef2f6; text-align: center;">
      <p style="color: #a0aec0; font-size: 11px; margin: 0;">© 2025 UNINASSAU Olinda</p>
    </div>
  </div>
</div>`
    }
  ];

  console.log('🚀 Iniciando atualização final...');

  for (const template of templates) {
    try {
      console.log(`\nAtualizando: ${template.slug}...`);

      const response = await fetch(`https://api.clerk.com/v1/templates/email/${template.slug}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: template.name,
          subject: template.subject,
          body: template.body
        })
      });

      console.log('Status:', response.status);
      const text = await response.text();

      if (response.ok) {
        console.log(`✅ ${template.slug} atualizado com sucesso!`);
      } else {
        console.error(`❌ Erro em ${template.slug}:`, text);
      }
    } catch (err) {
      console.error(`❌ Erro fatal:`, err);
    }
  }
}

updateTemplates();
