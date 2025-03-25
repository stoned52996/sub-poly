class HysteriaConverter {
    static parse(link) {
        const url = new URL(link.replace('hysteria://', 'https://'));
        const params = new URLSearchParams(url.search);

        return {
            name: decodeURIComponent(url.hash.substring(1)) || 'Hysteria Node',
            type: 'hysteria',
            server: url.hostname,
            port: parseInt(url.port) || 443,
            auth_str: params.get('auth') || '',
            obfs: params.get('obfs') || '',
            alpn: params.get('alpn') ? params.get('alpn').split(',') : ['h3'],
            protocol: params.get('protocol') || 'udp',
            up: params.get('up') || '100',
            down: params.get('down') || '100',
            'skip-cert-verify': params.get('insecure') === '1'
        };
    }
}

export default HysteriaConverter;