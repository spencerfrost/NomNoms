import {
  CLIP_PAGE,
  CLIP_READY,
  bookmarkletHref,
  bookmarkletSource,
  isClipMessage,
} from '@/lib/bookmarklet';

const ORIGIN = 'https://nomnoms.example';

describe('bookmarklet', () => {
  let clipTab: Window;
  let postMessage: jest.SpyInstance;

  beforeEach(() => {
    document.documentElement.innerHTML = `<head>
      <script>trackEverything()</script>
      <script type="application/ld+json">{"@type":"Recipe","name":"Cookies"}</script>
      <style>body{}</style>
    </head><body><h1>Cookies</h1><svg></svg></body>`;
    const frame = document.createElement('iframe');
    document.body.appendChild(frame);
    clipTab = frame.contentWindow!;
    postMessage = jest.spyOn(clipTab, 'postMessage').mockImplementation(() => {});
    jest.spyOn(window, 'open').mockReturnValue(clipTab);
  });

  afterEach(() => jest.restoreAllMocks());

  const ready = (init: Partial<MessageEventInit> = {}) =>
    window.dispatchEvent(
      new MessageEvent('message', {
        data: { type: CLIP_READY },
        origin: ORIGIN,
        source: clipTab,
        ...init,
      })
    );

  it('decodes to the same source', () => {
    const href = bookmarkletHref(ORIGIN);
    expect(href.startsWith('javascript:')).toBe(true);
    expect(() => new Function(decodeURIComponent(href.slice('javascript:'.length)))).not.toThrow();
  });

  it('opens the clip page and sends a trimmed copy of the page once it is ready', () => {
    new Function(bookmarkletSource(ORIGIN))();
    expect(window.open).toHaveBeenCalledWith(`${ORIGIN}/add/clip`, '_blank');
    expect(postMessage).not.toHaveBeenCalled();

    ready();
    expect(postMessage).toHaveBeenCalledTimes(1);
    const [message, targetOrigin] = postMessage.mock.calls[0];
    expect(targetOrigin).toBe(ORIGIN);
    expect(isClipMessage(message)).toBe(true);
    expect(message.type).toBe(CLIP_PAGE);
    expect(message.url).toBe(window.location.href);
    expect(message.html).toContain('"name":"Cookies"');
    expect(message.html).toContain('<h1>Cookies</h1>');
    expect(message.html).not.toContain('trackEverything');
    expect(message.html).not.toContain('<style');
    expect(message.html).not.toContain('<svg');

    ready();
    expect(postMessage).toHaveBeenCalledTimes(1);
  });

  it('ignores ready messages from other origins or windows', () => {
    new Function(bookmarkletSource(ORIGIN))();
    ready({ origin: 'https://evil.example' });
    ready({ source: window });
    expect(postMessage).not.toHaveBeenCalled();
  });

  it('does not modify the live page', () => {
    new Function(bookmarkletSource(ORIGIN))();
    expect(document.querySelectorAll('script')).toHaveLength(2);
  });
});
