import * as React from 'react';

interface BubbleConfig {
  size: number;
  left: string;
  duration: string;
  delay: string;
}

const BUBBLES: BubbleConfig[] = [
  { size: 18, left: '5%', duration: '9s', delay: '0s' },
  { size: 12, left: '25%', duration: '8s', delay: '4.5s' },
  { size: 14, left: '60%', duration: '11s', delay: '6s' },
  { size: 16, left: '80%', duration: '9s', delay: '5s' },
  { size: 10, left: '50%', duration: '7s', delay: '7s' },
  { size: 26, left: '15%', duration: '13s', delay: '2s' },
  { size: 34, left: '40%', duration: '15s', delay: '1s' },
  { size: 28, left: '70%', duration: '14s', delay: '0.8s' },
  { size: 45, left: '35%', duration: '18s', delay: '3s' },
  { size: 38, left: '85%', duration: '16s', delay: '4s' },
  { size: 65, left: '10%', duration: '20s', delay: '2s' },
  { size: 85, left: '45%', duration: '25s', delay: '0s' },
  { size: 55, left: '75%', duration: '22s', delay: '5s' },
  { size: 110, left: '20%', duration: '30s', delay: '8s' },
  { size: 95, left: '90%', duration: '28s', delay: '1s' },
  { size: 20, left: '55%', duration: '12s', delay: '10s' },
  { size: 40, left: '5%', duration: '14s', delay: '12s' },
  { size: 30, left: '65%', duration: '16s', delay: '15s' },
  { size: 70, left: '30%', duration: '24s', delay: '6s' },
  { size: 50, left: '80%', duration: '19s', delay: '11s' },
];

export function FloatingBubbles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {BUBBLES.map((b, i) => (
        <span
          key={i}
          className="bubble"
          style={{
            width: b.size,
            height: b.size,
            left: b.left,
            ['--duration' as string]: b.duration,
            ['--delay' as string]: b.delay,
          }}
        />
      ))}
    </div>
  );
}
