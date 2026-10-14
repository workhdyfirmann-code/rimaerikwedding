import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";

const photos = {
  first: "/rimadanerik/potohasya.JPG",
  second: "/rimadanerik/potohasya.JPG",
};

const gallery = [photos.first, photos.second];
const guestPhotosKey = "rima-erik-guest-photos";

function Monogram() {
  return <span className="monogram">R·E</span>;
}

function Flower({ className = "" }: { className?: string }) {
  return (
    <svg className={`flower ${className}`} viewBox="0 0 180 260" aria-hidden="true">
      <path d="M21 249C36 184 67 140 111 96M68 159c-25-8-38-27-39-55 26 3 43 17 49 43M99 111c-4-29 8-49 35-62 7 26 0 47-22 62M48 196c25-1 42 10 52 33-25 6-45-1-58-21M112 95c17-19 35-24 56-14-11 24-28 35-52 30M130 62c-1-20 8-34 26-43 8 18 4 34-10 48" />
      <circle cx="112" cy="95" r="4" />
    </svg>
  );
}

function SectionTitle({
  eyebrow,
  title,
  intro,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
}) {
  return (
    <header className="section-title">
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {intro && <p>{intro}</p>}
    </header>
  );
}

function Icon({ name }: { name: "calendar" | "clock" | "pin" | "gift" | "copy" | "arrow" }) {
  const paths = {
    calendar: <><path d="M5 3v3M15 3v3M3 8h14M4 5h12a1 1 0 0 1 1 1v11H3V6a1 1 0 0 1 1-1Z" /></>,
    clock: <><circle cx="10" cy="10" r="7" /><path d="M10 6v4l3 2" /></>,
    pin: <><path d="M10 18s6-5 6-10A6 6 0 0 0 4 8c0 5 6 10 6 10Z" /><circle cx="10" cy="8" r="2" /></>,
    gift: <><path d="M3 8h14v9H3zM2 5h16v3H2zM10 5v12M10 5H7.5C5 5 5 2 7 2c2 0 3 3 3 3Zm0 0h2.5c2.5 0 2.5-3 .5-3-2 0-3 3-3 3Z" /></>,
    copy: <><rect x="6" y="6" width="10" height="11" rx="1" /><path d="M14 6V3H3v11h3" /></>,
    arrow: <><path d="M3 10h14M12 5l5 5-5 5" /></>,
  };
  return <svg className="icon" viewBox="0 0 20 20" aria-hidden="true">{paths[name]}</svg>;
}

function GuestPhotoPage() {
  const [photos, setPhotos] = useState<string[]>([]);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(guestPhotosKey) || "[]");
      if (Array.isArray(saved)) setPhotos(saved.filter((photo): photo is string => typeof photo === "string"));
    } catch {
      localStorage.removeItem(guestPhotosKey);
    }
  }, []);

  useEffect(() => {
    if (!cameraOpen) return;
    let active = true;
    navigator.mediaDevices?.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false })
      .then((stream) => {
        if (!active) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => setCameraError("Kamera tidak dapat diakses. Pastikan izin kamera telah diberikan."));
    return () => {
      active = false;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, [cameraOpen]);

  const savePhotos = (nextPhotos: string[]) => {
    setPhotos(nextPhotos);
    localStorage.setItem(guestPhotosKey, JSON.stringify(nextPhotos));
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    savePhotos([canvas.toDataURL("image/jpeg", 0.9), ...photos]);
    setCameraOpen(false);
  };

  return (
    <main className="guest-page">
      <header className="guest-page-header">
        <a className="monogram" href="/">R·E</a>
        <span className="eyebrow">MOMEN PERNIKAHAN RIMA & ERIK</span>
        <a className="guest-page-back" href="/">Kembali ke undangan</a>
      </header>
      <section className="guest-page-intro">
        <span className="eyebrow">DINDING FOTO TAMU</span>
        <h1>Abadikan momen<br /><i>bersama kami</i></h1>
        <p>Ambil foto di lokasi acara dan bagikan kebahagiaanmu. Foto akan tampil di halaman ini.</p>
        <button className="button" onClick={() => { setCameraError(""); setCameraOpen(true); }}>Akses Kamera</button>
      </section>
      <section className="guest-wall" aria-live="polite">
        {photos.length ? photos.map((photo, index) => (
          <figure key={`${photo.slice(0, 24)}-${index}`}><img src={photo} alt={`Momen tamu ${index + 1}`} /><figcaption>Momen tamu {index + 1}</figcaption></figure>
        )) : <div className="guest-wall-empty"><strong>Belum ada foto</strong><span>Jadilah yang pertama membagikan momen.</span></div>}
      </section>
      {cameraOpen && <div className="camera-modal" role="dialog" aria-modal="true" aria-label="Kamera foto tamu">
        <div className="camera-modal-card">
          <button className="camera-close" onClick={() => setCameraOpen(false)} aria-label="Tutup kamera">×</button>
          <span className="eyebrow">KAMERA</span><h2>Ambil Momen</h2>
          {cameraError ? <p className="camera-error">{cameraError}</p> : <video ref={videoRef} className="camera-video" autoPlay muted playsInline />}
          {!cameraError && <button className="button" onClick={capturePhoto}>Ambil Foto</button>}
          <button className="camera-remove" onClick={() => setCameraOpen(false)}>Batal</button>
        </div>
      </div>}
    </main>
  );
}

export default function App() {
  if (window.location.pathname === "/foto-tamu") return <GuestPhotoPage />;

  const guestName = new URLSearchParams(window.location.search).get("to")
    || new URLSearchParams(window.location.search).get("name")
    || new URLSearchParams(window.location.search).get("guest")
    || "Nama Tamu";
  const [opened, setOpened] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [guestPhotos, setGuestPhotos] = useState<string[]>([]);
  const [qrisPhoto, setQrisPhoto] = useState<string | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [wishes, setWishes] = useState([{ name: "Keluarga tercinta", message: "Semoga Rima dan Erik selalu dipenuhi cinta, kebahagiaan, dan keberkahan." }]);
  const [copied, setCopied] = useState("");
  const [days, setDays] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    try {
      const savedPhotos = JSON.parse(localStorage.getItem(guestPhotosKey) || "[]");
      if (Array.isArray(savedPhotos)) setGuestPhotos(savedPhotos.filter((photo): photo is string => typeof photo === "string"));
    } catch {
      localStorage.removeItem(guestPhotosKey);
    }
  }, []);

  useEffect(() => {
    if (guestPhotos.length) localStorage.setItem(guestPhotosKey, JSON.stringify(guestPhotos));
    else localStorage.removeItem(guestPhotosKey);
  }, [guestPhotos]);

  useEffect(() => {
    if (!cameraOpen) return;
    let active = true;
    navigator.mediaDevices?.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false })
      .then((stream) => {
        if (!active) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          void videoRef.current.play();
        }
      })
      .catch(() => setCameraError("Kamera tidak dapat diakses. Pastikan izin kamera telah diberikan."));
    return () => {
      active = false;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, [cameraOpen]);

  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, new Date("2026-12-26T08:00:00+07:00").getTime() - Date.now());
      setDays({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff / 3600000) % 24),
        minutes: Math.floor((diff / 60000) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const openInvitation = () => {
    setOpened(true);
    window.setTimeout(() => document.querySelector("#home")?.scrollIntoView({ behavior: "smooth" }), 350);
  };

  const submitRsvp = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  const submitWish = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("wish-name") || "Tamu undangan");
    const message = String(form.get("wish-message") || "");
    if (message.trim()) {
      setWishes((current) => [{ name, message }, ...current]);
      event.currentTarget.reset();
    }
  };

  const copyAccount = async (account: string) => {
    await navigator.clipboard?.writeText(account);
    setCopied(account);
    window.setTimeout(() => setCopied(""), 1800);
  };

  const handleQrisUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setQrisPhoto(URL.createObjectURL(file));
  };

  const openCamera = () => {
    setCameraError("");
    setCameraOpen(true);
  };

  const closeCamera = () => setCameraOpen(false);

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    setGuestPhotos((current) => [canvas.toDataURL("image/jpeg", 0.9), ...current]);
    closeCamera();
  };

  const removeGuestPhoto = (photo: string) => setGuestPhotos((current) => current.filter((item) => item !== photo));

  return (
    <main>
      <section className={`cover ${opened ? "cover--open" : ""}`} aria-hidden={opened}>
        <img src={photos.first} alt="Rima dan Erik" />
        <div className="cover-overlay" />
        <Flower className="cover-flower cover-flower--left" />
        <Flower className="cover-flower cover-flower--right" />
        <div className="cover-content">
          <Monogram />
          <p className="cover-kicker">UNDANGAN PERNIKAHAN</p>
          <h1>Rima <i>&</i> Erik</h1>
          <div className="date-rule"><span />26 · 12 · 2026<span /></div>
          <div className="guest">
            <span>Kepada Yth.</span>
            <strong>{guestName}</strong>
          </div>
          <button className="button button--light" onClick={openInvitation}>
            Buka Undangan <Icon name="arrow" />
          </button>
        </div>
        <div className="scroll-note">Sebuah perayaan penuh cinta</div>
      </section>

      <nav className="nav">
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Kembali ke atas"><Monogram /></button>
        <div className="nav-links">
          <a href="#home">01 Beranda</a>
          <a href="#story">02 Cerita Kita</a>
          <a href="#events">03 Waktu & Tempat</a>
          <a href="#gallery">04 Galeri</a>
          <a href="#rsvp">05 Konfirmasi</a>
          <a href="#wishes">06 Ucapan</a>
          <a href="/foto-tamu">07 Foto Tamu</a>
        </div>
        <a className="nav-rsvp" href="#rsvp">Konfirmasi</a>
      </nav>

      <div className="music-player">
        <span className="music-note">♪</span>
        <div><strong>Musik</strong><span>Musik pengiring</span></div>
        <iframe
          className="music-embed music-embed--audio"
          src={`https://www.youtube.com/embed/ZeFpigRaXbI?loop=1&playlist=ZeFpigRaXbI&controls=0&autoplay=${opened ? "1" : "0"}`}
          title="Backsound"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      </div>

      <section className="hero" id="home">
        <Flower className="hero-flower" />
        <div className="hero-copy">
          <span className="eyebrow">CATAT TANGGALNYA</span>
          <p className="script">Kami akan menikah</p>
          <h2>Rima <i>&</i><br />Erik</h2>
          <p className="hero-date">SABTU, 26 DESEMBER 2026 · JAKARTA</p>
          <p className="hero-quote">“Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu agar kamu merasa tenteram kepadanya.”<br /><small>QS. Ar-Rum: 21</small></p>
          <div className="countdown" aria-label="Hitung mundur acara">
            {Object.entries(days).map(([label, value]) => (
              <div key={label}><strong>{String(value).padStart(2, "0")}</strong><span>{label}</span></div>
            ))}
          </div>
        </div>
        <div className="hero-photo">
          <img src={photos.second} alt="Rima dan Erik" />
          <div className="photo-caption">R + E<br /><span>Jakarta, Indonesia</span></div>
        </div>
      </section>

      <section className="couple section">
        <SectionTitle eyebrow="MEMPELAI" title="Dua jiwa, satu ikatan" intro="Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud menyelenggarakan pernikahan putra-putri kami." />
        <div className="profiles">
          <article className="profile">
            <div className="profile-image"><img src={photos.first} alt="Potret Erik" /><span>01</span></div>
            <div><p className="script">Mempelai Pria</p><h3>Erik</h3><p>Putra dari<br /><strong>Fulan</strong><br />& <strong>Bapak Fulan</strong></p><a href="#gallery">@erik</a></div>
          </article>
          <div className="profile-and">&</div>
          <article className="profile profile--reverse">
            <div className="profile-image"><img src={photos.second} alt="Potret Rima" /><span>02</span></div>
            <div><p className="script">Mempelai Wanita</p><h3>Rima</h3><p>Putri dari<br /><strong>Ibu Rusminah</strong><br />& <strong>Bapak Didi Rasmadi Konter</strong></p><a href="#gallery">@rima</a></div>
          </article>
        </div>
      </section>

      <section className="guest-message section">
        <span className="eyebrow">DENGAN PENUH KEBAHAGIAAN</span>
        <h2>Untuk {guestName}</h2>
        <p>Kami mengundang <strong>{guestName}</strong> untuk hadir dan berbagi kebahagiaan di hari yang paling istimewa dalam hidup kami.</p>
        <p className="guest-message-special">Kehadiranmu akan membuat perayaan kecil kami terasa lebih lengkap. Kami menantikan doa, senyum, dan cerita yang akan kita bagi bersama.</p>
        <span className="guest-message-signature">Dengan penuh cinta, Rima & Erik</span>
      </section>

      <section className="story section" id="story">
          <div className="story-photo"><img src={photos.first} alt="Rima dan Erik" /><span>Since 2021</span></div>
        <div className="story-content">
           <SectionTitle eyebrow="CERITA KITA" title="Kisah yang ditulis bersama" intro="Setiap kisah memiliki awal. Kisah kami tumbuh perlahan, menjadi rumah, dan kini menuju selamanya." />
          <div className="timeline">
            {[
               ["September 2021", "Pertama Berkenalan", "Sebuah pertemuan sederhana di antara teman-teman, yang diam-diam mengubah arah hidup kami."],
               ["Mei 2023", "Jatuh Cinta", "Percakapan panjang, perjalanan singkat, dan rasa nyaman yang semakin berarti."],
               ["Desember 2025", "Sebuah Janji", "Di bawah langit senja, satu pertanyaan membawa kami pada sebuah janji seumur hidup."],
               ["Desember 2026", "Selamanya Dimulai", "Kini kami siap memulai babak baru, bersama orang-orang terkasih di sisi kami."],
            ].map(([date, title, copy], index) => (
              <article key={date}><span>{String(index + 1).padStart(2, "0")}</span><div><time>{date}</time><h3>{title}</h3><p>{copy}</p></div></article>
            ))}
          </div>
        </div>
      </section>

      <section className="events section" id="events">
        <SectionTitle eyebrow="CATAT TANGGALNYA" title="Hari Pernikahan" intro="Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Anda berkenan hadir dan memberikan doa restu." />
        <div className="event-date-display"><span>Sabtu</span><strong>26</strong><span>Desember 2026</span></div>
        <div className="event-grid">
          {[
            { number: "01", name: "Akad Nikah", time: "08.00 – 10.00 WIB", place: "Mesjid Attaufiq", address: "RJ34+X9V, Jl. Dipati Unus, RT.002/RW.001, Cibodas, Kec. Cibodas, Kota Tangerang, Banten 15138", map: "https://www.google.com/maps/search/?api=1&query=RJ34%2BX9V%2C%20Jl.%20Dipati%20Unus%2C%20Cibodas%2C%20Kota%20Tangerang%2C%20Banten%2015138" },
            { number: "02", name: "Resepsi", time: "11.00 – 14.00 WIB", place: "Rumah Mempelai Wanita", address: "RJ34+X9V, Jl. Dipati Unus, RT.002/RW.001, Cibodas, Kec. Cibodas, Kota Tangerang, Banten 15138", map: "https://www.google.com/maps/search/?api=1&query=RJ34%2BX9V%2C%20Jl.%20Dipati%20Unus%2C%20Cibodas%2C%20Kota%20Tangerang%2C%20Banten%2015138" },
          ].map((event) => (
            <article className="event-card" key={event.name}>
              <span className="event-number">{event.number}</span>
              <p className="script">Rangkaian Acara</p>
              <h3>{event.name}</h3>
              <div className="event-detail"><Icon name="calendar" /><span>Sabtu, 26 Desember 2026</span></div>
              <div className="event-detail"><Icon name="clock" /><span>{event.time}</span></div>
              <div className="event-detail"><Icon name="pin" /><a className="event-address" href={event.map} target="_blank" rel="noreferrer"><strong>{event.place}</strong>{event.address}</a></div>
              <a className="button button--outline" href={event.map} target="_blank" rel="noreferrer">Lihat Lokasi <Icon name="arrow" /></a>
            </article>
          ))}
        </div>
      </section>

      <section className="gallery section" id="gallery">
        <SectionTitle eyebrow="MOMEN KITA" title="Potongan kisah kita" intro="Kumpulan momen sederhana, tawa bahagia, dan kenangan yang akan kami bawa selamanya." />
        <div className="gallery-grid">
          {gallery.map((photo, index) => (
            <button key={photo} className={`gallery-item gallery-item--${index + 1}`} onClick={() => setLightbox(photo)} aria-label={`Buka foto galeri ${index + 1}`}>
              <img src={photo} alt={`Momen Rima dan Erik ${index + 1}`} loading="lazy" />
              <span>View</span>
            </button>
          ))}
        </div>
      </section>

      <section className="rsvp section" id="rsvp">
        <div className="rsvp-intro">
          <span className="eyebrow">KONFIRMASI KEHADIRAN</span>
          <h2>Berkenan hadir bersama kami?</h2>
          <p>Kehadiran dan doa Anda adalah hadiah terindah bagi perjalanan baru kami.</p>
          <div className="rsvp-date"><strong>26</strong><span>Desember<br />2026</span></div>
        </div>
        {submitted ? (
          <div className="rsvp-success"><Monogram /><h3>Terima kasih</h3><p>Konfirmasi Anda telah kami terima. Sampai jumpa di hari bahagia kami.</p><button className="button" onClick={() => setSubmitted(false)}>Ubah Jawaban</button></div>
        ) : (
          <form className="rsvp-form" onSubmit={submitRsvp}>
            <label>Nama lengkap<input required name="name" placeholder="Tuliskan nama Anda" /></label>
            <label>Konfirmasi kehadiran<select name="attendance" required defaultValue=""><option value="" disabled>Pilih jawaban</option><option>Ya, saya akan hadir</option><option>Maaf, belum dapat hadir</option></select></label>
            <label>Jumlah tamu<select name="guests" defaultValue="1"><option>1 orang</option><option>2 orang</option><option>3 orang</option><option>4 orang</option></select></label>
            <label>Ucapan & doa<textarea name="message" rows={4} placeholder="Tinggalkan pesan hangat untuk kami..." /></label>
            <button className="button" type="submit">Kirim Konfirmasi <Icon name="arrow" /></button>
          </form>
        )}
      </section>

      <section className="wishes section" id="wishes">
        <SectionTitle eyebrow="BUKU TAMU" title="Ucapan & Doa Terbaik" intro="Tinggalkan doa dan pesan hangat untuk Rima & Erik." />
        <div className="wishes-layout">
          <form className="wish-form" onSubmit={submitWish}>
            <label>Nama<input required name="wish-name" placeholder="Nama Anda" /></label>
            <label>Ucapan & doa<textarea required name="wish-message" rows={5} placeholder="Tuliskan doa terbaik Anda..." /></label>
            <button className="button" type="submit">Kirim Ucapan <Icon name="arrow" /></button>
          </form>
          <div className="wish-list">
            {wishes.map((wish, index) => <article className="wish-card" key={`${wish.name}-${index}`}><span>“</span><p>{wish.message}</p><strong>{wish.name}</strong></article>)}
          </div>
        </div>
      </section>

      <section className="gift section">
        <SectionTitle eyebrow="TANDA KASIH" title="Hadiah Pernikahan" intro="Doa restu Anda sudah lebih dari cukup. Namun jika memberi adalah ungkapan kasih, kami dengan tulus menerimanya." />
        <div className="gift-grid">
          {[
            ["BCA", "Rima", "1234 5678 9012"],
            ["Mandiri", "Erik", "0987 6543 2101"],
          ].map(([bank, name, account]) => (
            <article className="gift-card" key={bank}>
              <div><Icon name="gift" /><span>Hadiah Pernikahan</span></div>
              <strong className="bank">{bank}</strong><p>{name}</p><h3>{account}</h3>
              <button onClick={() => copyAccount(account.replaceAll(" ", ""))}><Icon name="copy" />{copied === account.replaceAll(" ", "") ? "Tersalin" : "Salin nomor"}</button>
            </article>
          ))}
          <article className="gift-card gift-card--address">
            <div><Icon name="pin" /><span>Kirim Hadiah</span></div>
            <h3>Alamat Pengiriman</h3>
            <p>Jl. Kemang Timur No. 28<br />Jakarta Selatan, 12730<br /><strong>Penerima: Erik · 0812 3456 7890</strong></p>
          </article>
          <article className="gift-card gift-card--qris">
            <div><Icon name="gift" /><span>Pindai & Beri</span></div>
            <h3>QRIS</h3>
            {qrisPhoto ? <img className="qris-image" src={qrisPhoto} alt="QRIS untuk hadiah pernikahan" /> : <div className="qris-empty">QRIS<br /><small>Upload kode QR</small></div>}
            <label className="upload-link">{qrisPhoto ? "Ganti QRIS" : "Tambah QRIS"}<input type="file" accept="image/*" onChange={handleQrisUpload} /></label>
          </article>
        </div>
      </section>

      <section className="guest-camera section">
        <SectionTitle eyebrow="DINDING FOTO TAMU" title="Simpan momen bersama kami" intro="Ambil foto di lokasi acara. Semua foto tamu akan tampil khusus di section ini." />
        <div className="camera-card">
          {guestPhotos[0] ? <img src={guestPhotos[0]} alt="Pratinjau foto tamu" /> : <div className="camera-empty"><span>+</span><p>Belum ada foto</p></div>}
          <button className="button camera-button" type="button" onClick={openCamera}>{guestPhotos.length ? "Ambil Foto Lain" : "Akses Kamera"}</button>
          <a className="camera-wall-link" href="/foto-tamu">Buka halaman foto tamu</a>
          {guestPhotos.length > 0 && <p className="camera-count">{guestPhotos.length} foto sudah dibagikan ke layar</p>}
        </div>
        {guestPhotos.length > 0 && <div className="guest-photo-grid">
          {guestPhotos.map((photo, index) => (
            <figure className="guest-photo-card" key={`${photo.slice(0, 24)}-${index}`}>
              <button onClick={() => setLightbox(photo)} aria-label={`Buka foto tamu ${index + 1}`}><img src={photo} alt={`Foto tamu ${index + 1} di lokasi acara`} /></button>
              <figcaption><span>Foto tamu {index + 1}</span><button onClick={() => removeGuestPhoto(photo)} aria-label="Hapus foto tamu">Hapus</button></figcaption>
            </figure>
          ))}
        </div>}
      </section>

      <footer className="closing">
        <div className="closing-photo"><img src={photos.second} alt="Rima dan Erik" /></div>
        <Flower className="closing-flower" />
        <div className="closing-copy">
          <Monogram />
          <span className="eyebrow">DENGAN CINTA & SYUKUR</span>
          <h2>Terima kasih telah<br />menjadi bagian dari kisah kami.</h2>
          <p>Merupakan kebahagiaan bagi kami untuk berbagi hari istimewa ini bersama Anda.</p>
          <h3>Rima <i>&</i> Erik</h3>
          <span>26 · DESEMBER · 2026</span>
        </div>
        <div className="footer-line"><span>Made with love</span><span>© 2026 R&E Wedding</span></div>
      </footer>

      {lightbox && (
        <div className="lightbox" role="dialog" aria-modal="true" onClick={() => setLightbox(null)}>
          <button onClick={() => setLightbox(null)} aria-label="Tutup galeri">×</button>
          <img src={lightbox} alt="Foto galeri ukuran penuh" />
        </div>
      )}
      {cameraOpen && (
        <div className="camera-modal" role="dialog" aria-modal="true" aria-label="Kamera foto">
          <div className="camera-modal-card">
            <button className="camera-close" onClick={closeCamera} aria-label="Tutup kamera">×</button>
            <span className="eyebrow">KAMERA</span>
            <h2>Ambil Momen</h2>
            {cameraError ? <p className="camera-error">{cameraError}</p> : <video ref={videoRef} className="camera-video" autoPlay muted playsInline />}
            {!cameraError && <button className="button" onClick={capturePhoto}>Ambil Foto</button>}
            <button className="camera-remove" onClick={closeCamera}>Batal</button>
          </div>
        </div>
      )}
    </main>
  );
}
