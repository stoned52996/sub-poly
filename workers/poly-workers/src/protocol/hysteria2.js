class Hysteria2Converter {
    static parse(link) {
        const url = new URL(link.replace('hysteria2://', 'https://'));
        const params = new URLSearchParams(url.search);
        console.log('url' + url)
        console.log('params' + params)
        return {
            name: decodeURIComponent(url.hash.substring(1)) || 'Hysteria2 Node',
            type: 'hysteria2',
            server: url.hostname,
            insecure: url.insecure,
            port: parseInt(url.port) || 443,
            ports: params.get('mport'),
            mport: params.get('mport'),
            password: url.username,
            udp: true,
            obfs: params.get('obfs') || '',
            'obfs-password': params.get('obfs-password') || '',
            sni: params.get('sni') || url.hostname,
            'skip-cert-verify': params.get('insecure') === '1',
            alpn: params.get('alpn') ? params.get('alpn').split(',') : ['h3']
        };
    }
}

export default Hysteria2Converter;