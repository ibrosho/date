import React, { useState, useEffect, useRef, useMemo } from 'react';
import confetti from 'canvas-confetti';

const FOOD_OPTIONS = [
  { name: 'Burger 🍔', icon: '🍔' },
  { name: 'Ice Cream 🍦', icon: '🍦' },
  { name: 'Chicken & Chips 🍗', icon: '🍗' },
  { name: 'Jollof Rice 🍛', icon: '🍛' },
  { name: 'Fried Rice 🍚', icon: '🍚' },
  { name: 'Pasta & Wine 🍝', icon: '🍝' }
];

const TIME_PILLS = ['6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM'];
const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function App() {
  const [screen, setScreen] = useState('lovebox'); // 'lovebox', 'welcome', 'date', 'time', 'food', 'summary'
  const [isBoxOpen, setIsBoxOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(11);
  const [month, setMonth] = useState('July');
  const [selectedTime, setSelectedTime] = useState('8:00 PM');
  const [customTime, setCustomTime] = useState('20:00');
  const [selectedFood, setSelectedFood] = useState('Jollof Rice 🍛');

  // NO Button Running Away State
  const [noPos, setNoPos] = useState({ x: 0, y: 0 });
  const [isEscaped, setIsEscaped] = useState(false);
  const [fixedPos, setFixedPos] = useState({ left: 0, top: 0 });
  const noButtonRef = useRef(null);

  // Generate calendar days for July 2026 (Starts on Wednesday -> offset 3)
  const calendarDays = useMemo(() => {
    const startDay = new Date(2026, 6, 1).getDay(); // July 2026
    return Array.from({ length: 31 + startDay }, (_, i) => (i < startDay ? null : i - startDay + 1));
  }, []);

  // Jump NO button to a new position away from touch/pointer coordinate
  const triggerNoJump = (clientX, clientY) => {
    // Provide haptic feedback if supported
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

    // Pick a random location that is at least 140px away from user finger/cursor
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

  // Touch & Pointer proximity detector on window when on 'welcome' screen
  useEffect(() => {
    if (screen !== 'welcome') return;

    const checkProximity = (clientX, clientY, isTouchEvent = false) => {
      const btn = noButtonRef.current;
      if (!btn) return;

      const rect = btn.getBoundingClientRect();
      const btnCenterX = rect.left + rect.width / 2;
      const btnCenterY = rect.top + rect.height / 2;

      const dist = Math.hypot(btnCenterX - clientX, btnCenterY - clientY);
      const threshold = isTouchEvent ? 110 : 85; // Proximity trigger radius

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
            if (e.cancelable) e.preventDefault(); // Prevent page scroll when chasing
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
    // Confetti effect
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
    setCustomTime('20:00');
    setSelectedFood('Jollof Rice 🍛');
    setNoPos({ x: 0, y: 0 });
    setIsEscaped(false);
    setScreen('lovebox');
  };

  const formattedDate = `${month.trim() || 'July'} ${selectedDay}`;
  const steps = ['welcome', 'date', 'time', 'food', 'summary'];
  const currentStepIndex = steps.indexOf(screen);

  return (
    <main className="proposal-app">
      {/* Ambient Petals */}
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
          {/* SCREEN 1: Love Box */}
          {screen === 'lovebox' && (
            <div className="proposal-screen proposal-screen--lovebox">
              <div className="love-box">
                <p className="proposal-eyebrow">
                  {isBoxOpen ? 'a little note for you' : 'something sweet is waiting'}
                </p>
                {isBoxOpen ? (
                  <>
                    <h1 className="love-box-title">
                      You make ordinary days feel like something worth celebrating.
                    </h1>
                    <p className="love-box-message">
                      So I made you a tiny corner of the internet, with one very important question inside.
                    </p>
                    <span className="love-box-signoff">with all my heart, xx</span>
                  </>
                ) : (
                  <h1 className="love-box-title">
                    Open this little box<br />
                    <em>when you are ready.</em>
                  </h1>
                )}
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

          {/* SCREEN 5: Food Selection */}
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
                    <span className="food-card-icon">{item.icon}</span>
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

          {/* SCREEN 6: Final Summary */}
          {screen === 'summary' && (
            <div className="proposal-screen">
              <p className="proposal-eyebrow">✦ ❀ ✦</p>
              <h1 className="proposal-title">
                It's officially a <em>Date!</em>
              </h1>
              <p className="proposal-subtitle">
                YAY!! I am already looking forward to seeing you.
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

              <button
                className="proposal-primary"
                type="button"
                onClick={handleReset}
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
