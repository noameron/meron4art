import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import ContactForm, { buildMailto } from '@/components/ContactForm';
import en from '@/messages/en.json';

function formData(entries: Record<string, string>) {
  const data = new FormData();
  for (const [k, v] of Object.entries(entries)) data.set(k, v);
  return data;
}

describe('ContactForm', () => {
  it('renders required name, email, and message fields', () => {
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <ContactForm to="omri@example.com" />
      </NextIntlClientProvider>,
    );
    expect(screen.getByLabelText('Name')).toBeRequired();
    expect(screen.getByLabelText('Email')).toBeRequired();
    expect(screen.getByLabelText('Message')).toBeRequired();
    expect(screen.getByLabelText('Phone')).not.toBeRequired();
    expect(
      screen.getByRole('button', { name: 'Send Message' }),
    ).toBeInTheDocument();
  });

  it('buildMailto encodes sender details and message into the link', () => {
    const href = buildMailto(
      'omri@example.com',
      formData({
        name: 'Dana Levi',
        email: 'dana@example.com',
        phone: '050-1234567',
        message: 'Hello & welcome',
      }),
    );
    expect(href).toMatch(/^mailto:omri@example\.com\?subject=/);
    expect(href).toContain(encodeURIComponent('Message from Dana Levi'));
    expect(href).toContain(encodeURIComponent('Hello & welcome'));
    expect(href).toContain(encodeURIComponent('050-1234567'));
  });

  it('buildMailto omits the phone parenthetical when phone is empty', () => {
    const href = buildMailto(
      'omri@example.com',
      formData({ name: 'Dana', email: 'd@e.com', phone: '', message: 'hi' }),
    );
    expect(decodeURIComponent(href)).toContain('Dana (d@e.com)');
  });
});
