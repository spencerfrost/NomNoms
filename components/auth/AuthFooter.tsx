import Link from 'next/link';

interface AuthFooterProps {
  primaryText: string;
  linkText: string;
  linkUrl: string;
  secondaryText?: string;
}

export function AuthFooter({ primaryText, linkText, linkUrl, secondaryText }: AuthFooterProps) {
  return (
    <div className="text-center text-sm text-muted-foreground mt-4">
      {secondaryText && <p>{secondaryText}</p>}
      <p className={secondaryText ? 'mt-2' : ''}>
        {primaryText}{' '}
        <Link href={linkUrl} className="font-semibold text-foreground underline underline-offset-2">
          {linkText}
        </Link>
      </p>
    </div>
  );
}
