class VmessConverter {
    static parse(link) {
        console.log("11111111111111111111111")
        const vmessLink = link.replace('vmess://', '');
        let config;
        try {
            config = JSON.parse(atob(vmessLink));
        } catch (e) {
            throw new Error('Invalid VMess link');
        }

        return {
            name: config.ps || 'VMess Node',
            server: config.add,
            port: parseInt(config.port),
            type: 'vmess',
            uuid: config.id,
            alterId: parseInt(config.aid),
            cipher: config.type || 'auto',
            udp: true,
            tls: config.tls === 'tls'? true : false,
            'skip-cert-verify': config.verify_cert === false,
            network: config.net || 'tcp',
            'ws-opts': config.net === 'ws' ? {
                path: config.path || '/',
                headers: {
                    Host: config.host || config.add
                }
            } : undefined,
            'grpc-opts': config.net === 'grpc' ? {
                'grpc-service-name': config.path || ''
            } : undefined
        };
    }
}
export default VmessConverter;