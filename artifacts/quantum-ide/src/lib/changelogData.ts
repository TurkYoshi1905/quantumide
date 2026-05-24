export interface ChangelogEntry {
  version: string;
  date: string;
  tag: 'major' | 'minor' | 'patch';
  changes: {
    type: 'new' | 'fix' | 'improve' | 'remove';
    text: string;
  }[];
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: 'v0.0.3',
    date: '24 Mayıs 2026',
    tag: 'patch',
    changes: [
      { type: 'fix',     text: 'Settings sayfasında RefreshCw ikonu tanımsız hatası düzeltildi' },
      { type: 'fix',     text: 'API anahtarı düzenleme modalı artık düzgün açılıyor' },
      { type: 'fix',     text: 'Kayıt sonrası doğrulama e-postası sayfasına yönlendirme düzeltildi' },
      { type: 'new',     text: 'Güncelleme Notları sekmesi eklendi (bu sayfa)' },
      { type: 'improve', text: 'AI panelinde API anahtarı seçilince Puter bağlantı uyarısı artık görünmüyor' },
    ],
  },
  {
    version: 'v0.0.2',
    date: '24 Mayıs 2026',
    tag: 'minor',
    changes: [
      { type: 'new',     text: 'DefaultPrompt.txt — 500+ satır profesyonel AI sistem promptu oluşturuldu' },
      { type: 'new',     text: 'Sistem promptu artık ayarlardan düzenlenemiyor (read-only koruma)' },
      { type: 'new',     text: 'Supabase şeması 7 ayrı tabloya ayrıldı (profiles, projects, conversations, api_keys, github_integrations, user_settings, user_data)' },
      { type: 'improve', text: 'supabase-schema.sql tüm yorumlar İngilizce olarak yeniden yazıldı' },
      { type: 'improve', text: 'AI sistem promptu artık DefaultPrompt.txt dosyasından dinamik olarak yükleniyor' },
      { type: 'improve', text: 'Kayıt sayfasına şifreyi göster/gizle butonu eklendi' },
    ],
  },
  {
    version: 'v0.0.1',
    date: '23 Mayıs 2026',
    tag: 'major',
    changes: [
      { type: 'new',     text: 'QuantumIDE ilk sürümü yayınlandı' },
      { type: 'new',     text: 'Monaco Editor entegrasyonu — söz dizimi vurgulama, otomatik tamamlama' },
      { type: 'new',     text: 'AI sohbet asistanı — Puter (ücretsiz), OpenAI, Anthropic, Google, Mistral, DeepSeek desteği' },
      { type: 'new',     text: 'Çoklu proje ve dosya yönetimi (klasör/dosya ağacı)' },
      { type: 'new',     text: 'Sohbet geçmişi — yeni sohbet, yeniden adlandırma, silme' },
      { type: 'new',     text: 'Shell terminal paneli (editor ile split view)' },
      { type: 'new',     text: 'Supabase entegrasyonu — bulut veri senkronizasyonu' },
      { type: 'new',     text: 'E-posta doğrulama akışı' },
      { type: 'new',     text: 'GitHub sync scripti (GITHUB_PAT ile)' },
      { type: 'new',     text: 'VibeCoding modu — doğal dil ile proje oluşturma' },
      { type: 'new',     text: 'Dosya işlem ikonları: FilePlus (oluştur), FilePen (düzenle), FileMinus (sil)' },
      { type: 'new',     text: 'Dark purple tema (#7c3aed primary) ve Türkçe arayüz' },
      { type: 'new',     text: 'Ayarlar: API anahtarları, AI modelleri, sistem promptu, GitHub, görünüm, hesap sekmeleri' },
    ],
  },
];
