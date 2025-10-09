"use client";

import React, { useState, useEffect } from 'react';

interface CookieConsentBannerProps {
  onAccept: () => void;
  onDecline: () => void;
  isVisible: boolean;
}

const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({ 
  onAccept, 
  onDecline, 
  isVisible 
}) => {
  if (!isVisible) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.banner}>
        <div style={styles.content}>
          <h3 style={styles.title}>🍪 쿠키 사용 동의</h3>
          <p style={styles.message}>
            이 사이트는 로그인 상태를 유지하기 위해 필수 쿠키를 사용합니다.
            <br />
            안전한 인증을 위해 HttpOnly 쿠키가 필요하며, 개인정보는 수집하지 않습니다.
          </p>
          <div style={styles.details}>
            <strong>사용되는 쿠키:</strong>
            <ul style={styles.list}>
              <li>auth_token: 로그인 인증 정보 (2시간 유효)</li>
              <li>보안: HttpOnly, Secure, SameSite=Strict</li>
            </ul>
          </div>
          <div style={styles.buttonContainer}>
            <button 
              onClick={onAccept}
              style={styles.acceptButton}
            >
              동의하고 계속하기
            </button>
            <button 
              onClick={onDecline}
              style={styles.declineButton}
            >
              거부
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10000,
  },
  banner: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    maxWidth: '500px',
    width: '90%',
    maxHeight: '80vh',
    overflow: 'auto',
  },
  content: {
    textAlign: 'left',
  },
  title: {
    margin: '0 0 16px 0',
    color: '#333',
    fontSize: '20px',
    fontWeight: 'bold',
  },
  message: {
    margin: '0 0 20px 0',
    color: '#555',
    lineHeight: '1.5',
    fontSize: '14px',
  },
  details: {
    backgroundColor: '#f8f9fa',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '24px',
    fontSize: '13px',
    color: '#666',
  },
  list: {
    margin: '8px 0 0 20px',
    padding: 0,
  },
  buttonContainer: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
  },
  acceptButton: {
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    transition: 'background-color 0.2s',
  },
  declineButton: {
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background-color 0.2s',
  },
};

export default CookieConsentBanner;