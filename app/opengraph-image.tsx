import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { DEFAULT_SHARE_IMAGE, SHARE_TAGLINE, SITE_NAME } from '@/lib/site-metadata';

// Default link-preview card (Facebook, iMessage, Slack, X, …). It uses no request data,
// so Next renders it once at build time and serves a static PNG at /opengraph-image.
// Recipe pages with a photo use that photo instead.

export const alt = DEFAULT_SHARE_IMAGE.alt;
export const size = { width: DEFAULT_SHARE_IMAGE.width, height: DEFAULT_SHARE_IMAGE.height };
export const contentType = 'image/png';

// Brand colours from the "Bite" theme in app/globals.css.
const LILAC = '#f1ecfb';
const GRAPE = '#2b1447';
const MANGO = '#ffb627';
const BUBBLEGUM = '#ff9cb8';
const MINT = '#64e1d8';

function fontFile(name: string) {
  return readFile(join(process.cwd(), 'assets/fonts', name));
}

// The same mark the site header uses (components/ui/logo.tsx), so a logo change updates
// the share card on the next build.
async function logoDataUri() {
  const svg = await readFile(join(process.cwd(), 'public/images/logo-mark.svg'));
  return `data:image/svg+xml;base64,${svg.toString('base64')}`;
}

// A rounded, rotated "recipe tile" like the ones on the home page.
function Tile({
  color,
  top,
  left,
  w,
  h,
  rotate,
}: {
  color: string;
  top: number;
  left: number;
  w: number;
  h: number;
  rotate: number;
}) {
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left,
        width: w,
        height: h,
        borderRadius: 48,
        background: color,
        border: `6px solid ${GRAPE}`,
        transform: `rotate(${rotate}deg)`,
      }}
    />
  );
}

export default async function OpenGraphImage() {
  const [bagel, onest, logo] = await Promise.all([
    fontFile('BagelFatOne-Regular.ttf'),
    fontFile('Onest-SemiBold.ttf'),
    logoDataUri(),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          background: LILAC,
          overflow: 'hidden',
        }}
      >
        <Tile color={MANGO} top={-110} left={1010} w={300} h={280} rotate={12} />
        <Tile color={MINT} top={470} left={720} w={200} h={200} rotate={16} />
        <Tile color={BUBBLEGUM} top={420} left={1030} w={260} h={300} rotate={-9} />

        <img
          src={logo}
          width={400}
          height={400}
          alt=""
          style={{ position: 'absolute', top: 115, left: 780, transform: 'rotate(-6deg)' }}
        />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '0 88px',
            height: '100%',
          }}
        >
          <div
            style={{
              fontFamily: 'Bagel Fat One',
              fontSize: 142,
              lineHeight: 1,
              color: GRAPE,
              letterSpacing: -2,
            }}
          >
            {SITE_NAME}
          </div>
          <div
            style={{
              marginTop: 28,
              fontFamily: 'Onest',
              fontSize: 40,
              color: GRAPE,
              maxWidth: 680,
              lineHeight: 1.2,
            }}
          >
            {SHARE_TAGLINE}
          </div>
          <div
            style={{
              display: 'flex',
              marginTop: 40,
              gap: 16,
              fontFamily: 'Onest',
              fontSize: 28,
              color: GRAPE,
            }}
          >
            {['Search', 'Save', 'Cook', 'Scale'].map((label) => (
              <div
                key={label}
                style={{
                  padding: '10px 26px',
                  borderRadius: 999,
                  background: '#ffffff',
                  border: `4px solid ${GRAPE}`,
                }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Bagel Fat One', data: bagel, weight: 400, style: 'normal' },
        { name: 'Onest', data: onest, weight: 600, style: 'normal' },
      ],
    },
  );
}
