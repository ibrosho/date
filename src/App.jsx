import React, { useState, useEffect, useRef, useMemo } from 'react';
import confetti from 'canvas-confetti';

// Configured contact details
const YOUR_PHONE_NUMBER = "2348104271840";
const YOUR_EMAIL = "ibrosho@gmail.com";

const FOOD_OPTIONS = [
  { name: 'Burger & Fries', image: '/images/burger.png' },
  { name: 'Ice Cream Sundae', image: '/images/ice_cream.png' },
  { name: 'Crispy Chicken & Chips', image: '/images/chicken_chips.png' },
  { name: 'Jollof Rice & Plantain', image: '/images/jollof_rice.png' },
  { name: 'Special Fried Rice', image: '/images/fried_rice.png' },
  { name: 'Pasta & Wine', image: '/images/pasta_wine.png' }
];

const TIME_PILLS = ['6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM'];
const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const FLOWER_EMOJIS = ['🌸', '🌹', '🌷', '🌺', '✨', '💖'];

export default function App() {
  const [screen, setScreen] = useState('lovebox'); // 'lovebox', 'welcome', 'date', 'time', 'food', 'summary'
  const [isBoxOpen, setIsBoxOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(11);
  const [month, setMonth] = useState('July');
  const [selectedTime, setSelectedTime] = useState('8:00 PM');
  const [selectedFood, setSelectedFood] = useState('Jollof Rice & Plantain');
  const [copied, setCopied] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // NO Button Running Away State
  const [noPos, setNoPos] = useState({ x: 0, y: 0 });
  const [isEscaped, setIsEscaped] = useState(false);
  const [fixedPos, setFixedPos] = useState({ left: 0, top: 0 });
  const noButtonRef = useRef(null);

  const calendarDays = useMemo(() => {
    const startDay = new Date(2026, 6, 1).getDay();
    return Array.from({ length: 31 + startDay }, (_, i) => (i < startDay ? null : i - startDay + 1));
  }, []);

  const flowerPetals = useMemo(() => {
    return Array.from({ length: 28 }, (_, i) => ({
      id: i,
      emoji: FLOWER_EMOJIS[i % FLOWER_EMOJIS.length],
      left: `${(i * 3.7) % 100}%`,
      duration: `${3.5 + (i % 5) * 0.8}s`,
      delay: `${(i % 7) * 0.4}s`
    }));
  }, []);

  const formattedDate = `${month.trim() || 'July'} ${selectedDay}`;

  // Automatically send email copy to ibrosho@gmail.com when reaching summary screen
  const sendEmailNotification = async () => {
    try {
      setIsSendingEmail(true);
      await fetch(`https://formsubmit.co/ajax/${YOUR_EMAIL}`, {
        method: "POST",
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          _subject: "💖 Dream Date Proposal Answered!",
          Date: `${formattedDate}, 2026`,
          Time: selectedTime,
          FoodChoice: selectedFood,
          Answer: "YES, I WILL! 🎉"
        })
      });
    } catch (err) {
      console.log("Email notification sent");
    } finally {
      setIsSendingEmail(false);
    }
  };

  useEffect(() => {
    if (screen === 'summary') {
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.5 }
        });
      } catch (e) {}
      sendEmailNotification();
    }
  }, [screen]);

  const triggerNoJump = (clientX, clientY) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(50); } catch (e) {}
    }

    const padding = 60;
    const btnWidth = noButtonRef.current ? noButtonRef.current.offsetWidth : 100;
    const btnHeight = noButtonRef.current ? noButtonRef.current.offsetHeight : 50;

    const minX = padding;
    const maxX = window.innerWidth - btnWidth - padding;
    const minY = padding;
    const maxY = window.innerHeight - btnHeight - padding;

    let newLeft, newTop;
    let attempts = 0;

    do {
      newLeft = Math.floor(Math.random() * (maxX - minX + 1)) + minX;
      newTop = Math.floor(Math.random() * (maxY - minY + 1)) + minY;
      attempts++;
    } while (
      clientX !== undefined &&
      clientY !== undefined &&
      Math.hypot(newLeft + btnWidth / 2 - clientX, newTop + btnHeight / 2 - clientY) < 140 &&
      attempts < 20
    );

    if (!isEscaped) {
      setIsEscaped(true);
    }

    setFixedPos({ left: newLeft, top: newTop });
    setNoPos({ x: 0, y: 0 });
  };

  useEffect(() => {
    if (screen !== 'welcome') return;

    const checkProximity = (clientX, clientY, isTouchEvent = false) => {
      const btn = noButtonRef.current;
      if (!btn) return;

      const rect = btn.getBoundingClientRect();
      const btnCenterX = rect.left + rect.width / 2;
      const btnCenterY = rect.top + rect.height / 2;

      const dist = Math.hypot(btnCenterX - clientX, btnCenterY - clientY);
      const threshold = isTouchEvent ? 110 : 85;

      if (dist < threshold) {
        triggerNoJump(clientX, clientY);
      }
    };

    const handleMouseMove = (e) => {
      checkProximity(e.clientX, e.clientY, false);
    };

    const handleTouchMove = (e) => {
      if (e.touches && e.touches.length > 0) {
        const touch = e.touches[0];
        const btn = noButtonRef.current;
        if (btn) {
          const rect = btn.getBoundingClientRect();
          const dist = Math.hypot(rect.left + rect.width / 2 - touch.clientX, rect.top + rect.height / 2 - touch.clientY);
          if (dist < 120) {
            if (e.cancelable) e.preventDefault();
          }
        }
        checkProximity(touch.clientX, touch.clientY, true);
      }
    };

    const handleTouchStart = (e) => {
      if (e.touches && e.touches.length > 0) {
        const touch = e.touches[0];
        const btn = noButtonRef.current;
        if (btn) {
          const rect = btn.getBoundingClientRect();
          const dist = Math.hypot(rect.left + rect.width / 2 - touch.clientX, rect.top + rect.height / 2 - touch.clientY);
          if (dist < 120) {
            if (e.cancelable) e.preventDefault();
            triggerNoJump(touch.clientX, touch.clientY);
          }
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: false });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchstart', handleTouchStart);
    };
  }, [screen, isEscaped]);

  const handleYes = () => {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {}
    setScreen('date');
  };

  const handleReset = () => {
    setIsBoxOpen(false);
    setSelectedDay(11);
    setMonth('July');
    setSelectedTime('8:00 PM');
    setSelectedFood('Jollof Rice & Plantain');
    setNoPos({ x: 0, y: 0 });
    setIsEscaped(false);
    setScreen('lovebox');
  };

  // Formatted response message text
  const responseMessage = `YES! I'd love to go on a date with you! 💖✨\n\n📅 Date: ${formattedDate}, 2026\n⏰ Time: ${selectedTime}\n🍽️ Food: ${selectedFood}\n\nCan't wait! 🥰`;

  const handleSendWhatsApp = () => {
    const encodedText = encodeURIComponent(responseMessage);
    const cleanNum = YOUR_PHONE_NUMBER.replace(/[^0-9]/g, '');
    const waUrl = `https://wa.me/${cleanNum}?text=${encodedText}`;
    window.open(waUrl, '_blank');
  };

  const handleCopySummary = () => {
    navigator.clipboard.writeText(responseMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const steps = ['welcome', 'date', 'time', 'food', 'summary'];
  const currentStepIndex = steps.indexOf(screen);

  return (
    <main className="proposal-app">
      {screen === 'summary' && (
        <div className="flower-shower-container" aria-hidden="true">
          {flowerPetals.map((p) => (
            <span
              key={p.id}
              className="falling-flower"
              style={{
                left: p.left,
                animationDuration: p.duration,
                animationDelay: p.delay
              }}
            >
              {p.emoji}
            </span>
          ))}
        </div>
      )}

      <span className="proposal-petal proposal-petal--one" aria-hidden="true">❧</span>
      <span className="proposal-petal proposal-petal--two" aria-hidden="true">✧</span>
      <span className="proposal-petal proposal-petal--three" aria-hidden="true">❀</span>
      <span className="proposal-petal proposal-petal--four" aria-hidden="true">♡</span>

      <div className="proposal-shell">
        <header className="proposal-topline">
          <div className="proposal-mark">
            <span aria-hidden="true">♡</span> a little proposal
          </div>
          {screen !== 'lovebox' && (
            <div className="proposal-progress" aria-label={`Step ${currentStepIndex} of 4`}>
              {steps.slice(0, 4).map((s, idx) => (
                <span key={s} className={idx <= currentStepIndex ? 'is-active' : ''} />
              ))}
            </div>
          )}
        </header>

        <section className="proposal-card" aria-live="polite">
          {/* SCREEN 1: REAL ENVELOPE LOVE BOX */}
          {screen === 'lovebox' && (
            <div className="proposal-screen proposal-screen--lovebox">
              <p className="proposal-eyebrow">
                {isBoxOpen ? 'a little note for you' : 'something sweet is waiting for you 💖 BabyKay'}
              </p>

              <div
                className={`envelope-wrapper`}
                onClick={() => setIsBoxOpen(!isBoxOpen)}
              >
                <div className={`envelope ${isBoxOpen ? 'is-open' : ''}`}>
                  <div className="envelope-back" />
                  <div className="envelope-flap" />
                  <div className="envelope-pocket" />
                  <div className="envelope-wax-seal">♡</div>

                  <div className="envelope-letter">
                    <div className="letter-content">
                      <h2 className="letter-title">
                        You make ordinary days feel like something worth celebrating.
                      </h2>
                      <p className="letter-message">
                        So I made you a tiny corner of the internet, with one very important question inside.
                      </p>
                      <span className="letter-signoff">with all my heart, Mr Anonymoux</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                className="proposal-primary love-box-action"
                type="button"
                onClick={() => (isBoxOpen ? setScreen('welcome') : setIsBoxOpen(true))}
                data-testid="button-open-love-box"
              >
                {isBoxOpen ? 'Open the question ♡' : 'Open me gently ♡'}
              </button>
            </div>
          )}

          {/* SCREEN 2: Proposal Question */}
          {screen === 'welcome' && (
            <div className="proposal-screen proposal-screen--welcome">
              <p className="proposal-eyebrow">for someone very special</p>
              <h1 className="proposal-title">
                Will you go on<br />
                a <em>date</em> with me?
              </h1>
              <p className="proposal-subtitle">
                I have a tiny plan, a hopeful heart, and one question I really want to ask you.
              </p>

              <div className="proposal-actions">
                <button
                  className="proposal-primary"
                  type="button"
                  onClick={handleYes}
                  data-testid="button-yes"
                >
                  YES, I WILL
                </button>

                <button
                  ref={noButtonRef}
                  className="proposal-secondary proposal-no"
                  type="button"
                  style={
                    isEscaped
                      ? {
                          position: 'fixed',
                          left: `${fixedPos.left}px`,
                          top: `${fixedPos.top}px`,
                          transform: 'none',
                          zIndex: 9999
                        }
                      : {
                          position: 'relative',
                          transform: `translate(${noPos.x}px, ${noPos.y}px)`
                        }
                  }
                  onPointerEnter={(e) => triggerNoJump(e.clientX, e.clientY)}
                  onTouchStart={(e) => {
                    if (e.cancelable) e.preventDefault();
                    const touch = e.touches[0];
                    triggerNoJump(touch?.clientX, touch?.clientY);
                  }}
                  onClick={(e) => triggerNoJump(e.clientX, e.clientY)}
                  aria-label="No, but this button is feeling shy"
                  data-testid="button-no"
                >
                  no?
                </button>
              </div>

              <p className="proposal-note">There is only one right answer here, just saying.</p>
            </div>
          )}

          {/* SCREEN 3: Date Picker */}
          {screen === 'date' && (
            <div className="proposal-screen">
              <p className="proposal-eyebrow">first, the important bit</p>
              <h1 className="proposal-title">
                So… when are<br />
                <em>you free?</em>
              </h1>
              <p className="proposal-subtitle">
                Pick a lovely day. I promise to make it worth putting on real clothes for.
              </p>

              <label className="field-label" htmlFor="month-choice">What month feels lovely?</label>
              <div className="custom-input-wrap">
                <input
                  id="month-choice"
                  className="proposal-input"
                  type="text"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  placeholder="e.g. July"
                />
                <span className="input-suffix">2026</span>
              </div>
              <p className="input-hint">Type a month, or pick a day below.</p>

              <div className="calendar" aria-label={`${month} 2026 date picker`}>
                <div className="calendar-heading">
                  <span>{month}</span>
                  <span>2026</span>
                </div>
                <div className="calendar-weekdays">
                  {WEEKDAYS.map((w, idx) => (
                    <span key={idx}>{w}</span>
                  ))}
                </div>
                <div className="calendar-days">
                  {calendarDays.map((day, idx) => (
                    <button
                      key={idx}
                      type="button"
                      disabled={!day}
                      className={`calendar-day ${!day ? 'is-empty' : ''} ${day === selectedDay ? 'is-selected' : ''}`}
                      onClick={() => day && setSelectedDay(day)}
                    >
                      {day || ''}
                    </button>
                  ))}
                </div>
              </div>

              <p className="proposal-step-note">Selected Date: {formattedDate}</p>

              <button
                className="proposal-primary"
                type="button"
                onClick={() => setScreen('time')}
              >
                Continue →
              </button>
            </div>
          )}

          {/* SCREEN 4: Time Selection */}
          {screen === 'time' && (
            <div className="proposal-screen">
              <p className="proposal-eyebrow">pick an hour</p>
              <h1 className="proposal-title">
                Choose the <em>hour</em>
              </h1>
              <p className="proposal-subtitle">
                For our tiny adventure under the evening sky on {formattedDate}.
              </p>

              <label className="field-label" htmlFor="time-choice">Custom time</label>
              <input
                id="time-choice"
                className="proposal-input"
                type="text"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                placeholder="e.g. 7:30 PM"
              />

              <div className="time-pills">
                {TIME_PILLS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`time-pill ${selectedTime === t ? 'is-selected' : ''}`}
                    onClick={() => setSelectedTime(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <p className="proposal-step-note">Selected Time: {selectedTime}</p>

              <button
                className="proposal-primary"
                type="button"
                onClick={() => setScreen('food')}
              >
                Next little detail →
              </button>
            </div>
          )}

          {/* SCREEN 5: REAL FOOD PHOTO SELECTION */}
          {screen === 'food' && (
            <div className="proposal-screen">
              <p className="proposal-eyebrow">what are we eating?</p>
              <h1 className="proposal-title">
                Choose your <em>happy food</em>
              </h1>
              <p className="proposal-subtitle">
                Something comforting, something sweet, or both. Your call.
              </p>

              <div className="food-grid">
                {FOOD_OPTIONS.map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    className={`food-card ${selectedFood === item.name ? 'is-selected' : ''}`}
                    onClick={() => setSelectedFood(item.name)}
                  >
                    {selectedFood === item.name && (
                      <span className="food-badge">selected ♡</span>
                    )}
                    <div className="food-card-img-wrap">
                      <img className="food-card-img" src={item.image} alt={item.name} />
                    </div>
                    <span className="food-card-title">{item.name}</span>
                  </button>
                ))}
              </div>

              <button
                className="proposal-primary"
                type="button"
                onClick={() => setScreen('summary')}
              >
                Seal the plan →
              </button>
            </div>
          )}

          {/* SCREEN 6: Final Summary with dual WhatsApp + Direct Email delivery */}
          {screen === 'summary' && (
            <div className="proposal-screen">
              <p className="proposal-eyebrow">🌸 🌹 🌺</p>
              <h1 className="proposal-title">
                It's officially a <em>Date!</em>
              </h1>
              <p className="proposal-subtitle">
                YAY!! I am already looking forward to seeing you, cuteieee pie. This date is going to be the best ever.
              </p>

              <div className="summary-box">
                <div className="summary-item">
                  <span className="summary-label">When</span>
                  <span className="summary-value">{formattedDate}, 2026</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">What Time</span>
                  <span className="summary-value">{selectedTime}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">The Good Stuff</span>
                  <span className="summary-value">{selectedFood}</span>
                </div>
              </div>

              {/* Action Buttons to Send / Receive Answer */}
              <div className="response-actions-wrap" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', marginBottom: '1.25rem' }}>
                <button
                  className="proposal-primary"
                  type="button"
                  onClick={handleSendWhatsApp}
                  style={{
                    background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                    boxShadow: '0 8px 20px rgba(37, 211, 102, 0.35)'
                  }}
                >
                  Send Response on WhatsApp 💬
                </button>

                <button
                  className="time-pill"
                  type="button"
                  onClick={handleCopySummary}
                  style={{ width: '100%', padding: '0.8rem', fontSize: '0.95rem' }}
                >
                  {copied ? 'Copied to Clipboard! ✨' : 'Copy Response Summary 📋'}
                </button>
              </div>

              <button
                className="time-pill"
                type="button"
                onClick={handleReset}
                style={{ border: 'none', background: 'transparent', color: '#999', fontSize: '0.85rem' }}
              >
                Replay our little plan ♡
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
