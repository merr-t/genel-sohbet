# Sohbet

Vercel + Upstash Redis üzerinde çalışan basit sohbet uygulaması.

## Kurulum (Vercel)
Projeyi Vercel'e aktarın ve **Settings → Environment Variables** altına şunları ekleyin:

| Değişken | Değer |
|---|---|
| `CHAT_AUTH` | Şifre doğrulama verisi (repoda yok, gizli) |
| `DECOY_CHAT` | Yanlış şifrede gösterilen sohbet (repoda yok, gizli) |
| `UPSTASH_REDIS_REST_URL` | Upstash REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash REST token |

Değerleri değiştirdikten sonra yeniden deploy edin. Gizli değerler **asla** commit edilmez (`.gitignore`).
