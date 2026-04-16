import { Link } from 'react-router-dom';
import { THEME } from '../lib/constants';

export default function Footer() {
  const footerLinks = {
    product: [
      { label: 'Pricing', href: '/pricing' },
      { label: 'Error Fares', href: '/error-fares' },
      { label: 'Miles & Cards', href: '/miles-cards' },
      { label: 'Blog', href: '/blog' },
    ],
    company: [
      { label: 'About', href: '/' },
      { label: 'Contact', href: '/' },
      { label: 'Press', href: '/' },
      { label: 'Status', href: '/' },
    ],
    legal: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Affiliate Disclosure', href: '/affiliate-disclosure' },
    ],
    social: [
      { label: 'Twitter', href: 'https://twitter.com/snapclaps', external: true },
      { label: 'Instagram', href: 'https://instagram.com/snapclaps', external: true },
      { label: 'TikTok', href: 'https://tiktok.com/@snapclaps', external: true },
      { label: 'YouTube', href: 'https://youtube.com/snapclaps', external: true },
    ],
  };

  return (
    <footer style={{
      background: THEME.navy,
      color: 'white',
      padding: '64px 24px 32px',
      marginTop: 80,
    }}>
      <div style={{
        maxWidth: 1280,
        margin: '0 auto',
      }}>
        {/* Footer grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 40,
          marginBottom: 60,
        }}>
          {/* Product column */}
          <div>
            <h3 style={{
              fontSize: 12,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: THEME.teal,
              marginBottom: 16,
              fontFamily: THEME.fonts.anton,
            }}>
              Product
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {footerLinks.product.map(link => (
                <li key={link.label} style={{ marginBottom: 10 }}>
                  <Link to={link.href} style={{
                    color: 'rgba(255,255,255,0.7)',
                    textDecoration: 'none',
                    fontSize: 13,
                    fontFamily: THEME.fonts.inter,
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => { (e.target as HTMLElement).style.color = THEME.teal; }}
                  onMouseLeave={e => { (e.target as HTMLElement).style.color = 'rgba(255,255,255,0.7)'; }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company column */}
          <div>
            <h3 style={{
              fontSize: 12,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: THEME.teal,
              marginBottom: 16,
              fontFamily: THEME.fonts.anton,
            }}>
              Company
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {footerLinks.company.map(link => (
                <li key={link.label} style={{ marginBottom: 10 }}>
                  <Link to={link.href} style={{
                    color: 'rgba(255,255,255,0.7)',
                    textDecoration: 'none',
                    fontSize: 13,
                    fontFamily: THEME.fonts.inter,
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => { (e.target as HTMLElement).style.color = THEME.teal; }}
                  onMouseLeave={e => { (e.target as HTMLElement).style.color = 'rgba(255,255,255,0.7)'; }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal column */}
          <div>
            <h3 style={{
              fontSize: 12,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: THEME.teal,
              marginBottom: 16,
              fontFamily: THEME.fonts.anton,
            }}>
              Legal
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {footerLinks.legal.map(link => (
                <li key={link.label} style={{ marginBottom: 10 }}>
                  <Link to={link.href} style={{
                    color: 'rgba(255,255,255,0.7)',
                    textDecoration: 'none',
                    fontSize: 13,
                    fontFamily: THEME.fonts.inter,
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => { (e.target as HTMLElement).style.color = THEME.teal; }}
                  onMouseLeave={e => { (e.target as HTMLElement).style.color = 'rgba(255,255,255,0.7)'; }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social column */}
          <div>
            <h3 style={{
              fontSize: 12,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: THEME.teal,
              marginBottom: 16,
              fontFamily: THEME.fonts.anton,
            }}>
              Follow
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {footerLinks.social.map(link => (
                <li key={link.label} style={{ marginBottom: 10 }}>
                  <a href={link.href} target={link.external ? '_blank' : undefined} rel={link.external ? 'noopener noreferrer' : undefined} style={{
                    color: 'rgba(255,255,255,0.7)',
                    textDecoration: 'none',
                    fontSize: 13,
                    fontFamily: THEME.fonts.inter,
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => { (e.target as HTMLElement).style.color = THEME.teal; }}
                  onMouseLeave={e => { (e.target as HTMLElement).style.color = 'rgba(255,255,255,0.7)'; }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.1)',
          paddingTop: 32,
          marginBottom: 24,
        }}>
          {/* Bottom bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
          }}>
            {/* Logo + copyright */}
            <div>
              <div style={{
                fontFamily: THEME.fonts.anton,
                fontSize: 16,
                textTransform: 'uppercase',
                marginBottom: 8,
                letterSpacing: '0.02em',
              }}>
                Snap<span style={{ color: THEME.teal }}>.</span>Claps
              </div>
              <p style={{
                fontSize: 12,
                color: 'rgba(255,255,255,0.5)',
                margin: 0,
                fontFamily: THEME.fonts.inter,
              }}>
                © 2026 SnapClaps. All rights reserved.
              </p>
            </div>

            {/* Right side text */}
            <p style={{
              fontSize: 12,
              color: 'rgba(255,255,255,0.5)',
              margin: 0,
              fontFamily: THEME.fonts.inter,
              textAlign: 'right',
            }}>
              We watch deals. You book trips.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
