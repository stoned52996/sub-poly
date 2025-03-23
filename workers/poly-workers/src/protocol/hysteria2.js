class Hysteria2Converter {
    static parse(link) {
        const url = new URL(link.replace('hysteria2://', 'https://'));
        const params = new URLSearchParams(url.search);

        return {
            name: decodeURIComponent(url.hash.substring(1)) || 'Hysteria2 Node',
            type: 'hysteria2',
            server: url.hostname,
            insecure: url.insecure,
            port: parseInt(url.port),
            ports: url.mport,
            mport: url.mport,
            password: url.username,
            udp: true,
            'skip-cert-verify': true,
            obfs: params.get('obfs') || '',
            'obfs-password': params.get('obfs-password') || '',
            sni: params.get('sni') || url.hostname,
            'skip-cert-verify': params.get('insecure') === '1',
            alpn: params.get('alpn') ? params.get('alpn').split(',') : ['h3']
        };
    }
}

export default Hysteria2Converter;