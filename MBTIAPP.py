import streamlit as st
import joblib
import re
import emoji
from nltk.corpus import stopwords
from sentence_transformers import SentenceTransformer
import pandas as pd
import nltk




nltk.download('stopwords')

# MBTI açıklamaları
mbti_info = {

    'INTJ': {
        'description': (
            "INTJ kişilik tipi, yüksek analitik düşünce gücü ve stratejik planlama becerileriyle tanınır. "
            "Karmaşık sorunları sistematik olarak çözme ve uzun vadeli hedefler oluşturma konusunda ustadırlar. "
            "Bağımsızlıklarına düşkündürler ve yenilikçi, özgün fikirler geliştirmede doğal yetenek sahibidirler."
        ),
        'positive': (
            "- Geniş perspektifli ve ileri görüşlü düşünce yapısı.\n"
            "- Zorlu problemlere çözüm odaklı, mantıklı yaklaşım.\n"
            "- Kendi hedeflerine disiplinli ve kararlı ilerleme."
        ),
        'negative': (
            "- Sosyal iletişimde mesafeli ve duygusal ifadede kısıtlı olabilirler.\n"
            "- Mükemmeliyetçilik nedeniyle gereksiz detaylarda takılabilirler.\n"
            "- Empati kurmakta ve duygusal bağlarda zorluk yaşayabilirler."
        ),
        'tips': (
            "- Takım çalışmasına zaman ayırarak sosyal becerilerinizi geliştirin.\n"
            "- Görevlerde zaman yönetimi yaparak mükemmeliyetçiliği dengeleyin.\n"
            "- Aktif dinleme ve empati teknikleri üzerinde çalışın."
        )
    },

    'INTP': {
        'description': (
            "INFP tipi, entelektüel merak ve yaratıcı düşünceye sahip bireylerdir. "
            "Teorik kavramlar ve soyut düşüncelerle ilgilenirler; yeni fikirler üretmede oldukça yetkindirler. "
            "Ancak karar alma süreçlerinde bazen kararsızlık yaşayabilir ve uygulamada gecikebilirler."
        ),
        'positive': (
            "- Yaratıcı ve özgün düşünce üretme yeteneği.\n"
            "- Derinlemesine analiz yapma ve öğrenme isteği.\n"
            "- Yeni fikirleri keşfetme konusunda yüksek motivasyon."
        ),
        'negative': (
            "- Kararsızlık ve erteleme eğilimi performansı etkileyebilir.\n"
            "- Sosyal etkileşimlerde geri çekilme eğilimi görülebilir.\n"
            "- Pratik uygulama ve detaylarda eksiklik yaşanabilir."
        ),
        'tips': (
            "- Karar verme mekanizmasını güçlendirmek için net kriterler belirleyin.\n"
            "- Sosyal becerilerinizi geliştirmek adına grup aktivitelerine katılın.\n"
            "- Proje yönetim teknikleriyle planlama becerilerinizi artırın."
        )
    },

    'ENTJ': {
        'description': (
            "ENTJ tipi, doğal liderlik özelliklerine sahip, hedef odaklı ve organize bireylerdir. "
            "Hızlı karar alma ve güçlü iletişim yetenekleriyle ekip yönetiminde başarılıdırlar. "
            "Stratejik düşünce ve kararlılıklarıyla büyük projeleri yönetebilirler."
        ),
        'positive': (
            "- Güçlü vizyon ve liderlik becerileri.\n"
            "- Hızlı ve etkili karar alma yeteneği.\n"
            "- Organizasyon ve motivasyon konusunda üst düzey performans."
        ),
        'negative': (
            "- Otokratik tutum ekip içi motivasyonu olumsuz etkileyebilir.\n"
            "- Duygusal hassasiyet eksikliği iletişim sorunlarına yol açabilir.\n"
            "- Bazen ekip üyelerinin görüşlerini yeterince dikkate almayabilirler."
        ),
        'tips': (
            "- Empati ve aktif dinleme becerilerini geliştirmeye önem verin.\n"
            "- Karar alma süreçlerinde ekipten geri bildirim alarak dengeyi sağlayın.\n"
            "- Duygusal zekanızı artırmak için kişisel farkındalık egzersizleri yapın."
        )
    },

    'ENTP': {
        'description': (
            "ENTP tipi, yenilikçi ve esnek düşünebilen bireylerdir. "
            "Farklı bakış açıları geliştirir ve tartışmalarda canlılık yaratırlar. "
            "Yeni projelere başlama konusunda yüksek motivasyona sahiptirler, ancak bazen işlerin tamamlanmasında zorlanabilirler."
        ),
        'positive': (
            "- Yaratıcı ve yenilikçi fikirler üretme kapasitesi.\n"
            "- Esnek ve uyumlu düşünce yapısı.\n"
            "- Sosyal ortamlarda enerjik ve motive edici tavır."
        ),
        'negative': (
            "- Dikkatsizlik ve odaklanma problemleri proje tamamlama sürecini etkileyebilir.\n"
            "- Uzun süreli disiplin gerektiren görevlerde motivasyon kaybı yaşanabilir.\n"
            "- Bazen sorumlulukları tamamlamada zorlanabilirler."
        ),
        'tips': (
            "- Proje yönetimi ve görev takibi için araçlar kullanın.\n"
            "- Küçük ve somut hedeflerle başarı hissini artırın.\n"
            "- Dikkat ve odaklanmayı artırıcı teknikleri deneyin."
        )
    },

    'INFJ': {
        'description': (
            "INFJ tipi, empatik ve idealist kişilik özelliklerine sahip bireylerdir. "
            "Derin insan ilişkilerine önem verir, anlam arayışı içindedirler ve yaratıcı projelerde başarılı olurlar. "
            "Duygusal zekaları yüksek, ancak zaman zaman aşırı hassasiyet yaşayabilirler."
        ),
        'positive': (
            "- Yüksek empati yeteneği ve başkalarına ilham verme gücü.\n"
            "- Derin içsel motivasyon ve güçlü vizyon.\n"
            "- İnsanların duygusal ihtiyaçlarını anlama becerisi."
        ),
        'negative': (
            "- Aşırı hassasiyet nedeniyle stres ve tükenmişlik yaşayabilirler.\n"
            "- Gerçeklikten kopma ve hayal dünyasında kaybolma riski vardır.\n"
            "- Kendilerini ihmal etme eğilimi gösterebilirler."
        ),
        'tips': (
            "- Duygusal denge için düzenli mindfulness veya meditasyon uygulayın.\n"
            "- Kişisel sınırlar belirleyerek kendinize özen gösterin.\n"
            "- Sosyal destek ağlarını güçlendirin."
        )
    },

    'INFP': {
        'description': (
            "INFP bireyler, içsel değerlerine bağlı, yaratıcı ve empatik kişiliklerdir. "
            "Kişisel inançlarına sıkı sıkıya bağlıdırlar ve dünyaya anlam katmayı amaçlarlar. "
            "İçsel motivasyonları güçlüdür, ancak kararsızlık ve çekingenlik zaman zaman onları zorlayabilir."
        ),
        'positive': (
            "- Güçlü ahlaki değerler ve empati yeteneği.\n"
            "- Yaratıcı ve derin duygusal ifade kapasitesi.\n"
            "- Başkalarının duygularını anlama ve destekleme becerisi."
        ),
        'negative': (
            "- Kararsızlık ve harekete geçmede gecikme yaşanabilir.\n"
            "- Sosyal ortamlarda çekingenlik ve içe dönüklük görülebilir.\n"
            "- Duygusal yük altında kalma riski vardır."
        ),
        'tips': (
            "- Küçük ve ulaşılabilir hedefler belirleyerek eyleme geçin.\n"
            "- Sosyal etkinliklere katılarak iletişim becerilerinizi güçlendirin.\n"
            "- Kendinize yönelik öz bakım ve sınırlar belirleyin."
        )
    },

    'ENFJ': {
        'description': (
            "ENFJ bireyler, güçlü iletişim ve liderlik becerileriyle ekipleri motive eden sosyal liderlerdir. "
            "İnsan ilişkilerinde uyum ve ilham kaynağı olurlar, başkalarının potansiyelini açığa çıkarmada ustadırlar."
        ),
        'positive': (
            "- İlham veren liderlik ve etkili iletişim yeteneği.\n"
            "- Başkalarının gelişimini destekleme becerisi.\n"
            "- Sosyal uyum ve empati yüksek düzeydedir."
        ),
        'negative': (
            "- Onay arayışı nedeniyle duygusal tükenme yaşayabilirler.\n"
            "- Kendini ihmal etme ve aşırı sorumluluk alma riski vardır.\n"
            "- Kendi ihtiyaçlarını ikinci plana atma eğilimi gösterirler."
        ),
        'tips': (
            "- Kişisel sınırlar koyarak sağlıklı dengeyi koruyun.\n"
            "- Geri bildirim verirken empati ve açık iletişim kullanın.\n"
            "- Kendinize de zaman ayırmayı ihmal etmeyin."
        )
    },

    'ENFP': {
        'description': (
            "ENFP’ler enerjik, yaratıcı ve yeni fikirlere açık bireylerdir. Sosyal ortamlarda parıldarlar."
        ),
        'positive': (
            "- Yüksek motivasyon ve yaratıcı bakış açısı.\n"
            "- İnsanları cesaretlendirme becerisi.\n"
            "- Güçlü iletişim yeteneği ve hayal gücü."
        ),
        'negative': (
            "- Dikkat dağınıklığı ve kararsızlık.\n"
            "- Rutin işlerden kolayca sıkılma.\n"
            "- Plansızlık nedeniyle zaman kaybı."
        ),
        'tips': (
            "- Günlük hedefler belirleyip odaklanın.\n"
            "- Kendi fikirlerinizi kısa notlarla takip edin.\n"
            "- Yarım bıraktığınız işleri tamamlayın."
        )
    },
    'ISTJ': {
        'description': (
            "ISTJ’ler sorumluluk sahibi, düzenli ve pratik çözüm odaklıdır. Kurallara ve planlara bağlı kalırlar."
        ),
        'positive': (
            "- Güvenilir ve disiplinli yapıya sahiptir.\n"
            "- Detaylara dikkat ederek çalışır.\n"
            "- Planlı ve metodik düşünür."
        ),
        'negative': (
            "- Değişime karşı direnç gösterebilir.\n"
            "- Duyguları ifade etmekte zorlanabilir.\n"
            "- Fazla katı kurallarla yaklaşabilir."
        ),
        'tips': (
            "- Zihinsel esneklik için yeni yollar deneyin.\n"
            "- Farklı fikirleri değerlendirmeye açık olun.\n"
            "- Sosyal geri bildirimlere önem verin."
        )
    },
    'ISFJ': {
        'description': (
            "ISFJ’ler yardımsever, sadık ve detay odaklı bireylerdir. Başkalarının ihtiyaçlarını ön planda tutarlar."
        ),
        'positive': (
            "- Empatik ve ilgili bir yaklaşıma sahiptir.\n"
            "- Organizasyon konusunda becerilidir.\n"
            "- Sorumluluk sahibidir ve güven verir."
        ),
        'negative': (
            "- Kendi ihtiyaçlarını geri plana atar.\n"
            "- Aşırı fedakârlık gösterebilir.\n"
            "- Eleştiriler karşısında içe kapanabilir."
        ),
        'tips': (
            "- Kendi sınırlarınızı belirlemeye çalışın.\n"
            "- Zaman zaman “hayır” demeyi öğrenin.\n"
            "- Kendinize vakit ayırmayı ihmal etmeyin."
        )
    },
    'ESTJ': {
        'description': (
            "ESTJ’ler liderlik ve organizasyonda doğaldır, karar alma süreçlerinde net ve pratik adımlar atarlar."
        ),
        'positive': (
            "- Liderlik vasfı güçlüdür ve yol gösterir.\n"
            "- Kararlı ve sistematik düşünür.\n"
            "- İşleri zamanında ve planlı yürütür."
        ),
        'negative': (
            "- Duygusal ihtiyaçları göz ardı edebilir.\n"
            "- Katı kurallar konusunda ısrarcı olabilir.\n"
            "- Esnek olmayan tutumlar sergileyebilir."
        ),
        'tips': (
            "- Değişen durumlara açık kalın.\n"
            "- Duygusal zekânızı geliştirmeye çalışın.\n"
            "- Ekibinizin fikirlerine zaman ayırın."
        )
    },
    'ESFJ': {
        'description': (
            "ESFJ’ler toplum odaklı, nazik ve yardımseverdir. Sosyal bağları güçlendirmeyi hedeflerler."
        ),
        'positive': (
            "- Destekleyici ve yardımseverdir.\n"
            "- İlişki yönetimi konusunda becerilidir.\n"
            "- İnsanlarla doğal bağ kurabilir."
        ),
        'negative': (
            "- Onay arayışına fazla önem verebilir.\n"
            "- Kendi ihtiyaçlarını ihmal edebilir.\n"
            "- Eleştirilerden çabuk etkilenebilir."
        ),
        'tips': (
            "- Kendi sınırlarınızı tanımlamayı öğrenin.\n"
            "- Eleştirileri kişisel algılamamaya çalışın.\n"
            "- Bireysel hedeflerinize odaklanın."
        )
    },
    'ISTP': {
        'description': (
            "ISTP’ler pratik ve analitik zekâya sahiptir, kriz anlarında soğukkanlılıkla hareket ederler."
        ),
        'positive': (
            "- Hızlı ve etkili problem çözer.\n"
            "- Teknik konularda ustalık gösterir.\n"
            "- Bağımsızlığına düşkündür."
        ),
        'negative': (
            "- Duygusal bağ kurmakta zorlanabilir.\n"
            "- Sosyal ortamlardan uzak durabilir.\n"
            "- Riskli kararlar alma eğilimindedir."
        ),
        'tips': (
            "- Duygularınızı analiz etmeye çalışın.\n"
            "- Sosyal ilişkilerde sabırlı olun.\n"
            "- Karar vermeden önce iki kez düşünün."
        )
    },
    'ISFP': {
        'description': (
            "ISFP’ler sanatsal, zarif ve huzurlu bir yaşam tarzı peşindedir. Duygularını estetik ifade ederler."
        ),
        'positive': (
            "- Yaratıcı ve içten bir yaklaşıma sahiptir.\n"
            "- Duygusal zekâsı gelişmiştir.\n"
            "- Uyumlu ve nazik bir kişiliği vardır."
        ),
        'negative': (
            "- Kararsız kalabilir, kararları erteleyebilir.\n"
            "- Kırılgan yapısından dolayı çekingen olabilir.\n"
            "- Plan yapmada zorluk yaşayabilir."
        ),
        'tips': (
            "- Karar süreçlerine zaman sınırı koyun.\n"
            "- Kendinizi ifade etmekten çekinmeyin.\n"
            "- Planlı yaşam için ajanda kullanın."
        )
    },
    'ESTP': {
        'description': (
            "ESTP’ler maceracı ve enerjik olup olay yerinde çözüm üretirler. Spontane karar verme konusunda başarılıdırlar."
        ),
        'positive': (
            "- Cesur ve eylem odaklıdır.\n"
            "- Enerjik yapısıyla çevresini etkiler.\n"
            "- Hızlı adapte olur ve çözümler sunar."
        ),
        'negative': (
            "- Uzun vadeli planlamayı ihmal edebilir.\n"
            "- Sabırsız ve dürtüsel davranabilir.\n"
            "- Sonuçları düşünmeden hareket edebilir."
        ),
        'tips': (
            "- Anlık kararlar öncesinde düşünün.\n"
            "- Zaman yönetimi tekniklerini uygulayın.\n"
            "- Uzun vadeli hedefler belirleyin."
        )
    },
    'ESFP': {
        'description': (
            "ESFP’ler neşeli ve sosyal olup etkinlikleri renklendirirler. Pratik ve yaratıcı çözümler üretirler."
        ),
        'positive': (
            "- Canlı ve eğlenceli bir enerji yayar.\n"
            "- İletişimde doğaldır ve sosyaldir.\n"
            "- Hayata olumlu bakar ve motive eder."
        ),
        'negative': (
            "- Anı yaşarken geleceği ihmal edebilir.\n"
            "- Dikkati kolay dağılabilir.\n"
            "- Maddi konularda plansız olabilir."
        ),
        'tips': (
            "- Günlük bütçe planı yapın.\n"
            "- Odaklanmak için dikkat dağıtıcıları azaltın.\n"
            "- Gelecek hedefleri için ajanda oluşturun."
        )
    }
   }
@st.cache_resource
def load_components():
    model = joblib.load("mbti_lgbm_20250519_110324.pkl")
    english_stopwords = stopwords.words("english")
    turkish_stopwords = stopwords.words("turkish")
    stop_words = set(english_stopwords + turkish_stopwords)
    embedder = SentenceTransformer("paraphrase-multilingual-mpnet-base-v2")
    return model, stop_words, embedder


def clean_text(text, stop_words):
    text = emoji.replace_emoji(text, replace='')  # Emojileri sil
    text = re.sub(r"http\S+|www\S+|https\S+", '', text, flags=re.MULTILINE)  # URL temizliği
    text = text.lower()
    text = re.sub(r"[^a-zA-ZğüşöçıİĞÜŞÖÇ\s]", '', text)  # Türkçe karakterleri koruyarak sadece harfleri bırak
    text = ' '.join([word for word in text.split() if word not in stop_words])  # Stopword temizliği
    return text


# Streamlit arayüzü
st.set_page_config(page_title="MBTI Tahmini", page_icon="🧠", layout="centered")

# Başlık
st.title("AI Destekli MBTI Kişilik Tahmin Uygulaması")
st.markdown("Kendini Tanıt Kişiliğin Hakkında Bilgi Edin. 👇")

# Kullanıcıdan metin girişi
text_input = st.text_area("Metni buraya girin (En az 500 karakter):", height=200)

# Karakter sayısı
char_count = len(text_input.strip())
remaining = 500 - char_count

# Anlık uyarı
if char_count < 500:
    st.warning(f"📝 Şu an {char_count} karakter girdiniz. {remaining} karakter daha girmeniz gerekiyor.")
else:
    st.info(f"✅ {char_count} karakter girdiniz. Tahmin yapabilirsiniz.")

# Butona basınca tahmin yap
if st.button("Tahmin Et"):
    if char_count < 500:
        st.warning(f"❌ Metin çok kısa. Lütfen {remaining} karakter daha yazın.")
    else:
        model, stop_words, embedder = load_components()
        cleaned = clean_text(text_input.strip(), stop_words)
        embedding = embedder.encode([text_input.strip()])[0]

        proba = model.predict_proba([embedding])[0]
        prediction = model.classes_[proba.argmax()]

        st.success(f"Tahmin Edilen MBTI Tipi: **{prediction}**")

        # Açıklama bölümü
        info = mbti_info[prediction]
        st.markdown(f"**Açıklama:** {info['description']}")
        st.markdown("**Pozitif Yönler:**")
        st.markdown(info['positive'])
        st.markdown("**Geliştirme Alanları:**")
        st.markdown(info['negative'])
        st.markdown("**İpuçları:**")
        st.markdown(info['tips'])

        # Diğer tiplere yakınlık (olasılık yüzdesi)
        st.markdown("---")
        st.subheader("🧪 Diğer MBTI Tiplerine Yakınlık:")
        probs_df = pd.DataFrame({
            "MBTI Tipi": model.classes_,
            "Benzerlik (%)": [round(p * 100, 2) for p in proba]
        }).sort_values("Benzerlik (%)", ascending=False)

        st.dataframe(probs_df, use_container_width=True)

        # Alternatif: çubuk grafik
        st.bar_chart(probs_df.set_index("MBTI Tipi"))

        st.markdown("🧬 *Bu model `SentenceTransformer` ve `LightGBM` ile geliştirilmiştir.*")
