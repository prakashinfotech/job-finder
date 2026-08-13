'use client';

import { JobFinderLogo } from '../../components/logo';

export default function ContactUsPage() {
  return (
    <main className="contact-page">
      <header className="topbar">
        <div className="container topbar-inner">
          <div className="brand-and-nav">
            <a className="brand" href="/" aria-label="JobFinder home">
              <JobFinderLogo />
            </a>
          </div>
          <div className="topbar-actions">
            <a className="text-link" href="/">Home</a>
            <a className="text-link" href="/contact-us">Contact Us</a>
            <a className="text-link" href="/">Download JobFinder app</a>
            <a className="text-link" href="/">Login</a>
          </div>
        </div>
      </header>

      <section className="contact-hero">
        <div className="container">
          <h1>Get in touch</h1>
          <p>We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.</p>
        </div>
      </section>

      <section className="contact-content">
        <div className="container contact-grid">
          <div className="contact-form-section">
            <h2>Send us a message</h2>
            <form className="contact-form">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="Your name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="your.email@example.com"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>

              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <select id="subject" name="subject" required>
                  <option value="">Select a subject</option>
                  <option value="general">General Inquiry</option>
                  <option value="support">Technical Support</option>
                  <option value="feedback">Feedback</option>
                  <option value="partnership">Partnership</option>
                  <option value="complaint">Complaint</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  placeholder="Tell us more about your inquiry..."
                  rows={6}
                  required
                />
              </div>

              <button type="submit" className="primary-button">
                Send Message
              </button>
            </form>
          </div>

          <div className="contact-info-section">
            <h2>Contact Information</h2>

            <div className="contact-info-card">
              <h3>📧 Email</h3>
              <p>
                For general inquiries:
                <br />
                <a href="mailto:support@jobfinder.co">support@jobfinder.co</a>
              </p>
              <p>
                For escalations:
                <br />
                <a href="mailto:support@jobfinder.co">support@jobfinder.co</a>
              </p>
            </div>

            <div className="contact-info-card">
              <h3>🔗 Follow Us</h3>
              <div className="social-links">
                <a href="https://facebook.com/JobFinder" target="_blank" rel="noopener noreferrer">
                  Facebook
                </a>
                <a href="https://linkedin.com/company/jobfinder" target="_blank" rel="noopener noreferrer">
                  LinkedIn
                </a>
                <a href="https://twitter.com/jobfinder" target="_blank" rel="noopener noreferrer">
                  Twitter
                </a>
                <a href="https://instagram.com/jobfinder" target="_blank" rel="noopener noreferrer">
                  Instagram
                </a>
              </div>
            </div>

            <div className="contact-info-card">
              <h3>❓ FAQs</h3>
              <ul>
                <li>
                  <a href="/">How to delete your JobFinder account</a>
                </li>
                <li>
                  <a href="/">Troubleshooting common issues</a>
                </li>
                <li>
                  <a href="/">Account security</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <footer className="contact-footer">
        <div className="container">
          <p>&copy; 2026 JobFinder | All rights reserved</p>
          <div className="footer-links">
            <a href="/">Privacy Policy</a>
            <a href="/">Terms &amp; Conditions</a>
            <a href="/">Help Center</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
