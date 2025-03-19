CREATE TABLE IF NOT EXISTS airports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(255) NOT NULL,
  subscription_url VARCHAR(255) NOT NULL,
  remarks VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_enabled BOOLEAN DEFAULT 1
);

CREATE TABLE IF NOT EXISTS rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  rule_type VARCHAR(255) NOT NULL,
  rule_param VARCHAR(255),
  rule_config INTEGER NOT NULL,
  resolve_dns VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS groups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  group_name VARCHAR(255) NOT NULL,
  group_type VARCHAR(255) NOT NULL,
  url VARCHAR(255),
  interval INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS common (
  type VARCHAR(255) NOT NULL,
  json TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO common (type, json) VALUES ('config', '{"mixed-port":7890,"allow-lan":false,"bind-address":"*","mode":"rule","log-level":"info","external-controller":"127.0.0.1:9090","unified-delay":true,"tcp-concurrent":true,"dns":{"enable":true,"ipv6":false,"default-nameserver":["223.5.5.5","119.29.29.29"],"enhanced-mode":"fake-ip","fake-ip-range":"198.18.0.1/16","use-hosts":true,"nameserver":["https://dns.alidns.com/dns-query","https://doh.pub/dns-query"],"fallback":["https://dns.alidns.com/dns-query","https://doh.pub/dns-query"],"fallback-filter":{"geoip":true,"ipcidr":["240.0.0.0/4","0.0.0.0/32"]}}}');

INSERT INTO common (type, json) VALUES ('token', '{"token":"icu996"}');

