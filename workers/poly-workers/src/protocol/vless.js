class VlessConverter {
    static parse(link) {
        const url = new URL(link.replace('vless://', 'https://'));
        const params = new URLSearchParams(url.search);

        const config = {
            name: decodeURIComponent(url.hash.substring(1)) || 'VLESS Node',
            type: 'vless',
            server: url.hostname,
            port: parseInt(url.port),
            uuid: url.username,
            udp: true,
            tls: true,
            network: params.get('type') || 'tcp',
            'skip-cert-verify': params.get('allowInsecure') === '1',
            servername: params.get('sni') || url.hostname,
            flow: params.get('flow') || ''
        };

        // 处理 WS 配置
        if (config.network === 'ws') {
            config['ws-opts'] = {
                path: params.get('path') || '/',
                headers: {
                    Host: params.get('host') || url.hostname
                }
            };
        }

        // 处理 GRPC 配置
        if (config.network === 'grpc') {
            config['grpc-opts'] = {
                'grpc-service-name': params.get('serviceName') || ''
            };
        }

        // 处理 Reality 配置
        if (params.get('security') === 'reality') {
            config.reality = true;
            config['reality-opts'] = {
                'public-key': params.get('pbk') || '',
                'short-id': params.get('sid') || ''
            };
        }

        return config;
    }
}
export default VlessConverter;