import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";

const photos = {
  first: "/rimadanerik/A400368F-96D6-40EE-9D9D-1BB0F4C2C670.JPG",
  second: "/rimadanerik/79D45A2A-726C-486C-BFE8-CC36360C1AD6.JPG",
};

const gallery = [photos.first, photos.second];

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

export default function App() {
  const guestName = new URLSearchParams(window.location.search).get("to")
    || new URLSearchParams(window.location.search).get("name")
    || new URLSearchParams(window.location.search).get("guest")
    || "Nama Tamu";
  const [opened, setOpened] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [guestPhoto, setGuestPhoto] = useState<string | null>(null);
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
    setGuestPhoto(canvas.toDataURL("image/jpeg", 0.9));
    closeCamera();
  };

  return (
    <main>
      <section className={`cover ${opened ? "cover--open" : ""}`} aria-hidden={opened}>
        <img src={photos.first} alt="Rima dan Erik" />
        <div className="cover-overlay" />
        <Flower className="cover-flower cover-flower--left" />
        <Flower className="cover-flower cover-flower--right" />
        <div className="cover-content">
          <Monogram />
          <p className="cover-kicker">THE WEDDING OF</p>
          <h1>Rima <i>&</i> Erik</h1>
          <div className="date-rule"><span />26 · 12 · 2026<span /></div>
          <div className="guest">
            <span>Kepada Yth.</span>
            <strong>{guestName}</strong>
          </div>
          <button className="button button--light" onClick={openInvitation}>
            Open Invitation <Icon name="arrow" />
          </button>
        </div>
        <div className="scroll-note">A celebration under the blue sky</div>
      </section>

      <nav className="nav">
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Kembali ke atas"><Monogram /></button>
        <div className="nav-links">
          <a href="#home">01 Home</a>
          <a href="#story">02 Cerita Kita</a>
          <a href="#events">03 When & Where</a>
          <a href="#gallery">04 Gallery</a>
          <a href="#rsvp">05 RSVP</a>
          <a href="#wishes">06 Wishes</a>
        </div>
        <a className="nav-rsvp" href="#rsvp">Konfirmasi</a>
      </nav>

      <div className="music-player">
        <span className="music-note">♪</span>
        <div><strong>Backsound</strong><span>Wedding soundtrack</span></div>
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
          <span className="eyebrow">SAVE THE DATE</span>
          <p className="script">We're getting married</p>
          <h2>Rima <i>&</i><br />Erik</h2>
          <p className="hero-date">SABTU, 26 DESEMBER 2026 · JAKARTA</p>
          <p className="hero-quote">“And of His signs is that He created for you from yourselves mates that you may find tranquility in them.”</p>
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
        <SectionTitle eyebrow="BRIDE & GROOM" title="Two souls, one journey" intro="Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud menyelenggarakan pernikahan putra-putri kami." />
        <div className="profiles">
          <article className="profile">
            <div className="profile-image"><img src={photos.first} alt="Potret Erik" /><span>01</span></div>
            <div><p className="script">The Groom</p><h3>Erik</h3><p>Putra dari<br /><strong>Fulan</strong><br />& <strong>Bapak Fulan</strong></p><a href="#gallery">@erik</a></div>
          </article>
          <div className="profile-and">&</div>
          <article className="profile profile--reverse">
            <div className="profile-image"><img src={photos.second} alt="Potret Rima" /><span>02</span></div>
            <div><p className="script">The Bride</p><h3>Rima</h3><p>Putri dari<br /><strong>Ibu Rusminah</strong><br />& <strong>Bapak Didi Rasmadi Konter</strong></p><a href="#gallery">@rima</a></div>
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
              ["September 2021", "The First Hello", "Sebuah pertemuan sederhana di antara teman-teman, yang diam-diam mengubah arah hidup kami."],
              ["May 2023", "Falling in Love", "Percakapan panjang, perjalanan singkat, dan rasa nyaman yang semakin berarti."],
              ["December 2025", "The Promise", "Di bawah langit senja, satu pertanyaan membawa kami pada sebuah janji seumur hidup."],
              ["December 2026", "Forever Begins", "Kini kami siap memulai babak baru, bersama orang-orang terkasih di sisi kami."],
            ].map(([date, title, copy], index) => (
              <article key={date}><span>{String(index + 1).padStart(2, "0")}</span><div><time>{date}</time><h3>{title}</h3><p>{copy}</p></div></article>
            ))}
          </div>
        </div>
      </section>

      <section className="events section" id="events">
        <SectionTitle eyebrow="SAVE THE DATE" title="The Wedding Day" intro="Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Anda berkenan hadir dan memberikan doa restu." />
        <div className="event-date-display"><span>Saturday</span><strong>26</strong><span>December 2026</span></div>
        <div className="event-grid">
          {[
            { number: "01", name: "Akad Nikah", time: "08.00 – 10.00 WIB", place: "Mesjid Attaufiq", address: "Tempat akad nikah", map: "https://www.google.com/maps/search/?api=1&query=Mesjid+Attaufiq" },
            { number: "02", name: "Resepsi", time: "11.00 – 14.00 WIB", place: "Rumah Mempelai Wanita", address: "Tempat resepsi", map: "https://www.google.com/maps/search/?api=1&query=Rumah+Mempelai+Wanita" },
          ].map((event) => (
            <article className="event-card" key={event.name}>
              <span className="event-number">{event.number}</span>
              <p className="script">The Ceremony</p>
              <h3>{event.name}</h3>
              <div className="event-detail"><Icon name="calendar" /><span>Sabtu, 26 Desember 2026</span></div>
              <div className="event-detail"><Icon name="clock" /><span>{event.time}</span></div>
              <div className="event-detail"><Icon name="pin" /><span><strong>{event.place}</strong>{event.address}</span></div>
              <a className="button button--outline" href={event.map} target="_blank" rel="noreferrer">View Location <Icon name="arrow" /></a>
            </article>
          ))}
        </div>
      </section>

      <section className="gallery section" id="gallery">
        <SectionTitle eyebrow="OUR MOMENTS" title="Pieces of our story" intro="A collection of quiet moments, happy laughter, and memories we'll carry into forever." />
        <div className="gallery-grid">
          {guestPhoto && (
            <button className="gallery-item gallery-item--guest" onClick={() => setLightbox(guestPhoto)} aria-label="Buka foto tamu">
              <img src={guestPhoto} alt="Foto tamu di lokasi acara" />
              <span>Foto Tamu</span>
            </button>
          )}
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
          <span className="eyebrow">KINDLY RESPOND</span>
          <h2>Will you join us?</h2>
          <p>Kehadiran dan doa Anda adalah hadiah terindah bagi perjalanan baru kami.</p>
          <div className="rsvp-date"><strong>26</strong><span>December<br />2026</span></div>
        </div>
        {submitted ? (
          <div className="rsvp-success"><Monogram /><h3>Thank you</h3><p>Konfirmasi Anda telah kami terima. Sampai jumpa di hari bahagia kami.</p><button className="button" onClick={() => setSubmitted(false)}>Edit Response</button></div>
        ) : (
          <form className="rsvp-form" onSubmit={submitRsvp}>
            <label>Nama lengkap<input required name="name" placeholder="Tuliskan nama Anda" /></label>
            <label>Konfirmasi kehadiran<select name="attendance" required defaultValue=""><option value="" disabled>Pilih jawaban</option><option>Ya, saya akan hadir</option><option>Maaf, belum dapat hadir</option></select></label>
            <label>Jumlah tamu<select name="guests" defaultValue="1"><option>1 orang</option><option>2 orang</option><option>3 orang</option><option>4 orang</option></select></label>
            <label>Ucapan & doa<textarea name="message" rows={4} placeholder="Tinggalkan pesan hangat untuk kami..." /></label>
            <button className="button" type="submit">Send Confirmation <Icon name="arrow" /></button>
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
        <SectionTitle eyebrow="A TOKEN OF LOVE" title="Wedding Gift" intro="Doa restu Anda sudah lebih dari cukup. Namun jika memberi adalah ungkapan kasih, kami dengan tulus menerimanya." />
        <div className="gift-grid">
          {[
            ["BCA", "Rima", "1234 5678 9012"],
            ["Mandiri", "Erik", "0987 6543 2101"],
          ].map(([bank, name, account]) => (
            <article className="gift-card" key={bank}>
              <div><Icon name="gift" /><span>Wedding Gift</span></div>
              <strong className="bank">{bank}</strong><p>{name}</p><h3>{account}</h3>
              <button onClick={() => copyAccount(account.replaceAll(" ", ""))}><Icon name="copy" />{copied === account.replaceAll(" ", "") ? "Copied" : "Copy number"}</button>
            </article>
          ))}
          <article className="gift-card gift-card--address">
            <div><Icon name="pin" /><span>Send a Gift</span></div>
            <h3>Delivery Address</h3>
            <p>Jl. Kemang Timur No. 28<br />Jakarta Selatan, 12730<br /><strong>Penerima: Erik · 0812 3456 7890</strong></p>
          </article>
          <article className="gift-card gift-card--qris">
            <div><Icon name="gift" /><span>Scan & Give</span></div>
            <h3>QRIS</h3>
            {qrisPhoto ? <img className="qris-image" src={qrisPhoto} alt="QRIS untuk hadiah pernikahan" /> : <div className="qris-empty">QRIS<br /><small>Upload kode QR</small></div>}
            <label className="upload-link">{qrisPhoto ? "Ganti QRIS" : "Tambah QRIS"}<input type="file" accept="image/*" onChange={handleQrisUpload} /></label>
          </article>
        </div>
      </section>

      <section className="guest-camera section">
        <SectionTitle eyebrow="CAPTURE THE MOMENT" title="Simpan momen bersama kami" intro="Akses kamera untuk mengabadikan momen di lokasi acara dan tambahkan ke galeri undangan ini." />
        <div className="camera-card">
          {guestPhoto ? <img src={guestPhoto} alt="Pratinjau foto tamu" /> : <div className="camera-empty"><span>+</span><p>Belum ada foto</p></div>}
          <button className="button camera-button" type="button" onClick={openCamera}>{guestPhoto ? "Ambil Foto Lain" : "Akses Kamera"}</button>
          {guestPhoto && <button className="camera-remove" onClick={() => setGuestPhoto(null)}>Hapus foto</button>}
        </div>
      </section>

      <footer className="closing">
        <div className="closing-photo"><img src={photos.second} alt="Rima dan Erik" /></div>
        <Flower className="closing-flower" />
        <div className="closing-copy">
          <Monogram />
          <span className="eyebrow">WITH LOVE & GRATITUDE</span>
          <h2>Thank you for being<br />part of our story.</h2>
          <p>Merupakan kebahagiaan bagi kami untuk berbagi hari istimewa ini bersama Anda.</p>
          <h3>Rima <i>&</i> Erik</h3>
          <span>26 · DECEMBER · 2026</span>
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
            <span className="eyebrow">CAMERA</span>
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
