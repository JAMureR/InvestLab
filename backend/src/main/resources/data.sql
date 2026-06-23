-- Datos iniciales: Fondos Indexados (sincronizados con el catálogo del frontend)
INSERT INTO index_funds (id, name, ticker, isin, historical_return1y, historical_return5y, risk_rating, ter, region, category, volatility, beta) VALUES
('vanguard-sp500', 'Vanguard S&P 500 UCITS ETF', 'VUSA.L', 'IE00B3XXRP09', 12.4, 11.8, 6, 0.0007, 'EE.UU.', 'Renta Variable Global Larga Cap', 14.2, 1.00),
('vanguard-allworld', 'Vanguard FTSE All-World UCITS ETF', 'VWRL.L', 'IE00B3RBWM25', 9.8, 8.9, 5, 0.0022, 'Global', 'Renta Variable Global Mixta', 12.8, 0.94),
('ishares-msciworld', 'iShares Core MSCI World UCITS ETF', 'IWDA.L', 'IE00B4L5Y983', 10.2, 9.2, 5, 0.0020, 'Países Desarrollados', 'Renta Variable Global Desarrollada', 13.1, 0.96),
('amundi-msciworld', 'Amundi MSCI World UCITS ETF', 'CW8.PAR', 'LU1681043599', 10.1, 9.1, 5, 0.0038, 'Global', 'Renta Variable Global', 13.2, 0.97),
('fidelity-msciworld', 'Fidelity MSCI World Index Fund', 'PMEH.F', 'IE00BYXVG742', 10.3, 9.3, 5, 0.0012, 'Países Desarrollados', 'Fondo de Inversión Indexado', 13.0, 0.96),
('amundi-emerging', 'Amundi MSCI Emerging Markets ETF', 'AEEM.PA', 'LU1681045370', 6.8, 5.2, 6, 0.0020, 'Emergentes', 'Renta Variable Emergente', 16.5, 1.12);

-- Datos iniciales: Cuentas Remuneradas (sincronizados con el catálogo del frontend)
INSERT INTO remunerated_accounts (id, name, percentagetae, payout_frequency, liquidity, risk_rating, logo_url, conditions) VALUES
('trade-republic', 'Trade Republic Cuenta de Efectivo', 3.75, 'mensual', 'Inmediata (Sin penalización)', 1, NULL, 'Intereses pagados mensualmente sobre saldos de hasta 50.000 €; protegido por FGD de hasta 100.000 €.'),
('revolut-flexible', 'Revolut Cuenta Flexible (Pro)', 3.10, 'mensual', 'Inmediata', 2, NULL, 'Sujeto a retención. Variación según el plan suscrito (el interés se calcula diariamente y se liquida mensualmente).'),
('n26-ahorro', 'N26 Cuenta de Ahorro', 3.00, 'mensual', 'Inmediata', 1, NULL, 'Sin cantidad mínima ni máxima. Cobertura del Fondo de Garantía de Depósitos alemán regulado por el Bundesbank.'),
('norwegian-savings', 'Bank Norwegian Ahorro Plus', 3.30, 'anual', 'Inmediata (Limitado a 6 retiros gratis al año)', 1, NULL, 'Banco noruego. Interés calculado diariamente y pagado anualmente. Retenciones deben declararse en el IRPF.'),
('renault-bank', 'Renault Bank Cuenta Contigo', 2.89, 'mensual', 'Inmediata', 1, NULL, 'Liquidación mensual de intereses. Contratación 100% digital, sin gastos de comisión por administración o mantenimiento.');
