class TrojanConverter {
    static parse(link) {
        const url = new URL(link.replace('trojan://', 'https://'));
        const params = new URLSearchParams(url.search);

        // return {
        //     name: decodeURIComponent(url.hash.substring(1)) || 'Trojan Node',
        //     type: 'trojan',
        //     server: url.hostname,
        //     port: parseInt(url.port) || 443,
        //     password: url.username,
        //     udp: true,
        //     sni: params.get('sni') || url.hostname,
        //     'skip-cert-verify': params.get('allowInsecure') === '1',
        //     alpn: params.get('alpn') ? params.get('alpn').split(',') : undefined
        // };

        return {
            name: decodeURIComponent(url.hash.substring(1)) || 'Trojan Node',
            type: 'trojan',
            server: url.hostname,
            port: parseInt(url.port) || 443,
            password: url.username,
            udp: true
        };
    }
}
export default TrojanConverter;