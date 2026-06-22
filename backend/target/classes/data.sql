-- Initial Data for Index Funds
INSERT INTO index_funds (id, name, ticker, isin, historical_return1y, historical_return5y, risk_rating, ter, region, category, volatility, beta) VALUES 
('f1', 'Vanguard Global Stock Index Fund', 'VGS', 'IE00B03HCZ61', 18.5, 12.3, 6, 0.18, 'Global', 'Equity', 15.2, 1.0),
('f2', 'iShares S&P 500 Index Fund', 'ISP500', 'IE0031442068', 24.1, 14.8, 6, 0.07, 'USA', 'Equity', 16.5, 1.05),
('f3', 'Amundi MSCI Emerging Markets', 'AEM', 'LU0996177134', 8.2, 5.4, 6, 0.20, 'Emerging', 'Equity', 18.1, 1.15),
('f4', 'Vanguard Euro Government Bond', 'VEGB', 'IE0007472115', 2.1, 1.5, 3, 0.12, 'Europe', 'Fixed Income', 6.2, 0.4);

-- Initial Data for Remunerated Accounts
INSERT INTO remunerated_accounts (id, name, percentage_tae, payout_frequency, liquidity, risk_rating, logo_url, conditions) VALUES 
('a1', 'Cuenta Online Banco Sabadell', 2.50, 'mensual', 'Inmediata', 1, 'https://upload.wikimedia.org/wikipedia/commons/4/41/Banco_Sabadell_logo.svg', 'Sin comisiones. Saldo máximo a remunerar 30.000€'),
('a2', 'Cuenta Inteligente EVO', 2.85, 'mensual', 'Inmediata', 1, 'https://upload.wikimedia.org/wikipedia/commons/e/e9/EVO_Banco.svg', 'Sin comisiones, todo online.'),
('a3', 'MyInvestor Cuenta Remunerada', 2.50, 'mensual', 'Inmediata', 1, 'https://myinvestor.es/wp-content/themes/myinvestor/assets/img/logo.svg', 'Hasta 70.000€ durante el primer año.');
