-- Datos iniciales: Fondos Indexados (sincronizados con el catálogo del frontend, actualizados a junio de 2026)
MERGE INTO index_funds (id, name, ticker, isin, historical_return1y, historical_return5y, risk_rating, ter, region, category, volatility, beta) KEY(id) VALUES
('vanguard-sp500', 'Vanguard S&P 500 UCITS ETF', 'VUSA.L', 'IE00B3XXRP09', 26.5, 14.2, 6, 0.0007, 'EE.UU.', 'Renta Variable Global Larga Cap', 12.5, 1.00),
('vanguard-allworld', 'Vanguard FTSE All-World UCITS ETF', 'VWRL.L', 'IE00B3RBWM25', 20.8, 10.9, 5, 0.0022, 'Global', 'Renta Variable Global Mixta', 11.2, 0.94),
('ishares-msciworld', 'iShares Core MSCI World UCITS ETF', 'IWDA.L', 'IE00B4L5Y983', 21.5, 11.6, 5, 0.0020, 'Países Desarrollados', 'Renta Variable Global Desarrollada', 11.5, 0.96),
('amundi-msciworld', 'Amundi MSCI World UCITS ETF', 'CW8.PAR', 'LU1681043599', 21.4, 11.5, 5, 0.0038, 'Global', 'Renta Variable Global', 11.6, 0.97),
('fidelity-msciworld', 'Fidelity MSCI World Index Fund', 'PMEH.F', 'IE00BYXVG742', 21.6, 11.7, 5, 0.0012, 'Países Desarrollados', 'Fondo de Inversión Indexado', 11.4, 0.96),
('amundi-emerging', 'Amundi MSCI Emerging Markets ETF', 'AEEM.PA', 'LU1681045370', 9.8, 5.2, 6, 0.0020, 'Emergentes', 'Renta Variable Emergente', 15.2, 1.12);

-- Datos iniciales: Cuentas Remuneradas (sincronizados con el catálogo del frontend, actualizados a junio de 2026)
MERGE INTO remunerated_accounts (id, name, percentagetae, payout_frequency, liquidity, risk_rating, logo_url, conditions) KEY(id) VALUES
('trade-republic', 'Trade Republic Cuenta de Efectivo', 3.04, 'mensual', 'Inmediata (Sin penalización)', 1, NULL, 'Intereses pagados mensualmente sobre saldos ilimitados; protegido por FGD de hasta 100.000 €.'),
('revolut-flexible', 'Revolut Cuenta Flexible (Pro)', 3.51, 'mensual', 'Inmediata', 2, NULL, 'Sujeto a retención. Variación según el plan suscrito (el interés se calcula diariamente y se liquida mensualmente).'),
('n26-ahorro', 'N26 Cuenta de Ahorro', 1.30, 'mensual', 'Inmediata', 1, NULL, 'Sin cantidad mínima. Remuneración variable según suscripción. Cobertura del FGD alemán.'),
('norwegian-savings', 'Bank Norwegian Ahorro Plus', 2.51, 'anual', 'Inmediata (Limitado a 6 retiros gratis al año)', 1, NULL, 'Banco noruego. Interés calculado diariamente y pagado anualmente. Retenciones deben declararse en el IRPF.'),
('renault-bank', 'Renault Bank Cuenta Contigo', 2.17, 'mensual', 'Inmediata', 1, NULL, 'Liquidación mensual de intereses. Contratación 100% digital, sin comisiones de administración o mantenimiento.');

-- Inserción del usuario administrador por defecto (password: 'admin123')
MERGE INTO users (username, email, password, role, created_at) KEY(username) VALUES
('admin', 'admin@investlab.com', '$2a$10$gkyfTWImGrCV.bznWNBXlOjkqXnV/2Qr8e8hpFV5J8/SkU0Txnbiq', 'ROLE_ADMIN', CURRENT_TIMESTAMP);
