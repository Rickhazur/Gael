# WhatsApp Progress Reports - Setup Guide

## Overview
Nova Tutor automatically sends progress reports to parents via WhatsApp after each tutoring session.

## Features
- ✅ Automated progress tracking
- ✅ Real-time performance metrics
- ✅ Struggling topic detection
- ✅ Remediation suggestions
- ✅ Achievement recognition
- ✅ Bilingual reports (English & Spanish)

## Setup Instructions

### 1. Get Twilio Account
1. Sign up at [twilio.com](https://www.twilio.com)
2. Get your Account SID and Auth Token
3. Enable WhatsApp messaging
4. Get a WhatsApp-enabled phone number

### 2. Configure Environment Variables
Add to your `.env` file:

```env
# Twilio WhatsApp Configuration
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
WHATSAPP_FROM_NUMBER=whatsapp:+14155238886
WHATSAPP_API_URL=https://api.twilio.com/2010-04-01/Accounts
```

### 3. Parent Phone Number Collection
During student enrollment, collect:
- Parent/Guardian name
- WhatsApp phone number (with country code)
- Preferred language (English/Spanish)
- Report frequency (session/daily/weekly)

Example format:
```
Parent Name: María González
WhatsApp: +573001234567 (Colombia)
Language: Spanish
Frequency: After each session
```

### 4. Database Schema
Add to your Supabase `profiles` table:

```sql
ALTER TABLE profiles ADD COLUMN parent_name TEXT;
ALTER TABLE profiles ADD COLUMN parent_whatsapp TEXT;
ALTER TABLE profiles ADD COLUMN report_language TEXT DEFAULT 'es';
ALTER TABLE profiles ADD COLUMN report_frequency TEXT DEFAULT 'session';
```

Create `student_progress` table:

```sql
CREATE TABLE student_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES profiles(id),
  session_date TIMESTAMP DEFAULT NOW(),
  topics_practiced TEXT[],
  questions_attempted INTEGER,
  questions_correct INTEGER,
  accuracy_rate DECIMAL,
  struggling_topics TEXT[],
  remediation_suggested BOOLEAN,
  time_spent INTEGER,
  achievements TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Report Content

### Spanish Example:
```
📊 *Reporte de Progreso - Nova Tutor*

👤 *Estudiante:* Ana García (Grado 3)
📅 *Fecha:* 31/12/2024
⏱️ *Tiempo de práctica:* 25 minutos

📚 *Temas practicados:*
  • División
  • Multiplicación
  • Fracciones

📈 *Rendimiento:*
  ✅ Respuestas correctas: 18/20
  📊 Tasa de precisión: 90%

🏆 *Logros de hoy:*
  ⭐ ¡Excelente precisión! (90%+)
  ⭐ ¡Gran dedicación! (20+ preguntas)

✨ *Nova Schola - Educación Personalizada*
```

### English Example:
```
📊 *Progress Report - Nova Tutor*

👤 *Student:* John Smith (Grade 4)
📅 *Date:* 12/31/2024
⏱️ *Practice time:* 30 minutes

📚 *Topics practiced:*
  • Division
  • Fractions
  • Decimals

📈 *Performance:*
  ✅ Correct answers: 22/25
  📊 Accuracy rate: 88%

⚠️ *Areas needing reinforcement:*
  • Fractions

💡 *Tutor recommendation:*
We suggest reviewing the following topics:
  • Multiplication
  • Division

🏆 *Today's achievements:*
  ⭐ Extended practice session! (30+ minutes)

✨ *Nova Schola - Personalized Education*
```

## Triggering Reports

### Automatic (Recommended)
Reports are sent automatically after each session when:
- Student completes a tutoring session
- Minimum 5 questions attempted
- At least 5 minutes of practice time

### Manual Trigger
Call the function manually:
```typescript
await sendProgressReport(parentWhatsAppNumber);
```

## Testing

### Test Mode
Use Twilio's test credentials to avoid charges:
```env
TWILIO_ACCOUNT_SID=ACtest...
TWILIO_AUTH_TOKEN=test_token
```

### Test WhatsApp Number
Twilio provides a sandbox number for testing:
```
whatsapp:+14155238886
```

Parents must first send "join [sandbox-name]" to this number.

## Cost Estimation

Twilio WhatsApp pricing (as of 2024):
- **Outbound messages:** ~$0.005 per message
- **Monthly cost (30 students, daily reports):** ~$4.50/month
- **Monthly cost (30 students, session reports, 3x/week):** ~$1.35/month

## Privacy & Compliance

✅ **GDPR Compliant:** Parents opt-in during enrollment  
✅ **Data Protection:** Phone numbers encrypted in database  
✅ **Opt-out:** Parents can unsubscribe anytime  
✅ **Secure:** Uses Twilio's encrypted API  

## Troubleshooting

### Report not sending?
1. Check Twilio credentials in `.env`
2. Verify parent phone number format (+country code)
3. Check Twilio console for error logs
4. Ensure WhatsApp is enabled on Twilio account

### Wrong language?
- Verify `report_language` in database
- Check student profile settings

### Missing data?
- Ensure progress tracking is enabled
- Check that session lasted at least 5 minutes
- Verify at least 5 questions were attempted

## Future Enhancements

- [ ] Weekly summary reports
- [ ] Monthly progress charts
- [ ] Comparison with grade-level benchmarks
- [ ] Parent response handling ("Reply STOP to unsubscribe")
- [ ] Rich media (charts, graphs via WhatsApp)
- [ ] Multi-parent support (send to both parents)

## Support

For issues or questions:
- Email: support@novaschola.com
- Documentation: [docs.novaschola.com](https://docs.novaschola.com)
