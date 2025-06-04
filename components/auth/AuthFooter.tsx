import Link from 'next/link';

interface AuthFooterProps {
  primaryText: string;
  linkText: string;
  linkUrl: string;
  secondaryText?: string;
}

export function AuthFooter({ primaryText, linkText, linkUrl, secondaryText }: AuthFooterProps) {
  return (
    <div className="text-center text-sm text-gray-600 mt-4">
      {secondaryText && <p>{secondaryText}</p>}
      <p className={secondaryText ? 'mt-2' : ''}>
        {primaryText}{' '}
        <Link href={linkUrl} className="text-blue-600 hover:underline">
          {linkText}
        </Link>
      </p>
    </div>
  );
}
