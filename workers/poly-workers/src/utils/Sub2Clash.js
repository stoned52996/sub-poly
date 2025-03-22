import VmessConverter from '../protocol/vmess.js';
import TrojanConverter from '../protocol/trojan.js';
import ShadowsocksConverter from '../protocol/shadowsocks.js';
import ShadowsocksRConverter from '../protocol/shadowsocksr.js';
import HysteriaConverter from '../protocol/hysteria.js';
import Hysteria2Converter from '../protocol/hysteria2.js';

class Sub2Clash {
    // 协议转换入口
    static convert(protocol, link) {
        switch (protocol) {
            case 'vmess': return VmessConverter.parse(link);
            case 'trojan': return TrojanConverter.parse(link);
            case 'ss': return ShadowsocksConverter.parse(link);
            case 'ssr': return ShadowsocksRConverter.parse(link);
            case 'hysteria': return HysteriaConverter.parse(link);
            case 'hysteria2': return Hysteria2Converter.parse(link);
            default: throw new Error(`不支持的协议: ${protocol}`);
        }
    }
}

export default Sub2Clash;