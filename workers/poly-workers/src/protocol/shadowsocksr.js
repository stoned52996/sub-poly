class ShadowsocksRConverter {
    static parse(link) {
        const ssrLink = link.replace('ssr://', '');
        const decoded = atob(ssrLink);
        const [serverPart, paramsPart] = decoded.split('/?');
        
        const [server, port, protocol, method, obfs, passwordBase64] = serverPart.split(':');
        const params = new URLSearchParams(paramsPart);
        
        const obfsParam = atob(params.get('obfsparam') || '');
        const protocolParam = atob(params.get('protoparam') || '');
        const remarks = params.get('remarks') ? atob(params.get('remarks')) : '';
        
        return {
            name: remarks || 'SSR Node',
            type: 'ssr',
            server,
            port: parseInt(port),
            protocol,
            'protocol-param': protocolParam,
            obfs,
            'obfs-param': obfsParam,
            cipher: method,
            password: atob(passwordBase64),
            udp: true
        };
    }
}

export default ShadowsocksRConverter;